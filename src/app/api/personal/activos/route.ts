import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT 
        p.PR_IDPERSONAL_PK, 
        p.PR_NOMBRE, 
        p.SE_IDSEDE_FK as idSede,
        p.CI_IDCIUDAD_FK as idZona,
        s.SE_NOMBRE,
        c.CI_NOMBRE
      FROM PSC_PERSONAL p
      LEFT JOIN PSC_SEDE s ON p.SE_IDSEDE_FK = s.SE_IDSEDE_PK
      LEFT JOIN PSC_CIUDAD c ON p.CI_IDCIUDAD_FK = c.CI_IDCIUDAD_PK
      WHERE p.PR_ACTIVO = 'SI'
      ORDER BY p.PR_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
