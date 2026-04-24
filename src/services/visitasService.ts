import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { VisitaCronogramaRow, VisitaEstado, VisitaTarea } from '@/types/visitas';

/**
 * Obtiene los datos para el cronograma anual de visitas
 * Solo devuelve sedes que tengan al menos una visita planeada para el año
 */
export async function getVisitasCronograma(anio: number): Promise<VisitaCronogramaRow[]> {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT 
            S.SE_IDSEDE_PK as idSede,
            C.CI_NOMBRE as zona,
            S.SE_NOMBRE as site,
            V.VI_IDVISITA_PK as idVisita,
            MONTH(V.VI_FECHA_PLANEADA) as mes,
            LEAST(FLOOR((DAY(V.VI_FECHA_PLANEADA) - 1) / 7) + 1, 4) as semana,
            V.VI_ESTADO as estado
        FROM PSC_SEDE S
        JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
        LEFT JOIN PSC_VISITA V ON S.SE_IDSEDE_PK = V.SE_IDSEDE_FK AND YEAR(V.VI_FECHA_PLANEADA) = ? AND V.VI_ACTIVO = 'SI'
        WHERE S.SE_ACTIVO = 'SI'
        ORDER BY C.CI_NOMBRE, S.SE_NOMBRE
    `, [anio]);

    // Agrupar por sede
    const map = new Map<number, VisitaCronogramaRow>();

    rows.forEach(row => {
        const id = row.idSede;
        if (!map.has(id)) {
            map.set(id, {
                idSede: id,
                zona: row.zona,
                site: row.site,
                plan: {}
            });
        }

        if (row.mes && row.semana) {
            const key = `M${row.mes}-S${row.semana}`;
            if (!map.get(id)!.plan[key]) {
                map.get(id)!.plan[key] = [];
            }
            map.get(id)!.plan[key].push({
                id: row.idVisita,
                idSede: id,
                anio: anio,
                mes: row.mes,
                semana: row.semana,
                estado: row.estado as VisitaEstado
            });
        }
    });

    return Array.from(map.values());
}

/**
 * Obtiene el catálogo de tareas disponibles
 */
export async function getVisitaTareas(): Promise<VisitaTarea[]> {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT 
            VT_IDTAREA_PK as id,
            VT_NOMBRE as nombre,
            VT_DESCRIPCION as descripcion,
            VT_ACTIVO as activo
        FROM PSC_VISITA_TAREA
        WHERE VT_ACTIVO = 'SI'
        ORDER BY VT_NOMBRE ASC
    `);
    
    return rows.map(r => ({
        id: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        activo: r.activo === 'SI'
    }));
}

/**
 * Obtiene los detalles de una visita específica por su ID
 */
export async function getVisitaById(id: number) {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT 
            V.VI_IDVISITA_PK as id,
            V.SE_IDSEDE_FK as idSede,
            V.VI_ESTADO as estado,
            V.VI_FECHA_PLANEADA as fechaPlaneada,
            S.SE_NOMBRE as site,
            C.CI_NOMBRE as zona
        FROM PSC_VISITA V
        JOIN PSC_SEDE S ON V.SE_IDSEDE_FK = S.SE_IDSEDE_PK
        JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
        WHERE V.VI_IDVISITA_PK = ? AND V.VI_ACTIVO = 'SI'
    `, [id]);

    if (rows.length === 0) return null;

    const row = rows[0];
    const fecha = new Date(row.fechaPlaneada);

    const [detalles] = await db.query<RowDataPacket[]>(`
        SELECT 
            VD.VT_IDTAREA_FK as idTarea,
            VT.VT_NOMBRE as nombreTarea,
            VT.VT_DESCRIPCION as descripcionTarea,
            VD.VD_HALLAZGO as hallazgo,
            VD.VD_IDDETALLE_PK as idDetalle
        FROM PSC_VISITA_DETALLE VD
        JOIN PSC_VISITA_TAREA VT ON VD.VT_IDTAREA_FK = VT.VT_IDTAREA_PK
        WHERE VD.VI_IDVISITA_FK = ?
    `, [id]);

    const resultados = await Promise.all(detalles.map(async (d) => {
        const [imagenes] = await db.query<RowDataPacket[]>(`
            SELECT VIM_URL as url FROM PSC_VISITA_IMAGEN WHERE VD_IDDETALLE_FK = ?
        `, [d.idDetalle]);

        return {
            idTarea: d.idTarea,
            nombreTarea: d.nombreTarea,
            descripcionTarea: d.descripcionTarea,
            hallazgo: d.hallazgo,
            fotos: imagenes.map(img => img.url)
        };
    }));

    return {
        id: row.id,
        idSede: row.idSede,
        site: row.site,
        zona: row.zona,
        estado: row.estado,
        anio: fecha.getFullYear(),
        mes: fecha.getMonth() + 1,
        semana: Math.floor((fecha.getDate() - 1) / 7) + 1,
        resultados: resultados
    };
}
