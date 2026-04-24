'use server';

import { db } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Puesto, ModalidadPuesto } from '@/types/puesto';
import { revalidatePath } from 'next/cache';

export async function getPuestosBySede(idSede: number) {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT 
                P.PU_IDPUESTO_PK as id,
                P.PU_NOMBRE as nombre,
                P.MP_IDMODALIDAD_FK as idModalidad,
                M.MP_NOMBRE as modalidad,
                P.PU_ACTIVO as activo,
                (SELECT COUNT(*) FROM PSC_PERSONAL PR WHERE PR.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK AND PR.PR_ACTIVO = 'SI') as cantidad
            FROM PSC_PUESTO P
            LEFT JOIN PSC_MODALIDAD_PUESTO M ON P.MP_IDMODALIDAD_FK = M.MP_IDMODALIDAD_PK
            WHERE P.SE_IDSEDE_FK = ?
            ORDER BY P.PU_NOMBRE ASC
        `, [idSede]);

        return { success: true, data: rows as Puesto[] };
    } catch (error) {
        console.error('Error fetching puestos:', error);
        return { success: false, error: 'Error al obtener los puestos' };
    }
}

export async function getModalidades() {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT MP_IDMODALIDAD_PK as id, MP_NOMBRE as nombre 
            FROM PSC_MODALIDAD_PUESTO 
            ORDER BY MP_NOMBRE ASC
        `);
        return { success: true, data: rows as ModalidadPuesto[] };
    } catch (error) {
        return { success: false, error: 'Error al obtener modalidades' };
    }
}

export async function updatePuesto(id: number, data: Partial<Puesto>) {
    try {
        const updates: string[] = [];
        const values: any[] = [];

        if (data.nombre !== undefined) {
            updates.push('PU_NOMBRE = ?');
            values.push(data.nombre);
        }
        if (data.idModalidad !== undefined) {
            updates.push('MP_IDMODALIDAD_FK = ?');
            values.push(data.idModalidad === 0 ? null : data.idModalidad);
        }
        if (data.activo !== undefined) {
            updates.push('PU_ACTIVO = ?');
            values.push(data.activo);
        }

        if (updates.length === 0) return { success: true };

        values.push(id);
        const [result] = await db.query<ResultSetHeader>(`
            UPDATE PSC_PUESTO SET ${updates.join(', ')} WHERE PU_IDPUESTO_PK = ?
        `, values);

        revalidatePath('/seguridad-fisica');
        return { success: true };
    } catch (error) {
        console.error('Error updating puesto:', error);
        return { success: false, error: 'Error al actualizar el puesto' };
    }
}
