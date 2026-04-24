import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export interface ComparativaSede {
  SE_NOMBRE: string;
  AÑO1_COUNT: number;
  AÑO2_COUNT: number;
}

export interface EventoCriticoDetail {
  NO_IDNOVEDAD_PK: number;
  NO_CONSECUTIVO: number;
  NO_FECHA_HORA: string;
  NO_DESCRIPCION: string;
  NO_GESTION: string | null;
  NO_ESTADO: string;
  TN_NOMBRE: string;
  SE_NOMBRE: string;
  CI_NOMBRE: string;
  US_NOMBRE: string;
  NR_NOMBRE: string | null;
  CL_NOMBRE: string;
}

export interface ImagenNovedad {
  IM_URL_IMAGEN: string;
  IM_NOMBRE_ARCHIVO: string;
}

export interface TipoRiesgo {
  TR_NOMBRE: string;
}

export const eventosCriticosService = {
  /**
   * Obtiene la comparativa de eventos críticos por sede entre dos años
   */
  getComparativaSedes: async (anio1: number, anio2: number) => {
    const sql = `
      SELECT 
        S.SE_NOMBRE,
        (
          SELECT COUNT(*) 
          FROM PSC_NOVEDAD N
          INNER JOIN PSC_PUESTO P ON N.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
          WHERE P.SE_IDSEDE_FK = S.SE_IDSEDE_PK 
            AND N.NO_ES_CRITICO = 'SI' 
            AND YEAR(N.NO_FECHA_HORA) = ?
        ) as AÑO1_COUNT,
        (
          SELECT COUNT(*) 
          FROM PSC_NOVEDAD N
          INNER JOIN PSC_PUESTO P ON N.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
          WHERE P.SE_IDSEDE_FK = S.SE_IDSEDE_PK 
            AND N.NO_ES_CRITICO = 'SI' 
            AND YEAR(N.NO_FECHA_HORA) = ?
        ) as AÑO2_COUNT
      FROM PSC_SEDE S
      WHERE S.SE_ACTIVO = 'SI'
      ORDER BY (AÑO1_COUNT + AÑO2_COUNT) DESC, S.SE_NOMBRE ASC
    `;
    
    const [rows] = await db.execute<RowDataPacket[]>(sql, [anio1, anio2]);
    return rows as ComparativaSede[];
  },

  /**
   * Obtiene el listado detallado de novedades críticas
   */
  getDetallesCriticos: async (anio: number | null = null, sedeNombre: string | null = null) => {
    let sql = `
      SELECT 
        N.NO_IDNOVEDAD_PK,
        N.NO_CONSECUTIVO,
        N.NO_FECHA_HORA,
        N.NO_DESCRIPCION,
        N.NO_GESTION,
        N.NO_ESTADO,
        TN.TN_NOMBRE,
        S.SE_NOMBRE,
        C.CI_NOMBRE,
        U.US_NOMBRE,
        NR.NR_NOMBRE,
        CL.CL_NOMBRE
      FROM PSC_NOVEDAD N
      INNER JOIN PSC_TIPO_NOVEDAD TN ON N.TN_IDTIPO_FK = TN.TN_IDTIPO_PK
      INNER JOIN PSC_PUESTO P ON N.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
      INNER JOIN PSC_SEDE S ON P.SE_IDSEDE_FK = S.SE_IDSEDE_PK
      INNER JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
      INNER JOIN PSC_USUARIO U ON N.US_IDUSUARIO_FK = U.US_IDUSUARIO_PK
      INNER JOIN PSC_CLIENTE CL ON N.CL_IDCLIENTE_FK = CL.CL_IDCLIENTE_PK
      LEFT JOIN PSC_NIVEL_RIESGO NR ON N.NR_IDNIVEL_FK = NR.NR_IDNIVEL_PK
      WHERE N.NO_ES_CRITICO = 'SI' 
    `;

    const params: any[] = [];
    if (anio) {
      sql += ` AND YEAR(N.NO_FECHA_HORA) = ?`;
      params.push(anio);
    }
    
    if (sedeNombre) {
      sql += ` AND S.SE_NOMBRE = ?`;
      params.push(sedeNombre);
    }

    sql += ` ORDER BY N.NO_FECHA_HORA DESC LIMIT 100`;

    const [rows] = await db.execute<RowDataPacket[]>(sql, params);
    return rows as EventoCriticoDetail[];
  },

  /**
   * Obtiene las imágenes asociadas a una novedad
   */
  getImagenesNovedad: async (novedadId: number) => {
    const sql = `SELECT IM_URL_IMAGEN, IM_NOMBRE_ARCHIVO FROM PSC_IMAGEN_NOVEDAD WHERE NO_IDNOVEDAD_FK = ?`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [novedadId]);
    return rows as ImagenNovedad[];
  },

  /**
   * Obtiene los tipos de riesgo asociados a una novedad
   */
  getTiposRiesgoNovedad: async (novedadId: number) => {
    const sql = `
      SELECT TR.TR_NOMBRE
      FROM PSC_NOVEDAD_TIPO_RIESGO NTR
      INNER JOIN PSC_TIPO_RIESGO TR ON NTR.TR_IDTIPO_FK = TR.TR_IDTIPO_PK
      WHERE NTR.NO_IDNOVEDAD_FK = ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [novedadId]);
    return rows as TipoRiesgo[];
  },

  /**
   * Obtiene el listado general de novedades (no necesariamente críticas)
   */
  getNovedadesRecientes: async (limit: number = 200) => {
    const sql = `
      SELECT 
        N.NO_IDNOVEDAD_PK,
        N.NO_CONSECUTIVO,
        N.NO_FECHA_HORA,
        N.NO_DESCRIPCION,
        N.NO_GESTION,
        N.NO_ESTADO,
        N.NO_ES_CRITICO,
        TN.TN_NOMBRE,
        S.SE_NOMBRE,
        C.CI_NOMBRE,
        U.US_NOMBRE,
        CL.CL_NOMBRE,
        NR.NR_NOMBRE
      FROM PSC_NOVEDAD N
      INNER JOIN PSC_TIPO_NOVEDAD TN ON N.TN_IDTIPO_FK = TN.TN_IDTIPO_PK
      INNER JOIN PSC_PUESTO P ON N.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
      INNER JOIN PSC_SEDE S ON P.SE_IDSEDE_FK = S.SE_IDSEDE_PK
      INNER JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
      INNER JOIN PSC_USUARIO U ON N.US_IDUSUARIO_FK = U.US_IDUSUARIO_PK
      INNER JOIN PSC_CLIENTE CL ON N.CL_IDCLIENTE_FK = CL.CL_IDCLIENTE_PK
      LEFT JOIN PSC_NIVEL_RIESGO NR ON N.NR_IDNIVEL_FK = NR.NR_IDNIVEL_PK
      ORDER BY N.NO_FECHA_HORA DESC
      LIMIT ?
    `;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [limit]);
    return rows;
  },

  /**
   * Marca una novedad como evento crítico
   */
  marcarComoCritico: async (id: number, esCritico: 'SI' | 'NO' = 'SI') => {
    const sql = `UPDATE PSC_NOVEDAD SET NO_ES_CRITICO = ? WHERE NO_IDNOVEDAD_PK = ?`;
    await db.execute(sql, [esCritico, id]);
    return { success: true };
  }
};
