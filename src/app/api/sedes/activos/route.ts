import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT SE_IDSEDE_PK as id, SE_NOMBRE as nombre, CI_IDCIUDAD_FK as idZona
      FROM PSC_SEDE 
      WHERE SE_ACTIVO = 'SI' 
      ORDER BY SE_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
