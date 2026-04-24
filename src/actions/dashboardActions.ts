'use server';

import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function getPuestosBySede(idSede: number) {
    try {
        const [rows] = await db.query<RowDataPacket[]>(`
            SELECT 
                P.PU_NOMBRE as nombre,
                M.MP_NOMBRE as modalidad,
                (SELECT COUNT(*) FROM PSC_PERSONAL PR WHERE PR.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK AND PR.PR_ACTIVO = 'SI') as cantidad
            FROM PSC_PUESTO P
            LEFT JOIN PSC_MODALIDAD_PUESTO M ON P.MP_IDMODALIDAD_FK = M.MP_IDMODALIDAD_PK
            WHERE P.SE_IDSEDE_FK = ? AND P.PU_ACTIVO = 'SI'
            ORDER BY P.PU_NOMBRE ASC
        `, [idSede]);

        return { success: true, data: rows };
    } catch (error) {
        console.error('Error fetching puestos:', error);
        return { success: false, error: 'Error al obtener los puestos' };
    }
}
