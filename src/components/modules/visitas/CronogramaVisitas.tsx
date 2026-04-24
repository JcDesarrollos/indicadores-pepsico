'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar, ChevronLeft, ChevronRight, Settings, Plus, Maximize,
    Search, Filter, CheckCircle2, Clock, MapPin, Building2, AlertCircle,
    Activity, Shield
} from 'lucide-react';
import { VisitaCronogramaRow, VisitaTarea, VisitaEstado, Visita } from '@/types/visitas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
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
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function CronogramaVisitas({ initialData, allTareas, sedes, zonas, currentAnio }: Props) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCell, setSelectedCell] = useState<{ row: VisitaCronogramaRow, visits: Visita[] } | null>(null);
    const [isPlanningOpen, setIsPlanningOpen] = useState(false);
    const [planningData, setPlanningData] = useState<{ sedeId: number, date: string } | null>(null);

    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();

            // Sensibilidad reducida para mayor control
            const zoomSpeed = 0.0008;
            const factor = Math.exp(-e.deltaY * zoomSpeed);

            setScale(prevScale => {
                const newScale = Math.min(Math.max(0.1, prevScale * factor), 2);

                if (Math.abs(newScale - prevScale) > 0.001) {
                    const rect = container.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;

                    setPosition(prevPos => {
                        // Calcular la posición del ratón en el espacio de coordenadas del contenido
                        const mouseInContentX = (mouseX - prevPos.x) / prevScale;
                        const mouseInContentY = (mouseY - prevPos.y) / prevScale;

                        // Nueva posición para mantener el punto bajo el ratón
                        return {
                            x: mouseX - mouseInContentX * newScale,
                            y: mouseY - mouseInContentY * newScale
                        };
                    });
                }

                return newScale;
            });
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            isDragging.current = true;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => { isDragging.current = false; };
    const resetView = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

    // FILTRADO Y AGRUPAMIENTO POR ZONA
    const filteredData = useMemo(() => {
        const filtered = initialData.filter(row =>
            row.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
            row.zona.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Ordenar por zona para que el agrupamiento funcione
        return [...filtered].sort((a, b) => a.zona.localeCompare(b.zona));
    }, [initialData, searchTerm]);

    const changeAnio = (delta: number) => { router.push(`/visitas?anio=${currentAnio + delta}`); };

    return (
        <div className="flex flex-col h-full overflow-hidden relative bg-white">

            <div
                ref={containerRef}
                className="relative w-full h-[88vh] bg-[#F8FAFC] overflow-hidden outline-none cursor-grab active:cursor-grabbing select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* TOOLBAR TÉCNICO */}
                <div className="absolute top-4 left-4 z-[60] flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm">
                    <div className="relative w-72">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            placeholder="BUSCAR EN EL CRONOGRAMA..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-2 py-2 bg-slate-50 text-[10px] font-black outline-none border border-slate-300 focus:border-blue-700"
                        />
                    </div>
                    <button
                        onClick={() => setIsPlanningOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#004B93] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-900 transition-all">
                        <Plus size={14} /> NUEVA PLANEACIÓN
                    </button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <div className="flex items-center gap-3 px-3">
                        <button onClick={() => changeAnio(-1)} className="hover:text-blue-700"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black text-slate-800 w-10 text-center uppercase tracking-tighter">{currentAnio}</span>
                        <button onClick={() => changeAnio(1)} className="hover:text-blue-700"><ChevronRight size={16} /></button>
                    </div>
                </div>

                {/* CONTROLES ZOOM */}
                <div className="absolute bottom-6 right-6 z-[60] flex flex-col gap-1 bg-white/80 backdrop-blur-sm border border-slate-200 p-1 rounded-lg shadow-sm">
                    <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-slate-100"><Plus size={16} /></button>
                    <div className="text-[9px] font-black text-center py-1 border-y border-slate-200">{Math.round(scale * 100)}%</div>
                    <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} className="p-2 hover:bg-slate-100"><div className="w-4 h-0.5 bg-slate-800 mx-auto"></div></button>
                    <button onClick={resetView} className="p-2 hover:bg-slate-100 border-t border-slate-200 mt-1"><Maximize size={16} /></button>
                </div>

                {/* TABLA TIPO EXCEL (GRID RIGID) */}
                <div
                    className="absolute transition-transform duration-75 ease-out origin-top-left"
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        top: '80px',
                        left: '80px'
                    }}
                >
                    <div className="flex items-start gap-12 p-2">
                        <div className="bg-transparent flex flex-col gap-4">
                            {/* ENCABEZADO CORPORATIVO EXCEL STYLE */}
                            <table className="min-w-[2400px] border-collapse bg-white shadow-sm">
                                <tbody>
                                    <tr>
                                        <td colSpan={10} className="border border-slate-200 p-4 text-left text-xl font-black uppercase bg-white text-[#004B93]">
                                            PLANEACIÓN VISITAS CONTRATO SEGURIDAD FISICA PEPSICO - FORTOX AÑO {currentAnio}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={10} className="border border-slate-200 px-4 py-2 text-[11px] font-black uppercase text-slate-400 bg-slate-50/30">
                                            RESPONSABLE:
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-200 px-4 py-3 text-[11px] font-black uppercase bg-slate-100 text-slate-600 w-40">Tema</td>
                                        <td colSpan={2} className="border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 w-[600px]">
                                            Visita Instalaciones Colombia Seguridad Fisica.
                                        </td>
                                        <td className="border border-slate-200 px-4 py-3 text-[11px] font-black uppercase bg-slate-100 text-slate-600 w-40">Responsable</td>
                                        <td className="border border-slate-200 px-4 py-3 text-sm font-bold text-slate-800 w-72">
                                            Administrador de Sistema
                                        </td>
                                        <td className="border border-slate-200 px-4 py-3 text-[11px] font-black uppercase bg-slate-100 text-slate-600 w-40">Objetivo</td>
                                        <td className="border border-slate-200 px-4 py-3 text-[11px] font-bold text-slate-800 flex-1 min-w-[500px]">
                                            Realizar visitas a las instalaciones con el fin de identificar vulnerabilidades en los procesos de seguridad física.
                                        </td>
                                        <td className="border border-slate-200 p-0 w-40">
                                            <div className="flex h-full min-h-[44px]">
                                                <div className="w-14 bg-[#004B93] border-r border-slate-200"></div>
                                                <div className="flex-1 flex items-center justify-center text-[10px] font-black uppercase px-2 bg-slate-50">Planeado</div>
                                            </div>
                                        </td>
                                        <td className="border border-slate-200 p-0 w-40">
                                            <div className="flex h-full min-h-[44px]">
                                                <div className="w-14 bg-[#39FF14] border-r border-slate-200"></div>
                                                <div className="flex-1 flex items-center justify-center text-[10px] font-black uppercase px-2 bg-slate-50">Ejecutado</div>
                                            </div>
                                        </td>
                                        <td className="border border-slate-200 p-0 w-28">
                                            <div className="flex flex-col h-full">
                                                <div className="bg-slate-100 py-1 text-center text-[9px] font-black border-b border-slate-200">AÑO</div>
                                                <div className="flex-1 flex items-center justify-center text-lg font-black">{currentAnio}</div>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="min-w-[2400px] border-collapse bg-transparent">
                                <thead>
                                    <tr className="bg-slate-800 text-white">
                                        <th colSpan={2} className="border border-slate-200 p-2 text-left text-[9px] uppercase tracking-widest font-black">
                                            Control y Seguimiento de Visitas Anual
                                        </th>
                                        {MESES.map(m => (
                                            <th key={m} colSpan={4} className="border border-slate-200 py-1.5 text-[10px] font-black uppercase text-center bg-[#004B93]">
                                                {m}
                                            </th>
                                        ))}
                                    </tr>
                                    <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-200">
                                        <th className="border border-slate-200 px-4 py-1 text-left w-44 text-[10px] font-black">ZONA</th>
                                        <th className="border border-slate-200 px-4 py-1 text-left w-56 text-[10px] font-black">SITE</th>
                                        {Array.from({ length: 48 }).map((_, i) => (
                                            <th key={i} className="border border-slate-200 w-8 text-[8px] font-black text-center bg-white">
                                                S{(i % 4) + 1}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => {
                                        const isFirstInZona = index === 0 || filteredData[index - 1].zona !== row.zona;
                                        return (
                                            <tr key={row.idSede} className="h-10 hover:bg-slate-50 transition-colors group">
                                                <td className={cn(
                                                    "border border-slate-200 px-4 text-[10px] font-black leading-tight",
                                                    !isFirstInZona && "text-transparent border-t-0"
                                                )}>
                                                    {row.zona}
                                                </td>
                                                <td className="border border-slate-200 px-4 text-[10px] font-black text-[#004B93] bg-slate-50 group-hover:bg-blue-50">
                                                    {row.site}
                                                </td>
                                                {Array.from({ length: 48 }).map((_, i) => {
                                                    const mes = Math.floor(i / 4) + 1;
                                                    const sem = (i % 4) + 1;
                                                    const key = `M${mes}-S${sem}`;
                                                    const visits = row.plan[key] || [];
                                                    const hasExecuted = visits.some(v => v.estado === 'EJECUTADA');
                                                    const hasPlanned = visits.some(v => v.estado === 'PLANEADA');

                                                    return (
                                                        <td key={i} className="border border-slate-200 p-0 relative h-10">
                                                            {visits.length > 0 ? (
                                                                <div
                                                                    onClick={() => setSelectedCell({ row, visits })}
                                                                    className={cn(
                                                                        "absolute inset-0 cursor-pointer transition-all hover:brightness-110",
                                                                        hasExecuted ? "bg-[#39FF14]" : "bg-[#004B93]"
                                                                    )}
                                                                />
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        const dia = Math.min((sem - 1) * 7 + 1, 28);
                                                                        const d = new Date(currentAnio, mes - 1, dia);
                                                                        setPlanningData({
                                                                            sedeId: row.idSede,
                                                                            date: d.toISOString().split('T')[0]
                                                                        });
                                                                        setIsPlanningOpen(true);
                                                                    }}
                                                                    className="absolute inset-0 w-full h-full hover:bg-blue-50/50 transition-colors"
                                                                />
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col gap-4 w-[320px] shrink-0">
                            <div className="border border-slate-200 p-6 bg-white flex flex-col gap-6 rounded-xl">
                                <div className="border-b border-slate-100 pb-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 leading-none tracking-widest">Cumplimiento Global</span>
                                </div>

                                {/* GRÁFICO DE DONA SVG */}
                                <div className="relative flex flex-col items-center py-4">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            className="text-slate-100"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="12"
                                            fill="transparent"
                                            strokeDasharray={Math.PI * 2 * 56}
                                            strokeDashoffset={Math.PI * 2 * 56 * (1 - cumplimientoTotal / 100)}
                                            className="text-[#004B93] transition-all duration-1000 ease-out"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                                        <span className="text-2xl font-black text-slate-800 leading-none">{cumplimientoTotal}%</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Ejecutado</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Planeado</span>
                                        <span className="text-xl font-black text-slate-800">{statsGlobales.reduce((acc, s) => acc + s.plan, 0)}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-100 pl-4">
                                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ejecutado</span>
                                        <span className="text-xl font-black text-[#004B93]">{statsGlobales.reduce((acc, s) => acc + s.ejec, 0)}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-1 border-t border-slate-100 pt-6">
                                    {MESES.map((m, idx) => {
                                        const s = statsGlobales[idx];
                                        const perc = s.plan > 0 ? (s.ejec / s.plan) * 100 : 0;
                                        return (
                                            <div key={m} className="flex flex-col items-center gap-1 group">
                                                <div className="w-full h-8 bg-slate-50 relative overflow-hidden">
                                                    <div className="absolute bottom-0 left-0 w-full bg-[#004B93]/20" style={{ height: '100%' }} />
                                                    <div className="absolute bottom-0 left-0 w-full bg-[#004B93] transition-all duration-500" style={{ height: `${perc}%` }} />
                                                </div>
                                                <span className="text-[7px] font-black opacity-40 uppercase">{m.substring(0, 3)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
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
                    onSuccess={() => {
                        setIsPlanningOpen(false);
                        setPlanningData(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}
