import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      SELECT CI_IDCIUDAD_PK as id, CI_NOMBRE as nombre 
      FROM PSC_CIUDAD 
      WHERE CI_ACTIVO = 'SI'
      ORDER BY CI_NOMBRE ASC
    `;
    const [rows] = await db.execute(query);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
