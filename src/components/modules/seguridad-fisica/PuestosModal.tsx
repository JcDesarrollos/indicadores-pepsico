'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, Loader2, Home } from 'lucide-react';
import { getPuestosBySede } from '@/actions/dashboardActions';

interface Props {
    idSede: number;
    siteName: string;
    onClose: () => void;
}

export default function PuestosModal({ idSede, siteName, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [puestos, setPuestos] = useState<any[]>([]);

    useEffect(() => {
        // Bloquear scroll del body
        document.body.style.overflow = 'hidden';

        getPuestosBySede(idSede).then(res => {
            if (res.success) setPuestos(res.data || []);
            setLoading(false);
        });

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [idSede]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg">
                            <Home size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                                Detalle de Puestos
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                SEDE: {siteName}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto custom-scrollbar flex-1 min-h-[300px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 min-h-[300px]">
                            <Loader2 size={32} className="text-indigo-600 animate-spin" />
                        </div>
                    ) : puestos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No hay puestos activos en esta sede</span>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-left border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-[70%]">Nombre del Puesto</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Modalidad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {puestos.map((p, i) => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-900 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-200">
                                            {p.nombre}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                                {p.modalidad || 'N/A'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                        Cerrar Detalle
                    </button>
                </div>
            </div>
        </div>
    );
}
