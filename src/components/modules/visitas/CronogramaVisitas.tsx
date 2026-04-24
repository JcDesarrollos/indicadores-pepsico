'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, Search, Plus, 
    CheckCircle2, Clock, Check, TrendingUp
} from 'lucide-react';
import { VisitaCronogramaRow, VisitaTarea, Visita, VisitaEstado } from '@/types/visitas';
import { cn } from '@/lib/utils';
import VisitaDetailModal from './VisitaDetailModal';
import PlaneacionModal from './PlaneacionModal';

interface Props {
    initialData: VisitaCronogramaRow[];
    allTareas: VisitaTarea[];
    sedes: { id: number, nombre: string, idZona: number }[];
    zonas: { id: number, nombre: string }[];
    currentAnio: number;
}

const MESES = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export default function CronogramaVisitas({ initialData, allTareas, sedes, zonas, currentAnio }: Props) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCell, setSelectedCell] = useState<{ row: VisitaCronogramaRow, visits: Visita[] } | null>(null);
    const [isPlanningOpen, setIsPlanningOpen] = useState(false);
    const [planningData, setPlanningData] = useState<{ sedeId: number, date: string } | null>(null);
    
    const [visibleMonths, setVisibleMonths] = useState<number[]>(Array.from({ length: 12 }, (_, i) => i + 1));

    const statsGlobales = useMemo(() => {
        const stats = Array.from({ length: 12 }, () => ({ plan: 0, ejec: 0 }));
        initialData.forEach(row => {
            Object.entries(row.plan).forEach(([key, visits]) => {
                const mes = parseInt(key.split('-')[0].replace('M', '')) - 1;
                if (mes >= 0 && mes < 12) {
                    stats[mes].plan += (visits as Visita[]).length;
                    stats[mes].ejec += (visits as Visita[]).filter((v: Visita) => v.estado === 'EJECUTADA').length;
                }
            });
        });
        return stats;
    }, [initialData]);

    const cumplimientoTotal = useMemo(() => {
        const totalPlan = statsGlobales.reduce((acc, s) => acc + s.plan, 0);
        const totalEjec = statsGlobales.reduce((acc, s) => acc + s.ejec, 0);
        return totalPlan > 0 ? Math.round((totalEjec / totalPlan) * 100) : 0;
    }, [statsGlobales]);

    const filteredData = useMemo(() => {
        const filtered = initialData.filter(row =>
            row.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.zona.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return [...filtered].sort((a, b) => a.zona.localeCompare(b.zona));
    }, [initialData, searchTerm]);

    const groupedData = useMemo(() => {
        const groups: { zona: string, sites: VisitaCronogramaRow[] }[] = [];
        filteredData.forEach(row => {
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.zona === row.zona) {
                lastGroup.sites.push(row);
            } else {
                groups.push({ zona: row.zona, sites: [row] });
            }
        });
        return groups;
    }, [filteredData]);

    const changeAnio = (delta: number) => { router.push(`/visitas?anio=${currentAnio + delta}`); };

    const toggleMonth = (mesIdx: number) => {
        const mesNum = mesIdx + 1;
        setVisibleMonths(prev => 
            prev.includes(mesNum) ? prev.filter(m => m !== mesNum) : [...prev, mesNum].sort((a, b) => a - b)
        );
    };

    const currentMes = new Date().getMonth() + 1;

    return (
        <div className="block w-full h-full bg-white relative font-sans overflow-hidden">
            {/* TOOLBAR */}
            <div className="block w-full p-2 bg-white border-b border-slate-900 sticky top-0 z-[200]">
                <div className="inline-block align-middle mr-4 border-r border-slate-200 pr-4">
                    <div className="inline-block p-1 bg-slate-50 border border-slate-800">
                        {MESES.map((mes, i) => (
                            <button
                                key={mes}
                                onClick={() => toggleMonth(i)}
                                className={cn(
                                    "inline-flex items-center justify-center w-8 h-8 text-[9px] font-black uppercase transition-all mr-0.5 last:mr-0 border",
                                    visibleMonths.includes(i + 1)
                                        ? "bg-[#004B93] text-white border-[#004B93]"
                                        : "bg-white text-slate-400 border-slate-100"
                                )}
                            >
                                {mes}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="inline-block align-middle mr-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                        <input
                            type="text"
                            placeholder="BUSCAR..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-8 pr-2 py-1.5 bg-slate-50 text-[9px] font-black uppercase border border-slate-800 w-32 outline-none focus:border-[#004B93]"
                        />
                    </div>
                </div>

                <div className="inline-block align-middle">
                    <button
                        onClick={() => setIsPlanningOpen(true)}
                        className="px-4 py-1.5 bg-[#004B93] text-white text-[9px] font-black uppercase tracking-widest border border-[#004B93]"
                    >
                        <Plus className="inline-block mr-1" size={10} /> Nueva Planeación
                    </button>
                </div>

                <div className="inline-block align-middle float-right">
                    <div className="inline-block bg-slate-100 border border-slate-800 transition-all">
                        <button onClick={() => changeAnio(-1)} className="px-1.5 py-1 hover:text-[#004B93]"><ChevronLeft size={14} /></button>
                        <span className="px-2 text-[10px] font-black text-slate-800 uppercase tabular-nums">{currentAnio}</span>
                        <button onClick={() => changeAnio(1)} className="px-1.5 py-1 hover:text-[#004B93]"><ChevronRight size={14} /></button>
                    </div>
                </div>
                <div className="clear-both"></div>
            </div>

            {/* AREA PRINCIPAL: TABLA + DASHBOARD LATERAL */}
            <div className="relative h-[90dvh] flex bg-[#F8FAFC] overflow-hidden">
                {/* TABLA CON SCROLL */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                    <table className="border-collapse table-fixed bg-white min-w-max border-r border-slate-900 mb-20">
                        <thead className="sticky top-0 z-[150]">
                            <tr className="bg-slate-900 text-white h-10">
                                <th className="sticky left-0 z-[160] bg-zinc-800 border-x border-slate-900 px-4 py-2 text-[10px] font-black uppercase text-center w-[160px] min-w-[160px]">ZONA</th>
                                <th className="sticky left-[160px] z-[160] bg-zinc-800 border-x border-slate-900 px-4 py-2 text-[10px] font-black uppercase text-left w-[240px] min-w-[240px]">SITE</th>
                                {visibleMonths.map(mesNum => (
                                    <th key={mesNum} colSpan={4} className="border border-slate-700 py-2 text-[10px] font-black uppercase text-center bg-[#004B93] min-w-[128px]">
                                        {MESES[mesNum - 1].toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-slate-100 text-slate-900 h-8">
                                <th className="sticky left-0 z-[160] bg-slate-100 border-x border-slate-300"></th>
                                <th className="sticky left-[160px] z-[160] bg-slate-100 border-x border-slate-300"></th>
                                {visibleMonths.map(mesNum => 
                                    Array.from({ length: 4 }).map((_, s) => (
                                        <th key={`${mesNum}-S${s+1}`} className="border border-slate-300 w-8 h-8 text-[9px] font-black text-center bg-white">
                                            S{s + 1}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData.map((group) => (
                                <React.Fragment key={group.zona}>
                                    {group.sites.map((row, siteIdx) => (
                                        <tr key={row.idSede} className="group hover:bg-slate-50 transition-colors">
                                            {siteIdx === 0 && (
                                                <td 
                                                    rowSpan={group.sites.length}
                                                    className="sticky left-0 z-[140] border border-slate-900 px-4 py-2 text-[10px] font-black uppercase text-center align-middle bg-sky-50 text-blue-900 shadow-[4px_0_10px_rgba(0,0,0,0.05)]"
                                                >
                                                    {group.zona}
                                                </td>
                                            )}
                                            <td className="sticky left-[160px] z-[140] bg-white border border-slate-300 px-4 py-2 text-[9px] font-bold text-slate-800 group-hover:bg-blue-50 shadow-[4px_0_10px_rgba(0,0,0,0.02)]">
                                                <div className="truncate">{row.site}</div>
                                            </td>
                                            {visibleMonths.map(mesNum => 
                                                Array.from({ length: 4 }).map((_, s) => {
                                                    const semNum = s + 1;
                                                    const key = `M${mesNum}-S${semNum}`;
                                                    const visits = row.plan[key] || [];
                                                    const hasExecuted = visits.some(v => v.estado === 'EJECUTADA');

                                                    return (
                                                        <td key={key} className="border border-slate-300 p-0 relative h-10 w-8">
                                                            {visits.length > 0 ? (
                                                                <div
                                                                    onClick={() => setSelectedCell({ row, visits })}
                                                                    className={cn(
                                                                        "absolute inset-0 cursor-pointer transition-all",
                                                                        hasExecuted ? "bg-[#39FF14] border border-green-700" : "bg-[#004B93] border border-blue-950"
                                                                    )}
                                                                />
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        const dia = Math.min((semNum - 1) * 7 + 1, 28);
                                                                        const d = new Date(currentAnio, mesNum - 1, dia);
                                                                        setPlanningData({ sedeId: row.idSede, date: d.toISOString().split('T')[0] });
                                                                        setIsPlanningOpen(true);
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full hover:bg-blue-50/50 transition-colors outline-none"
                                                                />
                                                            )}
                                                        </td>
                                                    );
                                                })
                                            )}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PANEL DE CUMPLIMIENTO (STICKY RIGHT) */}
                <div className="w-48 bg-white border-l border-slate-900 flex flex-col shrink-0 font-sans shadow-[-10px_0_30px_rgba(0,0,0,0.1)] overflow-y-auto">
                    <div className="p-4 border-b border-slate-900 bg-slate-900 text-white flex items-center gap-2">
                         <TrendingUp size={14} className="text-[#39FF14]" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Cumplimiento</span>
                    </div>

                    {/* Donut General */}
                    <div className="p-6 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
                        <div className="relative w-24 h-24">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white" />
                                <circle
                                    cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 42}
                                    strokeDashoffset={2 * Math.PI * 42 * (1 - cumplimientoTotal / 100)}
                                    className="text-[#004B93] transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-slate-800">{cumplimientoTotal}%</span>
                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Cumplimiento Mensual */}
                    <div className="flex-1 p-2 space-y-1">
                        <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Monitor Mensual</span>
                        {MESES.map((mes, idx) => {
                            const s = statsGlobales[idx];
                            const perc = s.plan > 0 ? (s.ejec / s.plan) * 100 : 0;
                            const mesNum = idx + 1;
                            
                            // Lógica de colores del usuario
                            let colorClass = "bg-slate-200 border-slate-300";
                            if (mesNum === currentMes) {
                                colorClass = "bg-yellow-400 border-yellow-600"; // Mes Actual
                            } else if (mesNum < currentMes && perc < 100) {
                                colorClass = "bg-red-500 border-red-800 text-white"; // Pasado sin cumplimiento total
                            } else if (perc === 100) {
                                colorClass = "bg-green-500 border-green-800 text-white"; // Cumplimiento total
                            }

                            return (
                                <div key={mes} className={cn(
                                    "flex items-center justify-between px-3 py-1.5 border transition-all truncate",
                                    colorClass,
                                    !visibleMonths.includes(mesNum) && "opacity-30 blur-[0.5px]"
                                )}>
                                    <span className="text-[9px] font-black uppercase w-8">{mes}</span>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black tabular-nums">{Math.round(perc)}%</span>
                                        <span className="text-[6px] font-bold opacity-70 uppercase leading-none">{s.ejec}/{s.plan}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedCell && (
                <VisitaDetailModal
                    visitas={selectedCell.visits.map(v => ({ ...v, site: selectedCell.row.site, zona: selectedCell.row.zona }))}
                    onClose={() => setSelectedCell(null)}
                />
            )}

            {isPlanningOpen && (
                <PlaneacionModal
                    sedes={sedes}
                    zonas={zonas}
                    initialSedeId={planningData?.sedeId}
                    initialDate={planningData?.date}
                    onClose={() => { setIsPlanningOpen(false); setPlanningData(null); }}
                    onSuccess={() => { setIsPlanningOpen(false); setPlanningData(null); router.refresh(); }}
                />
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #fff; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border: 2px solid #fff; }
            `}</style>
        </div>
    );
}
