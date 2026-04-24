'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { VisitaEstado } from '@/types/visitas';
import { uploadToSpaces, deleteFromSpaces } from '@/lib/s3';

/**
 * Registra una nueva planeación de visita
 */
export async function createPlaneacionVisita(data: {
    idSede: number;
    fecha: string; // YYYY-MM-DD
}) {
    try {
        await db.execute(`
            INSERT INTO PSC_VISITA (SE_IDSEDE_FK, VI_FECHA_PLANEADA, VI_ESTADO)
            VALUES (?, ?, 'PLANEADA')
        `, [data.idSede, data.fecha]);

        revalidatePath('/visitas');
        return { success: true };
    } catch (error) {
        console.error('Error al planear visita:', error);
        return { success: false, error: 'Error al registrar la planeación' };
    }
}

/**
 * Guarda el catálogo de tareas (Crear/Editar)
 */
export async function upsertVisitaTarea(data: {
    id?: number;
    nombre: string;
    descripcion?: string;
    activo: 'SI' | 'NO';
}) {
    try {
        if (data.id) {
            await db.execute(`
                UPDATE PSC_VISITA_TAREA SET VT_NOMBRE = ?, VT_DESCRIPCION = ?, VT_ACTIVO = ?
                WHERE VT_IDTAREA_PK = ?
            `, [data.nombre, data.descripcion || '', data.activo, data.id]);
        } else {
            await db.execute(`
                INSERT INTO PSC_VISITA_TAREA (VT_NOMBRE, VT_DESCRIPCION, VT_ACTIVO)
                VALUES (?, ?, ?)
            `, [data.nombre, data.descripcion || '', data.activo]);
        }
        revalidatePath('/visitas');
        return { success: true };
    } catch (error) {
        console.error('Error al gestionar tarea:', error);
        return { success: false, error: 'Error al guardar la tarea' };
    }
}

/**
 * Elimina físicamente una tarea del catálogo
 */
export async function deleteVisitaTarea(id: number) {
    try {
        await db.execute(`DELETE FROM PSC_VISITA_TAREA WHERE VT_IDTAREA_PK = ?`, [id]);
        revalidatePath('/visitas');
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        return { success: false, error: 'No se puede eliminar la tarea porque ya ha sido utilizada en visitas registradas.' };
    }
}

/**
 * Registra la ejecución de una visita con sus resultados
 */
export async function executeVisita(idVisita: number, resultados: {
    idTarea: number;
    hallazgo: string;
    imagenes: string[];
}[]) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Actualizar estado de la visita
        await connection.execute(`
            UPDATE PSC_VISITA SET VI_ESTADO = 'EJECUTADA', VI_FECHA_EJECUCION = NOW()
            WHERE VI_IDVISITA_PK = ?
        `, [idVisita]);

        // 2. Limpiar resultados previos (Borrado Físico en la nube + Borrado en Cascada en DB)
        const [oldImages]: any = await connection.execute(`
            SELECT VIM_URL FROM PSC_VISITA_IMAGEN 
            JOIN PSC_VISITA_DETALLE ON PSC_VISITA_IMAGEN.VD_IDDETALLE_FK = PSC_VISITA_DETALLE.VD_IDDETALLE_PK
            WHERE PSC_VISITA_DETALLE.VI_IDVISITA_FK = ?
        `, [idVisita]);

        for (const img of oldImages) {
            await deleteFromSpaces(img.VIM_URL);
        }

        await connection.execute(`
            DELETE FROM PSC_VISITA_DETALLE WHERE VI_IDVISITA_FK = ?
        `, [idVisita]);

        // 3. Insertar nuevos resultados e imágenes
        for (const res of resultados) {
            const [resultHeader]: any = await connection.execute(`
                INSERT INTO PSC_VISITA_DETALLE (VI_IDVISITA_FK, VT_IDTAREA_FK, VD_HALLAZGO)
                VALUES (?, ?, ?)
            `, [idVisita, res.idTarea, res.hallazgo]);

            const idDetalle = resultHeader.insertId;

            for (const imgUrl of res.imagenes) {
                await connection.execute(`
                    INSERT INTO PSC_VISITA_IMAGEN (VD_IDDETALLE_FK, VIM_URL)
                    VALUES (?, ?)
                `, [idDetalle, imgUrl]);
            }
        }

        await connection.commit();
        revalidatePath('/visitas');
        return { success: true };
    } catch (error) {
        await connection.rollback();
        console.error('Error al ejecutar visita:', error);
        return { success: false, error: 'Error al registrar la ejecución' };
    } finally {
        connection.release();
    }
}


/**
 * Acción para subir múltiples imágenes de evidencia a la nube (DigitalOcean Spaces)
 */
export async function uploadEvidencePhotos(formData: FormData) {
    try {
        const photos = formData.getAll('photos') as File[];
        const urls: string[] = [];

        for (const photo of photos) {
            const buffer = Buffer.from(await photo.arrayBuffer());
            const filename = `evidencia_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;

            // Subir a DigitalOcean Spaces
            const publicUrl = await uploadToSpaces(buffer, filename, 'visitas');
            urls.push(publicUrl);
        }

        return { success: true, urls };
    } catch (error) {
        console.error('Error al subir fotos:', error);
        return { success: false, error: 'Error al procesar imágenes' };
    }
}

/**
 * Elimina una visita completa y todas sus imágenes asociadas de la nube
 */
export async function deleteVisita(idVisita: number) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Buscar todas las URLs de imágenes de esta visita
        const [images]: any = await connection.execute(`
            SELECT VIM_URL FROM PSC_VISITA_IMAGEN 
            JOIN PSC_VISITA_DETALLE ON PSC_VISITA_IMAGEN.VD_IDDETALLE_FK = PSC_VISITA_DETALLE.VD_IDDETALLE_PK
            WHERE PSC_VISITA_DETALLE.VI_IDVISITA_FK = ?
        `, [idVisita]);

        // 2. Borrar de la nube
        for (const img of images) {
            await deleteFromSpaces(img.VIM_URL);
        }

        // 3. Borrar de la DB (El CASCADE se encarga de detalles e imágenes en DB)
        await connection.execute('DELETE FROM PSC_VISITA WHERE VI_IDVISITA_PK = ?', [idVisita]);

        await connection.commit();
        revalidatePath('/visitas');
        return { success: true };
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar visita:', error);
        return { success: false, error: 'Error al eliminar la visita y sus evidencias' };
    } finally {
        connection.release();
    }
}
