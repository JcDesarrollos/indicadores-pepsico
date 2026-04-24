'use client';

import { useRouter } from 'next/navigation';
import { Play, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { deleteVisita } from '@/actions/visitasActions';
import { Visita } from '@/types/visitas';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";

interface Props {
    visitas: (Visita & { site: string, zona: string })[];
    onClose: () => void;
}

export default function VisitaDetailModal({ visitas, onClose }: Props) {
    const router = useRouter();

    const handleExecute = (id: number) => {
        router.push(`/ejecucion-visita/${id}`);
    };

    if (visitas.length === 0) return null;

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border border-slate-200 shadow-lg sm:rounded-lg max-h-[95vh] flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">
                                VISITAS PROGRAMADAS
                            </DialogTitle>
                            <Badge className="bg-[#004B93] text-white text-[9px] px-2 py-0.5 rounded-sm border-none">
                                {visitas[0]?.zona}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-slate-500">
                            {visitas[0]?.site} • Semana {visitas[0]?.semana} - Mes {visitas[0]?.mes}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="px-6 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
                    <div className="flex flex-col gap-3">
                        {visitas.map((visita) => (
                            <div
                                key={visita.id}
                                className="group p-4 rounded-md border border-slate-200 bg-white hover:border-[#004B93] transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className={cn(
                                        "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border",
                                        visita.estado === 'EJECUTADA' ? "bg-green-50 border-green-100 text-green-600" : "bg-blue-50 border-blue-100 text-[#004B93]"
                                    )}>
                                        {visita.estado === 'EJECUTADA' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                    </div>
                                    <div className="flex flex-col text-left flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-slate-800">
                                                Visita #{visita.id}
                                            </span>
                                            <span className={cn(
                                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                visita.estado === 'EJECUTADA' ? "bg-green-500 text-white border-green-600" : "bg-blue-600 text-white border-blue-700"
                                            )}>
                                                {visita.estado}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic mt-0.5 truncate">
                                            {visita.observaciones || 'Sin observaciones.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    <button
                                        onClick={async () => {
                                            if (confirm('¿Estás seguro de eliminar esta planeación?')) {
                                                const res = await deleteVisita(visita.id);
                                                if (res.success) {
                                                    router.refresh();
                                                    onClose();
                                                }
                                            }
                                        }}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleExecute(visita.id)}
                                        className={cn(
                                            "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[10px] font-bold uppercase transition-all",
                                            visita.estado === 'EJECUTADA'
                                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                : "bg-[#004B93] text-white hover:bg-blue-800"
                                        )}
                                    >
                                        {visita.estado === 'EJECUTADA' ? 'Detalles' : 'Iniciar'}
                                        <Play size={12} className={cn(visita.estado === 'EJECUTADA' && "hidden")} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 sm:justify-end flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-bold uppercase text-slate-400">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
