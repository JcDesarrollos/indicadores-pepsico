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
            <div className="flex-1 overflow-hidden flex flex-col bg-[#F8FAFC] dark:bg-slate-950 animate-fade-in">
                {/* Header Superior Visual */}
                <div className="px-8 pt-8 pb-4 flex flex-col gap-1">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
                        Gestión de Visitas
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Planeación y Control Administrativo</span>
                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                        <span>Contrato Seguridad Física PepsiCo</span>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="flex-1 overflow-hidden p-8 pt-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
                        <CronogramaVisitas
                            initialData={cronograma}
                            allTareas={tareas}
                            sedes={sedes}
                            zonas={zonas}
                            currentAnio={anio}
                        />
                    </div>
                </div>
            </div>
        </ModuleLayout>
    );
}
