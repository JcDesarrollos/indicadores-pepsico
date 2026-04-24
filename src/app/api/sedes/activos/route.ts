import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT S.SE_IDSEDE_PK as id, S.SE_NOMBRE as nombre, S.CI_IDCIUDAD_FK as idZona
      FROM PSC_SEDE S
      JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
      WHERE S.SE_ACTIVO = 'SI' AND C.CI_ACTIVO = 'SI'
      ORDER BY S.SE_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
