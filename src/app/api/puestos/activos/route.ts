import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT PU_IDPUESTO_PK as id, PU_NOMBRE as nombre, SE_IDSEDE_FK as idSede
      FROM PSC_PUESTO 
      WHERE PU_ACTIVO = 'SI' 
      ORDER BY PU_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
