'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';
import { uploadToSpaces, deleteFromSpaces } from '@/lib/s3';

export async function uploadPhoto(formData: FormData, oldPath?: string) {
    try {
        const file = formData.get('photo') as File;
        if (!file) throw new Error('No se recibió ninguna imagen');

        // Borrar imagen anterior si existe en el almacenamiento en la nube
        if (oldPath) {
            await deleteFromSpaces(oldPath);
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}.webp`;

        // Optimizar con Sharp antes de subir
        const optimizedBuffer = await sharp(buffer)
            .resize(600, 800, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

        // Subir a DigitalOcean Spaces en la carpeta 'personal'
        const publicUrl = await uploadToSpaces(optimizedBuffer, fileName, 'personal');

        return { success: true, url: publicUrl };
    } catch (error) {
        console.error('Error uploading photo:', error);
        return { success: false, error: 'Error al procesar la imagen' };
    }
}

export async function updatePersonnel(id: number, data: { 
    cargo?: string, 
    idJefe?: number | null, 
    foto?: string,
    genero?: string,
    activo?: string,
    idCargo?: number,
    idSede?: number | null,
    idPuesto?: number | null,
    idCiudad?: number | null
}) {
    try {
        const fields: string[] = [];
        const values: any[] = [];

        if (data.cargo !== undefined) {
            fields.push('PR_CARGO_LARGO = ?');
            values.push(data.cargo);
        }

        if (data.idJefe !== undefined) {
            fields.push('PR_IDJEFE_FK = ?');
            values.push(data.idJefe);
        }

        if (data.foto !== undefined) {
            fields.push('PR_FOTO_URL = ?');
            values.push(data.foto);
        }

        if (data.genero !== undefined) {
            fields.push('PR_GENERO = ?');
            values.push(data.genero);
        }

        if (data.activo !== undefined) {
            fields.push('PR_ACTIVO = ?');
            values.push(data.activo);
        }

        if (data.idCargo !== undefined) {
            fields.push('CP_IDCARGO_FK = ?');
            values.push(data.idCargo);
        }

        if (data.idSede !== undefined) {
            fields.push('SE_IDSEDE_FK = ?');
            values.push(data.idSede);
        }

        if (data.idPuesto !== undefined) {
            fields.push('PU_IDPUESTO_FK = ?');
            values.push(data.idPuesto);
        }

        if (data.idCiudad !== undefined) {
            fields.push('CI_IDCIUDAD_FK = ?');
            values.push(data.idCiudad);
        }

        if (fields.length === 0) return { success: true };

        values.push(id);
        
        await db.execute(
            `UPDATE PSC_PERSONAL SET ${fields.join(', ')} WHERE PR_IDPERSONAL_PK = ?`,
            values
        );

        revalidatePath('/organigrama');
        return { success: true };
    } catch (error) {
        console.error('Error updating personnel:', error);
        return { success: false, error: 'Error al actualizar el personal' };
    }
}

/**
 * Elimina un registro de personal y su foto asociada de la nube
 */
export async function deletePersonnel(id: number) {
    try {
        // 1. Obtener la URL de la foto actual para borrarla de la nube
        const [rows]: any = await db.query(
            'SELECT PR_FOTO_URL FROM PSC_PERSONAL WHERE PR_IDPERSONAL_PK = ?',
            [id]
        );

        if (rows && rows.length > 0 && rows[0].PR_FOTO_URL) {
            await deleteFromSpaces(rows[0].PR_FOTO_URL);
        }

        // 2. Eliminar de la base de datos
        // Nota: Si hay registros en PSC_ROTACION o PSC_VISITA, el motor impedirá 
        // borrarlo a menos que se use soft-delete o cascada. 
        // Aquí asumimos limpieza o lógica de negocio ya definida.
        await db.execute('DELETE FROM PSC_PERSONAL WHERE PR_IDPERSONAL_PK = ?', [id]);

        revalidatePath('/organigrama');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting personnel:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return { success: false, error: 'No se puede eliminar: El colaborador tiene historial de rotación o visitas.' };
        }
        return { success: false, error: 'Error al eliminar el personal' };
    }
}

export async function createPersonnel(data: { 
    nombre: string, 
    cargo: string, 
    idJefe?: number | null, 
    genero?: string, 
    foto?: string,
    activo?: string,
    idCargo?: number,
    idSede?: number | null,
    idPuesto?: number | null,
    idCiudad?: number | null
}) {
    try {
        await db.execute(
            `INSERT INTO PSC_PERSONAL (PR_NOMBRE, PR_CARGO_LARGO, PR_IDJEFE_FK, PR_GENERO, CP_IDCARGO_FK, PR_FOTO_URL, PR_ACTIVO, SE_IDSEDE_FK, PU_IDPUESTO_FK, CI_IDCIUDAD_FK) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.nombre, 
                data.cargo, 
                data.idJefe || null, 
                data.genero || 'HOMBRE',
                data.idCargo || 2,
                data.foto || null,
                data.activo || 'SI',
                data.idSede || null,
                data.idPuesto || null,
                data.idCiudad || null
            ]
        );

        revalidatePath('/organigrama');
        return { success: true };
    } catch (error) {
        console.error('Error creating personnel:', error);
        return { success: false, error: 'Error al crear el personal' };
    }
}

export async function getPersonnelList() {
    try {
        const [rows] = await db.query('SELECT PR_IDPERSONAL_PK as id, PR_NOMBRE as nombre FROM PSC_PERSONAL WHERE PR_ACTIVO = "SI" ORDER BY PR_NOMBRE ASC');
        return rows as { id: number, nombre: string }[];
    } catch (error) {
        console.error('Error fetching personnel list:', error);
        return [];
    }
}

export async function getCargos() {
    try {
        const [rows] = await db.query('SELECT CP_IDCARGO_PK as id, CP_NOMBRE as nombre FROM PSC_CARGO_PERSONAL WHERE CP_ACTIVO = "SI" ORDER BY CP_NOMBRE ASC');
        return rows as { id: number, nombre: string }[];
    } catch (error) {
        console.error('Error fetching cargos list:', error);
        return [];
    }
}

export async function getSedes() {
    try {
        const [rows] = await db.query('SELECT SE_IDSEDE_PK as id, SE_NOMBRE as nombre, CI_IDCIUDAD_FK as idZona FROM PSC_SEDE WHERE SE_ACTIVO = "SI" ORDER BY SE_NOMBRE ASC');
        return rows as { id: number, nombre: string, idZona: number }[];
    } catch (error) {
        console.error('Error fetching sedes:', error);
        return [];
    }
}

export async function getZonas() {
    try {
        const [rows] = await db.query('SELECT CI_IDCIUDAD_PK as id, CI_NOMBRE as nombre FROM PSC_CIUDAD ORDER BY CI_NOMBRE ASC');
        return rows as { id: number, nombre: string }[];
    } catch (error) {
        console.error('Error fetching zonas:', error);
        return [];
    }
}

export async function getPuestos() {
    try {
        const [rows] = await db.query('SELECT PU_IDPUESTO_PK as id, PU_NOMBRE as nombre, SE_IDSEDE_FK as idSede FROM PSC_PUESTO WHERE PU_ACTIVO = "SI" ORDER BY PU_NOMBRE ASC');
        return rows as { id: number, nombre: string, idSede: number }[];
    } catch (error) {
        console.error('Error fetching puestos:', error);
        return [];
    }
}
