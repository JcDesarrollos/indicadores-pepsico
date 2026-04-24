import React from 'react';
import ModuleLayout from '@/components/shared/ModuleLayout';
import { getVisitasCronograma, getVisitaTareas } from '@/services/visitasService';
import { getSedes, getZonas } from '@/actions/personnelActions';
import CronogramaVisitas from '@/components/modules/visitas/CronogramaVisitas';

export const metadata = {
    title: 'Gestión de Visitas | PepsiCo',
    description: 'Cronograma anual de planeación y ejecución de visitas de seguridad'
};

export default async function VisitasPage({
    searchParams
}: {
    searchParams: { anio?: string }
}) {
    const anio = searchParams.anio ? parseInt(searchParams.anio) : new Date().getFullYear();

    // Carga de datos iniciales
    const [cronograma, tareas, sedes, zonas] = await Promise.all([
        getVisitasCronograma(anio),
        getVisitaTareas(),
        getSedes(),
        getZonas()
    ]);

    return (
        <ModuleLayout>
            <div className="flex-1 overflow-hidden flex flex-col bg-white animate-fade-in">
                <CronogramaVisitas
                    initialData={cronograma}
                    allTareas={tareas}
                    sedes={sedes}
                    zonas={zonas}
                    currentAnio={anio}
                />
            </div>
        </ModuleLayout>
    );
}
