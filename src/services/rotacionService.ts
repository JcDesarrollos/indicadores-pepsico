import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface RotacionMes {
  mes: string;
  año1: number;
  año2: number;
}

export interface RotacionSede {
  departamento: string;
  sede: string;
  meses: number[]; // 12 posiciones (0-11)
}

export interface RotacionMotivo {
  mes: string;
  descripcion: string;
  cantidad: number;
}

/**
 * Obtiene la comparativa mensual de rotación entre dos años
 */
export async function getComparativaRotacion(anio1: number, anio2: number) {
  try {
    const query = `
      SELECT 
        m.mes_nombre as mes,
        COALESCE(r1.conteo, 0) as año1,
        COALESCE(r2.conteo, 0) as año2
      FROM (
        SELECT 'January' as mes_nombre, 1 as mes_num UNION SELECT 'February', 2 UNION SELECT 'March', 3 UNION 
        SELECT 'April', 4 UNION SELECT 'May', 5 UNION SELECT 'June', 6 UNION 
        SELECT 'July', 7 UNION SELECT 'August', 8 UNION SELECT 'September', 9 UNION 
        SELECT 'October', 10 UNION SELECT 'November', 11 UNION SELECT 'December', 12
      ) m
      LEFT JOIN (
        SELECT MONTH(RO_FECHA) as mes_num, COUNT(*) as conteo 
        FROM PSC_ROTACION 
        WHERE YEAR(RO_FECHA) = ? 
        GROUP BY MONTH(RO_FECHA)
      ) r1 ON m.mes_num = r1.mes_num
      LEFT JOIN (
        SELECT MONTH(RO_FECHA) as mes_num, COUNT(*) as conteo 
        FROM PSC_ROTACION 
        WHERE YEAR(RO_FECHA) = ? 
        GROUP BY MONTH(RO_FECHA)
      ) r2 ON m.mes_num = r2.mes_num
      ORDER BY m.mes_num
    `;

    const [rows] = await db.execute(query, [anio1, anio2]);
    return rows as any[];
  } catch (error) {
    console.error("Error en getComparativaRotacion:", error);
    throw error;
  }
}

/**
 * Obtiene la matriz de rotación por sede mes a mes para un año específico
 */
export async function getRotacionSedeMes(anio: number) {
  try {
    const query = `
      SELECT 
        s.SE_NOMBRE as sede,
        COALESCE(MONTH(r.RO_FECHA), 0) as mes_num,
        COUNT(DISTINCT r.RO_IDROTACION_PK) as conteo
      FROM PSC_SEDE s
      JOIN PSC_CIUDAD c ON s.CI_IDCIUDAD_FK = c.CI_IDCIUDAD_PK
      LEFT JOIN PSC_PUESTO pu ON pu.SE_IDSEDE_FK = s.SE_IDSEDE_PK
      LEFT JOIN PSC_PERSONAL p ON (p.SE_IDSEDE_FK = s.SE_IDSEDE_PK OR p.PU_IDPUESTO_FK = pu.PU_IDPUESTO_PK)
      LEFT JOIN PSC_ROTACION r ON r.PR_IDPERSONAL_FK = p.PR_IDPERSONAL_PK AND YEAR(r.RO_FECHA) = ?
      WHERE s.SE_ACTIVO = 'SI' AND c.CI_ACTIVO = 'SI'
      GROUP BY s.SE_NOMBRE, mes_num
      ORDER BY s.SE_NOMBRE, mes_num
    `;

    const [rows] = await db.execute(query, [anio]) as [RowDataPacket[], any];

    // Agrupar los resultados por sede
    const matrix: Record<string, RotacionSede> = {};

    rows.forEach(row => {
      const key = row.sede;
      if (!matrix[key]) {
        matrix[key] = {
          departamento: '', // Ya no se usa pero mantenemos la interfaz por compatibilidad
          sede: row.sede,
          meses: new Array(12).fill(0)
        };
      }
      if (row.mes_num > 0) {
        matrix[key].meses[row.mes_num - 1] = row.conteo;
      }
    });

    return Object.values(matrix);
  } catch (error) {
    console.error("Error en getRotacionSedeMes:", error);
    throw error;
  }
}

/**
 * Obtiene el desglose de motivos de rotación por mes para un año
 */
export async function getRotacionMotivos(anio: number) {
  try {
    const query = `
      SELECT 
        CASE MONTH(RO_FECHA)
          WHEN 1 THEN 'Ene' WHEN 2 THEN 'Feb' WHEN 3 THEN 'Mar' WHEN 4 THEN 'Abr'
          WHEN 5 THEN 'May' WHEN 6 THEN 'Jun' WHEN 7 THEN 'Jul' WHEN 8 THEN 'Ago'
          WHEN 9 THEN 'Sep' WHEN 10 THEN 'Oct' WHEN 11 THEN 'Nov' WHEN 12 THEN 'Dic'
        END as mes,
        RO_TIPO as descripcion,
        COUNT(*) as cantidad
      FROM PSC_ROTACION
      WHERE YEAR(RO_FECHA) = ?
      GROUP BY mes, RO_TIPO
      ORDER BY MONTH(RO_FECHA)
    `;

    const [rows] = await db.execute(query, [anio]);
    return rows as any[];
  } catch (error) {
    console.error("Error en getRotacionMotivos:", error);
    throw error;
  }
}
/**
 * Obtiene el detalle de las rotaciones para una sede, mes y año específicos
 */
export async function getDetalleRotaciones(sedeNom: string, mesNum: number, anio: number) {
  try {
    const query = `
      SELECT 
        r.RO_IDROTACION_PK as id,
        r.RO_FECHA as fecha,
        r.RO_TIPO as tipo,
        r.RO_MOTIVO as motivo,
        r.RO_ASSIGNMENT_TYPE as assignmentType,
        r.RO_ID_DESTINO as idDestino,
        p.PR_NOMBRE as colaborador,
        p.PR_IDPERSONAL_PK as personalId,
        s.SE_NOMBRE as sede
      FROM PSC_ROTACION r
      JOIN PSC_PERSONAL p ON r.PR_IDPERSONAL_FK = p.PR_IDPERSONAL_PK
      LEFT JOIN PSC_PUESTO pu ON p.PU_IDPUESTO_FK = pu.PU_IDPUESTO_PK
      LEFT JOIN PSC_SEDE s ON (p.SE_IDSEDE_FK = s.SE_IDSEDE_PK OR pu.SE_IDSEDE_FK = s.SE_IDSEDE_PK)
      WHERE (? = 'TODOS' OR s.SE_NOMBRE = ?)
        AND MONTH(r.RO_FECHA) = ? 
        AND YEAR(r.RO_FECHA) = ?
      ORDER BY r.RO_FECHA DESC
    `;
    const [rows] = await db.execute(query, [sedeNom, sedeNom, mesNum, anio]);
    return rows as any[];
  } catch (error) {
    console.error("Error en getDetalleRotaciones:", error);
    throw error;
  }
}

/**
 * Elimina un registro de rotación
 */
export async function deleteRotacion(id: number) {
  try {
    const query = `DELETE FROM PSC_ROTACION WHERE RO_IDROTACION_PK = ?`;
    await db.execute(query, [id]);
    return true;
  } catch (error) {
    console.error("Error en deleteRotacion:", error);
    throw error;
  }
}

/**
 * Actualiza un registro de rotación y sincroniza la ubicación del colaborador si es un traslado
 */
export async function updateRotacion(id: number, data: {
  tipo: string,
  fecha: string,
  motivo: string,
  assignmentType?: string | null,
  idDestino?: number | null,
  personalId?: number
}) {
  try {
    // 1. Actualizar el registro en PSC_ROTACION
    const query = `
      UPDATE PSC_ROTACION 
      SET RO_TIPO = ?, RO_FECHA = ?, RO_MOTIVO = ?
      WHERE RO_IDROTACION_PK = ?
    `;
    await db.execute(query, [data.tipo, data.fecha, data.motivo, id]);

    // 2. Si es una rotación (Traslado) y tenemos los datos, actualizar la ubicación actual del personal
    if (data.tipo === 'ROTACION' && data.personalId && data.assignmentType) {
      let updateFields = 'PR_ACTIVO = "SI"';
      const values: (string | number | null)[] = [];

      if (data.assignmentType === 'SEDE') {
        updateFields += ', SE_IDSEDE_FK = ?, CI_IDCIUDAD_FK = NULL, PU_IDPUESTO_FK = NULL';
        values.push(data.idDestino ?? null);
      } else if (data.assignmentType === 'ZONA') {
        updateFields += ', CI_IDCIUDAD_FK = ?, SE_IDSEDE_FK = NULL, PU_IDPUESTO_FK = NULL';
        values.push(data.idDestino ?? null);
      } else if (data.assignmentType === 'PUESTO') {
        updateFields += ', PU_IDPUESTO_FK = ?, SE_IDSEDE_FK = NULL, CI_IDCIUDAD_FK = NULL';
        values.push(data.idDestino ?? null);
      } else { // NACIONAL
        updateFields += ', SE_IDSEDE_FK = NULL, CI_IDCIUDAD_FK = NULL, PU_IDPUESTO_FK = NULL';
      }

      values.push(data.personalId ?? null);
      const updateSedeQuery = `UPDATE PSC_PERSONAL SET ${updateFields} WHERE PR_IDPERSONAL_PK = ?`;
      await db.execute(updateSedeQuery, values);
    }

    return true;
  } catch (error) {
    console.error("Error en updateRotacion:", error);
    throw error;
  }
}
