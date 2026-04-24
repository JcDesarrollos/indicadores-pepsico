'use server';

import { eventosCriticosService } from "@/services/eventosCriticosService";
import { revalidatePath } from "next/cache";

export async function getNovedadesAction() {
    try {
        const data = await eventosCriticosService.getNovedadesRecientes();
        return { success: true, data };
    } catch (error) {
        console.error("Error en getNovedadesAction:", error);
        return { success: false, error: "Error al obtener novedades" };
    }
}

export async function toggleCriticoAction(id: number, currentStatus: string) {
    try {
        const newStatus = currentStatus === 'SI' ? 'NO' : 'SI';
        await eventosCriticosService.marcarComoCritico(id, newStatus);
        revalidatePath('/novedades');
        revalidatePath('/eventos-criticos');
        return { success: true, newStatus };
    } catch (error) {
        console.error("Error en toggleCriticoAction:", error);
        return { success: false, error: "Error al cambiar estado crítico" };
    }
}
