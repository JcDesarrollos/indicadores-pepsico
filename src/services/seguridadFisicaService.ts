import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { DashboardData, GenderDistribution } from '@/types/seguridadFisica';

/**
 * Servicio para obtener indicadores de Seguridad Física
 */
export async function getSecurityDashboardData(): Promise<DashboardData> {
  // 1. Métricas generales
  const [metricsRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      (SELECT COUNT(*) FROM PSC_CIUDAD) as totalZones,
      (SELECT COUNT(*) FROM PSC_SEDE) as totalSites,
      (SELECT COUNT(*) FROM PSC_PUESTO) as totalPosts,
      (SELECT COUNT(*) FROM PSC_PERSONAL) as totalPersonnel
  `);

  // 2. Distribución de género
  const [genderRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      PR_GENERO as name, 
      COUNT(*) as value 
    FROM PSC_PERSONAL 
    WHERE PR_ACTIVO = 'SI'
    GROUP BY PR_GENERO
  `);

  const genderColors: Record<string, string> = {
    'HOMBRE': '#1d4ed8',   // Blue-700
    'MUJER': '#db2777'     // Pink-600
  };

  const genderData: GenderDistribution[] = genderRows.map(row => ({
    name: row.name,
    value: row.value,
    color: genderColors[row.name as string] || '#94a3b8'
  }));

  // 3. Distribución por cargos (Roles)
  const [roleRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      CP.CP_NOMBRE as role, 
      COUNT(*) as count 
    FROM PSC_PERSONAL P
    JOIN PSC_CARGO_PERSONAL CP ON P.CP_IDCARGO_FK = CP.CP_IDCARGO_PK
    WHERE P.PR_ACTIVO = 'SI'
    GROUP BY CP.CP_NOMBRE
  `);

  // 4. Distribución por modalidad de puesto
  const [modalityRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      IFNULL(M.MP_NOMBRE, 'NO DEFINIDO') as modality, 
      COUNT(*) as count 
    FROM PSC_PUESTO P
    LEFT JOIN PSC_MODALIDAD_PUESTO M ON P.MP_IDMODALIDAD_FK = M.MP_IDMODALIDAD_PK
    WHERE P.PU_ACTIVO = 'SI'
    GROUP BY modality
  `);

  // 5. Detalle completo por zonas y sedes (Estilo Excel)
  const [sitesRows] = await db.query<RowDataPacket[]>(`
    SELECT 
      S.SE_IDSEDE_PK as idSede,
      C.CI_NOMBRE as zona, 
      S.SE_NOMBRE as site, 
      (SELECT COUNT(*) FROM PSC_PUESTO P WHERE P.SE_IDSEDE_FK = S.SE_IDSEDE_PK AND P.PU_ACTIVO = 'SI') as puestos,
      (
        SELECT COUNT(*) FROM PSC_PERSONAL PR 
        LEFT JOIN PSC_PUESTO P ON PR.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
        JOIN PSC_CARGO_PERSONAL CP ON PR.CP_IDCARGO_FK = CP.CP_IDCARGO_PK
        WHERE (PR.SE_IDSEDE_FK = S.SE_IDSEDE_PK OR P.SE_IDSEDE_FK = S.SE_IDSEDE_PK)
          AND PR.PR_ACTIVO = 'SI' 
          AND CP.CP_NOMBRE = 'GUARDA DE SEGURIDAD'
      ) as personas,
      (
        SELECT COUNT(*) FROM PSC_PERSONAL PR 
        LEFT JOIN PSC_PUESTO P ON PR.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
        JOIN PSC_CARGO_PERSONAL CP ON PR.CP_IDCARGO_FK = CP.CP_IDCARGO_PK
        WHERE (PR.SE_IDSEDE_FK = S.SE_IDSEDE_PK OR P.SE_IDSEDE_FK = S.SE_IDSEDE_PK)
          AND PR.PR_ACTIVO = 'SI' 
          AND CP.CP_NOMBRE = 'GUARDA DE SEGURIDAD'
          AND PR.PR_GENERO = 'MUJER'
      ) as mujeres,
      (
        SELECT COUNT(*) FROM PSC_PERSONAL PR 
        LEFT JOIN PSC_PUESTO P ON PR.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK
        JOIN PSC_CARGO_PERSONAL CP ON PR.CP_IDCARGO_FK = CP.CP_IDCARGO_PK
        WHERE (PR.SE_IDSEDE_FK = S.SE_IDSEDE_PK OR P.SE_IDSEDE_FK = S.SE_IDSEDE_PK)
          AND PR.PR_ACTIVO = 'SI' 
          AND CP.CP_NOMBRE = 'GUARDA DE SEGURIDAD'
          AND PR.PR_GENERO = 'HOMBRE'
      ) as hombres
    FROM PSC_SEDE S
    JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
    WHERE S.SE_ACTIVO = 'SI'
    ORDER BY C.CI_NOMBRE, S.SE_NOMBRE
  `);

  return {
    metrics: metricsRows[0] as any,
    genderData,
    roleData: roleRows as any,
    modalityData: modalityRows as any,
    sitesDetail: sitesRows as any
  };
}
