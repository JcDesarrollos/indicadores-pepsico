import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT P.PU_IDPUESTO_PK as id, P.PU_NOMBRE as nombre, P.SE_IDSEDE_FK as idSede
      FROM PSC_PUESTO P
      JOIN PSC_SEDE S ON P.SE_IDSEDE_FK = S.SE_IDSEDE_PK
      JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
      WHERE P.PU_ACTIVO = 'SI' AND S.SE_ACTIVO = 'SI' AND C.CI_ACTIVO = 'SI'
      ORDER BY P.PU_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
