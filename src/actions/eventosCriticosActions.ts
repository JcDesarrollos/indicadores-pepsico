'use server';

import { eventosCriticosService } from '@/services/eventosCriticosService';

export async function getComparativaEventosCriticos(anio1: number, anio2: number) {
  try {
    const data = await eventosCriticosService.getComparativaSedes(anio1, anio2);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in getComparativaEventosCriticos:', error);
    return { success: false, message: error.message };
  }
}

export async function getDetallesEventosCriticos(anio: number | null = null, sedeNombre: string | null = null) {
  try {
    const data = await eventosCriticosService.getDetallesCriticos(anio, sedeNombre);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in getDetallesEventosCriticos:', error);
    return { success: false, message: error.message };
  }
}

export async function getImagenesNovedadAction(novedadId: number) {
  try {
    const data = await eventosCriticosService.getImagenesNovedad(novedadId);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in getImagenesNovedadAction:', error);
    return { success: false, message: error.message };
  }
}

export async function getTiposRiesgoNovedadAction(novedadId: number) {
  try {
    const data = await eventosCriticosService.getTiposRiesgoNovedad(novedadId);
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in getTiposRiesgoNovedadAction:', error);
    return { success: false, message: error.message };
  }
}
