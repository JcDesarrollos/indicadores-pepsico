'use client';

import { useRouter } from 'next/navigation';
import { X, Play, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { deleteVisita } from '@/actions/visitasActions';
import { Visita, VisitaTarea } from '@/types/visitas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Props {
    visitas: (Visita & { site: string, zona: string })[];
    onClose: () => void;
}

export default function VisitaDetailModal({ visitas, onClose }: Props) {
    const router = useRouter();

    const handleExecute = (id: number) => {
        router.push(`/ejecucion-visita/${id}`);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                                Visitas Programadas
                            </h2>
                            <Badge className="bg-[#004B93] text-white font-black text-[10px] px-2.5 py-0.5 rounded-full border-none">
                                {visitas[0]?.zona}
                            </Badge>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {visitas[0]?.site} <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Semana {visitas[0]?.semana} - Mes {visitas[0]?.mes}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Lista */}
                <div className="p-10 overflow-y-auto">
                    <div className="flex flex-col gap-6">
                        {visitas.map((visita) => (
                            <div
                                key={visita.id}
                                className="group p-8 rounded-[2rem] border-2 border-slate-50 bg-slate-50/30 hover:border-[#004B93] hover:bg-white transition-all hover:shadow-xl hover:shadow-blue-500/5 flex items-center justify-between gap-8"
                            >
                                <div className="flex items-center gap-8">
                                    <div className={cn(
                                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                        visita.estado === 'EJECUTADA' ? "bg-green-100 text-green-600" : "bg-blue-100 text-[#004B93]"
                                    )}>
                                        {visita.estado === 'EJECUTADA' ? <CheckCircle2 size={32} /> : <Clock size={32} />}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-black text-slate-800 uppercase">
                                                Visita #{visita.id}
                                            </span>
                                            <Badge className={cn(
                                                "text-[9px] font-black px-2.5 py-0.5 rounded-full border-none uppercase shadow-sm",
                                                visita.estado === 'EJECUTADA' ? "bg-green-500 text-white" : "bg-blue-600 text-white"
                                            )}>
                                                {visita.estado}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                            {visita.observaciones || 'Sin observaciones previas para esta planeación.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={async () => {
                                            if (confirm('¿Estás seguro de eliminar esta planeación y todas sus evidencias?')) {
                                                const res = await deleteVisita(visita.id);
                                                if (res.success) {
                                                    router.refresh();
                                                    onClose();
                                                }
                                            }
                                        }}
                                        className="p-4 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                        title="Eliminar Visita"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleExecute(visita.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg",
                                            visita.estado === 'EJECUTADA'
                                                ? "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-slate-200/50"
                                                : "bg-[#004B93] text-white hover:bg-blue-900 hover:translate-x-1 shadow-blue-900/20"
                                        )}
                                    >
                                        {visita.estado === 'EJECUTADA' ? 'Ver Detalles' : 'Iniciar Ejecución'}
                                        <Play size={16} className={cn(visita.estado === 'EJECUTADA' && "hidden")} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-10 py-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 text-[11px] font-black text-slate-400 hover:text-slate-800 hover:bg-white rounded-xl uppercase tracking-widest transition-all"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
}
