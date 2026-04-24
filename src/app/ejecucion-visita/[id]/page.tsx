import React from 'react';
import { notFound } from 'next/navigation';
import { getVisitaById, getVisitaTareas } from '@/services/visitasService';
import VisitaExecutionPanel from '@/components/modules/visitas/VisitaExecutionPanel';

interface Props {
    params: { id: string };
}

export const metadata = {
    title: 'Ejecución de Visita | PepsiCo',
    description: 'Panel independiente de ejecución de inspecciones de seguridad'
};

/**
 * Página independiente para la ejecución de una visita específica.
 * Separada totalmente de la vista del cronograma para mayor enfoque y rendimiento.
 */
export default async function EjecucionVisitaPage({ params }: Props) {
    const id = parseInt(params.id);
    if (isNaN(id)) return notFound();

    const [visita, tareas] = await Promise.all([
        getVisitaById(id),
        getVisitaTareas()
    ]);

    if (!visita) return notFound();

    return (
        <main className="min-h-screen w-full bg-slate-950">
            <VisitaExecutionPanel 
                visita={visita as any} 
                allTareas={tareas}
            />
        </main>
    );
}
