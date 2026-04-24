'use client';

import React, { useEffect, useState } from 'react';
import { X, Search, Loader2, Home, Pencil, Save, Power, PowerOff } from 'lucide-react';
import { getPuestosBySede, getModalidades, updatePuesto } from '@/actions/puestosActions';
import { Puesto, ModalidadPuesto } from '@/types/puesto';
import { toast } from 'sonner';

interface Props {
    idSede: number;
    siteName: string;
    onClose: () => void;
}

export default function PuestosModal({ idSede, siteName, onClose }: Props) {
    const [loading, setLoading] = useState(true);
    const [puestos, setPuestos] = useState<Puesto[]>([]);
    const [modalidades, setModalidades] = useState<ModalidadPuesto[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Partial<Puesto>>({});
    const [saving, setSaving] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [pRes, mRes] = await Promise.all([
            getPuestosBySede(idSede),
            getModalidades()
        ]);

        if (pRes.success) setPuestos(pRes.data || []);
        if (mRes.success) setModalidades(mRes.data || []);
        setLoading(false);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        fetchData();
        return () => { document.body.style.overflow = 'unset'; };
    }, [idSede]);

    const handleEdit = (p: Puesto) => {
        setEditingId(p.id);
        setEditData({ ...p });
    };

    const handleSave = async () => {
        if (!editingId) return;
        setSaving(true);
        const res = await updatePuesto(editingId, editData);
        if (res.success) {
            toast.success('Puesto actualizado correctamente');
            setEditingId(null);
            fetchData();
        } else {
            toast.error('Error al actualizar el puesto');
        }
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[85vh]">

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
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No hay puestos registrados en esta sede</span>
                        </div>
                    ) : (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-left border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Nombre</th>
                                    <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Modalidad</th>
                                    <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado</th>
                                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {puestos.map((p) => {
                                    const isEditing = editingId === p.id;
                                    return (
                                        <tr key={p.id} className={`border-b border-slate-50 dark:border-slate-900 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${p.activo === 'NO' ? 'opacity-60 bg-slate-50/30' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        value={editData.nombre}
                                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value.toUpperCase() })}
                                                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    />
                                                ) : (
                                                    <span className={`text-sm font-bold ${p.activo === 'NO' ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {p.nombre}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {isEditing ? (
                                                    <select
                                                        value={editData.idModalidad || 0}
                                                        onChange={(e) => setEditData({ ...editData, idModalidad: parseInt(e.target.value) })}
                                                        className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    >
                                                        <option value="0">N/A</option>
                                                        {modalidades.map(m => (
                                                            <option key={m.id} value={m.id}>{m.nombre}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                                        {p.modalidad || 'N/A'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {isEditing ? (
                                                    <button
                                                        onClick={() => setEditData({ ...editData, activo: editData.activo === 'SI' ? 'NO' : 'SI' })}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${editData.activo === 'SI' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20'}`}
                                                    >
                                                        {editData.activo === 'SI' ? <Power size={12} /> : <PowerOff size={12} />}
                                                        {editData.activo === 'SI' ? 'ACTIVO' : 'INACTIVO'}
                                                    </button>
                                                ) : (
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${p.activo === 'SI' ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'text-rose-500 bg-rose-50 dark:bg-rose-900/10'}`}>
                                                        {p.activo === 'SI' ? 'ACTIVO' : 'INACTIVO'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            disabled={saving}
                                                            onClick={handleSave}
                                                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                                                        >
                                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-500 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
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
