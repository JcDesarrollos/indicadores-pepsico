'use server';

import * as service from '@/services/rotacionService';

/**
 * Server Action para obtener la comparativa de rotación
 */
export async function getComparativaRotacionAction(anio1: number, anio2: number) {
  try {
    const data = await service.getComparativaRotacion(anio1, anio2);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al obtener comparativa de rotación" };
  }
}

/**
 * Server Action para obtener la rotación por sede mes a mes
 */
export async function getRotacionSedeMesAction(anio: number) {
  try {
    const data = await service.getRotacionSedeMes(anio);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al obtener matriz de rotación por sede" };
  }
}

/**
 * Server Action para obtener los motivos de rotación
 */
export async function getRotacionMotivosAction(anio: number) {
  try {
    const data = await service.getRotacionMotivos(anio);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al obtener motivos de rotación" };
  }
}
/**
 * Server Action para obtener el detalle de rotaciones
 */
export async function getDetalleRotacionesAction(sedeNom: string, mesNum: number, anio: number) {
  try {
    const data = await service.getDetalleRotaciones(sedeNom, mesNum, anio);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al obtener detalle de rotaciones" };
  }
}

/**
 * Server Action para eliminar una rotación
 */
export async function deleteRotacionAction(id: number) {
  try {
    await service.deleteRotacion(id);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al eliminar rotación" };
  }
}

/**
 * Server Action para actualizar una rotación
 */
export async function updateRotacionAction(id: number, data: { 
  tipo: string, 
  fecha: string, 
  motivo: string,
  assignmentType?: string | null,
  idDestino?: number | null,
  personalId?: number
}) {
  try {
    await service.updateRotacion(id, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al actualizar rotación" };
  }
}
