import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { personalId, tipo, fecha, motivo, assignmentType, idDestino } = body;

    // 1. Insertar en PSC_ROTACION (Historial)
    const insertQuery = `
      INSERT INTO PSC_ROTACION (PR_IDPERSONAL_FK, RO_TIPO, RO_FECHA, RO_MOTIVO, RO_ASSIGNMENT_TYPE, RO_ID_DESTINO) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.execute(insertQuery, [personalId, tipo, fecha, motivo, assignmentType || null, idDestino || null]);

    // 2. Ejecutar acción según el tipo
    if (tipo === 'ROTACION') {
      // Caso Traslado: Actualizar el campo correspondiente según el Ámbito
      let updateFields = 'PR_ACTIVO = "SI"';
      let values = [];

      // Limpiamos los otros campos para que solo pertenezca a uno (Paridad con Edit Modal)
      if (assignmentType === 'SEDE') {
        updateFields += ', SE_IDSEDE_FK = ?, CI_IDCIUDAD_FK = NULL, PU_IDPUESTO_FK = NULL';
        values.push(idDestino);
      } else if (assignmentType === 'ZONA') {
        updateFields += ', CI_IDCIUDAD_FK = ?, SE_IDSEDE_FK = NULL, PU_IDPUESTO_FK = NULL';
        values.push(idDestino);
      } else if (assignmentType === 'PUESTO') {
        updateFields += ', PU_IDPUESTO_FK = ?, SE_IDSEDE_FK = NULL, CI_IDCIUDAD_FK = NULL';
        values.push(idDestino);
      } else { // NACIONAL
        updateFields += ', SE_IDSEDE_FK = NULL, CI_IDCIUDAD_FK = NULL, PU_IDPUESTO_FK = NULL';
      }

      values.push(personalId);
      
      const updateSedeQuery = `UPDATE PSC_PERSONAL SET ${updateFields} WHERE PR_IDPERSONAL_PK = ?`;
      await db.execute(updateSedeQuery, values);

    } else {
      // Caso Novedad que no es Traslado
      if (tipo === 'RENUNCIA') {
        // Solo la renuncia marca al personal como inactivo
        const updateInactivoQuery = `
          UPDATE PSC_PERSONAL SET PR_ACTIVO = 'NO' WHERE PR_IDPERSONAL_PK = ?
        `;
        await db.execute(updateInactivoQuery, [personalId]);
      }
      // Si es 'MAL DESEMPEÑO', se guarda el registro en PSC_ROTACION pero no se inactiva
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error al registrar rotación:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
