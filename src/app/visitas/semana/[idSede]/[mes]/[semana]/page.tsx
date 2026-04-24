import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ModuleLayout from '@/components/shared/ModuleLayout';

interface Props {
    params: { idSede: string, mes: string, semana: string };
}

async function getVisitasSemana(idSede: number, mes: number, semana: number) {
    const [rows] = await db.query<RowDataPacket[]>(`
        SELECT 
            V.VI_IDVISITA_PK as id,
            V.VI_ESTADO as estado,
            V.VI_OBSERVACIONES as observaciones,
            S.SE_NOMBRE as site,
            C.CI_NOMBRE as zona
        FROM PSC_VISITA V
        JOIN PSC_SEDE S ON V.SE_IDSEDE_FK = S.SE_IDSEDE_PK
        JOIN PSC_CIUDAD C ON S.CI_IDCIUDAD_FK = C.CI_IDCIUDAD_PK
        WHERE V.SE_IDSEDE_FK = ? 
        AND MONTH(V.VI_FECHA_PLANEADA) = ?
        AND LEAST(FLOOR((DAY(V.VI_FECHA_PLANEADA) - 1) / 7) + 1, 4) = ?
        AND V.VI_ACTIVO = 'SI'
    `, [idSede, mes, semana]);

    return rows;
}

export default async function VisitasSemanaPage({ params }: Props) {
    const idSede = parseInt(params.idSede);
    const mes = parseInt(params.mes);
    const semana = parseInt(params.semana);

    const visitas = await getVisitasSemana(idSede, mes, semana);

    if (visitas.length === 0) return notFound();

    const info = visitas[0];

    return (
        <ModuleLayout>
            <div className="flex-1 bg-[#F8FAFC] p-8 flex flex-col gap-8 animate-fade-in">
                {/* Header Independiente */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/visitas"
                            className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#004B93] hover:border-[#004B93] transition-all shadow-sm"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Visitas de la Semana</h1>
                                <Badge className="bg-[#004B93] text-white border-none font-black text-[10px] px-2 uppercase">{info.zona}</Badge>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {info.site} <span className="w-1 h-1 rounded-full bg-slate-300"></span> Semana {semana} - Mes {mes}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de Visitas en esta Página */}
                <div className="max-w-4xl flex flex-col gap-4">
                    {visitas.map((visita) => (
                        <div 
                            key={visita.id}
                            className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-[#004B93] transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-8">
                                <div className={cn(
                                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6",
                                    visita.estado === 'EJECUTADA' ? "bg-green-50 text-green-600" : "bg-blue-50 text-[#004B93]"
                                )}>
                                    {visita.estado === 'EJECUTADA' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-slate-800 uppercase">Visita #{visita.id}</span>
                                        <Badge className={cn(
                                            "text-[9px] font-black px-2 py-0.5 rounded-full border-none",
                                            visita.estado === 'EJECUTADA' ? "bg-green-500 text-white" : "bg-blue-600 text-white"
                                        )}>
                                            {visita.estado}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500">
                                        {visita.observaciones || 'No hay notas registradas para esta planeación.'}
                                    </p>
                                </div>
                            </div>

                            <Link 
                                href={`/ejecucion-visita/${visita.id}`}
                                className={cn(
                                    "flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/10",
                                    visita.estado === 'EJECUTADA' 
                                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                                        : "bg-[#004B93] text-white hover:bg-blue-900 hover:-translate-y-1"
                                )}
                            >
                                {visita.estado === 'EJECUTADA' ? 'Ver Reporte' : 'Iniciar Ejecución'}
                                <Play size={16} className={cn(visita.estado === 'EJECUTADA' && "hidden")} />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </ModuleLayout>
    );
}
