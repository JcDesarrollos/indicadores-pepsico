'use client';

import React, { useState, useEffect } from 'react';
import {
    X, Loader2, User, Calendar, AlertCircle,
    Pencil, Trash2, Check, ArrowLeft,
    Globe, MapPin, Building2, Shield
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    getDetalleRotacionesAction,
    deleteRotacionAction,
    updateRotacionAction
} from "@/actions/rotacionActions";
import { cn } from '@/lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    sedeNom: string;
    mesNum: number;
    anio: number;
    onDataChange: () => void;
}

type AssignmentType = 'NACIONAL' | 'ZONA' | 'SEDE' | 'PUESTO';

export default function DetalleRotacionesModal({
    isOpen,
    onClose,
    sedeNom,
    mesNum,
    anio,
    onDataChange
}: Props) {
    const [loading, setLoading] = useState(true);
    const [rotaciones, setRotaciones] = useState<any[]>([]);

    // Estados para catálogos (necesarios para la cascada en edición)
    const [sedes, setSedes] = useState<any[]>([]);
    const [zonas, setZonas] = useState<any[]>([]);
    const [puestos, setPuestos] = useState<any[]>([]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState({
        tipo: '',
        fecha: '',
        motivo: '',
        assignmentType: 'SEDE' as AssignmentType,
        idDestino: '',
        personalId: 0
    });

    // Estados para cascada en edición
    const [tempZonaId, setTempZonaId] = useState('');
    const [tempSedeId, setTempSedeId] = useState('');

    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchDetails();
            fetchCatalogues();
        }
    }, [isOpen, sedeNom, mesNum, anio]);

    const fetchCatalogues = async () => {
        try {
            const [resSedes, resZonas, resPuestos] = await Promise.all([
                fetch('/api/sedes/activos').then(r => r.json()),
                fetch('/api/zonas/activos').then(r => r.json()),
                fetch('/api/puestos/activos').then(r => r.json())
            ]);
            if (resSedes.success) setSedes(resSedes.data);
            if (resZonas.success) setZonas(resZonas.data);
            if (resPuestos.success) setPuestos(resPuestos.data);
        } catch (e) {
            console.error("Error al cargar catálogos:", e);
        }
    };

    const fetchDetails = async () => {
        setLoading(true);
        const res = await getDetalleRotacionesAction(sedeNom, mesNum, anio);
        if (res.success && res.data) {
            setRotaciones(res.data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Está seguro de eliminar este registro?')) return;
        setActionLoading(true);
        const res = await deleteRotacionAction(id);
        if (res.success) {
            await fetchDetails();
            onDataChange();
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const handleEditStart = (rot: any) => {
        setEditingId(rot.id);

        let zonaId = '';
        let sedeId = '';

        // Búsqueda robusta en los catálogos cargados
        if (rot.assignmentType === 'PUESTO') {
            const puesto = puestos.find(p => String(p.id) === String(rot.idDestino));
            if (puesto) {
                sedeId = String(puesto.idSede || '');
                const sede = sedes.find(s => String(s.id) === String(puesto.idSede));
                if (sede) zonaId = String(sede.idZona || '');
            }
        } else if (rot.assignmentType === 'SEDE') {
            const sede = sedes.find(s => String(s.id) === String(rot.idDestino));
            if (sede) zonaId = String(sede.idZona || '');
            sedeId = String(rot.idDestino || '');
        } else if (rot.assignmentType === 'ZONA') {
            zonaId = String(rot.idDestino || '');
        }

        setEditData({
            tipo: rot.tipo,
            fecha: new Date(rot.fecha).toISOString().split('T')[0],
            motivo: rot.motivo || '',
            assignmentType: rot.assignmentType || 'SEDE',
            idDestino: rot.idDestino?.toString() || '',
            personalId: rot.personalId
        });

        setTempZonaId(zonaId);
        setTempSedeId(sedeId);
    };

    const handleUpdate = async (id: number) => {
        if (editData.tipo === 'ROTACION' && editData.assignmentType !== 'NACIONAL' && !editData.idDestino) {
            alert("Debe seleccionar el destino del traslado.");
            return;
        }

        setActionLoading(true);
        const res = await updateRotacionAction(id, {
            ...editData,
            idDestino: editData.idDestino ? parseInt(editData.idDestino) : null
        });

        if (res.success) {
            setEditingId(null);
            await fetchDetails();
            onDataChange();
        } else {
            alert(res.error);
        }
        setActionLoading(false);
    };

    const MESES = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
                <DialogHeader className="px-8 py-6 bg-slate-900 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-tight">Detalle de Novedades</DialogTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {sedeNom} • {MESES[mesNum - 1]} {anio}
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 bg-slate-50 min-h-[400px] max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="animate-spin text-blue-600" size={40} />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Cargando registros...</span>
                        </div>
                    ) : rotaciones.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay registros encontrados</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rotaciones.map((rot) => (
                                <div key={rot.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    {editingId === rot.id ? (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-slate-400 leading-none">Editando novedad para:</p>
                                                    <h4 className="text-xs font-black text-slate-800 uppercase leading-tight">{rot.colaborador}</h4>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Tipo de Novedad</label>
                                                    <select
                                                        value={editData.tipo}
                                                        onChange={e => setEditData({ ...editData, tipo: e.target.value })}
                                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                    >
                                                        <option value="MAL DESEMPEÑO">MAL DESEMPEÑO</option>
                                                        <option value="RENUNCIA">RENUNCIA</option>
                                                        <option value="ROTACION">ROTACIÓN (TRASLADO)</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Fecha</label>
                                                    <input
                                                        type="date"
                                                        value={editData.fecha}
                                                        onChange={e => setEditData({ ...editData, fecha: e.target.value })}
                                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* CASCADA PARA ROTACION AL EDITAR */}
                                            {editData.tipo === 'ROTACION' && (
                                                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-4 animate-in zoom-in-95 duration-300">
                                                    <label className="text-[9px] font-black uppercase text-indigo-700 block mb-2">Nuevo Destino del Traslado:</label>

                                                    <div className="grid grid-cols-4 gap-2">
                                                        {[
                                                            { id: 'NACIONAL', label: 'Todos', icon: <Globe size={14} /> },
                                                            { id: 'ZONA', label: 'Zona', icon: <MapPin size={14} /> },
                                                            { id: 'SEDE', label: 'Sede', icon: <Building2 size={14} /> },
                                                            { id: 'PUESTO', label: 'Puesto', icon: <Shield size={14} /> }
                                                        ].map(type => (
                                                            <button
                                                                key={type.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditData({ ...editData, assignmentType: type.id as AssignmentType, idDestino: '' });
                                                                    setTempZonaId('');
                                                                    setTempSedeId('');
                                                                }}
                                                                className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all ${editData.assignmentType === type.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'}`}
                                                            >
                                                                {type.icon}
                                                                <span className="text-[8px] font-black uppercase">{type.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-2">
                                                        {editData.assignmentType === 'ZONA' && (
                                                            <select
                                                                className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white"
                                                                value={editData.idDestino}
                                                                onChange={(e) => setEditData({ ...editData, idDestino: e.target.value })}
                                                            >
                                                                <option value="">-- Seleccionar Zona --</option>
                                                                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                                            </select>
                                                        )}

                                                        {editData.assignmentType === 'SEDE' && (
                                                            <>
                                                                <select
                                                                    className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white mb-2"
                                                                    value={tempZonaId}
                                                                    onChange={(e) => {
                                                                        setTempZonaId(e.target.value);
                                                                        setTempSedeId('');
                                                                        setEditData({ ...editData, idDestino: '' });
                                                                    }}
                                                                >
                                                                    <option value="">1. Seleccionar Zona --</option>
                                                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                                                </select>
                                                                <select
                                                                    disabled={!tempZonaId}
                                                                    className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white disabled:opacity-50"
                                                                    value={editData.idDestino}
                                                                    onChange={(e) => setEditData({ ...editData, idDestino: e.target.value })}
                                                                >
                                                                    <option value="">2. Seleccionar Sede --</option>
                                                                    {sedes.filter(s => s.idZona === parseInt(tempZonaId)).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                                </select>
                                                            </>
                                                        )}

                                                        {editData.assignmentType === 'PUESTO' && (
                                                            <>
                                                                <select className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white mb-2" value={tempZonaId} onChange={(e) => { setTempZonaId(e.target.value); setTempSedeId(''); setEditData({ ...editData, idDestino: '' }); }}>
                                                                    <option value="">1. Zona --</option>
                                                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                                                </select>
                                                                <select disabled={!tempZonaId} className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white mb-2 disabled:opacity-50" value={tempSedeId} onChange={(e) => { setTempSedeId(e.target.value); setEditData({ ...editData, idDestino: '' }); }}>
                                                                    <option value="">2. Sede --</option>
                                                                    {sedes.filter(s => s.idZona === parseInt(tempZonaId)).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                                </select>
                                                                <select disabled={!tempSedeId} className="w-full h-10 border border-indigo-200 rounded-xl px-4 text-xs font-bold text-indigo-900 bg-white disabled:opacity-50" value={editData.idDestino} onChange={(e) => setEditData({ ...editData, idDestino: e.target.value })}>
                                                                    <option value="">3. Puesto --</option>
                                                                    {puestos.filter(pu => pu.idSede === parseInt(tempSedeId)).map(pu => <option key={pu.id} value={pu.id}>{pu.nombre}</option>)}
                                                                </select>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Observaciones / Motivo</label>
                                                <textarea
                                                    value={editData.motivo}
                                                    onChange={e => setEditData({ ...editData, motivo: e.target.value })}
                                                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold h-20 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                />
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-[10px] font-black uppercase">
                                                    Cancelar
                                                </Button>
                                                <Button size="sm" onClick={() => handleUpdate(rot.id)} disabled={actionLoading} className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase px-6">
                                                    {actionLoading ? <Loader2 className="animate-spin mr-2" size={12} /> : <Check className="mr-2" size={12} />}
                                                    Guardar Cambios
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 border border-slate-200">
                                                    <User size={18} />
                                                </div>
                                                <div className="space-y-1 min-w-0 flex-1">
                                                    <h4 className="text-sm font-black text-slate-800 leading-tight uppercase">{rot.colaborador}</h4>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold">
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded-full border",
                                                            rot.tipo === 'ROTACION' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                                rot.tipo === 'RENUNCIA' ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                                    "bg-amber-50 text-amber-700 border-amber-100"
                                                        )}>
                                                            {rot.tipo}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-slate-400">
                                                            <Calendar size={12} />
                                                            {new Date(rot.fecha).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {rot.motivo && (
                                                        <p className="text-[10px] text-slate-500 italic mt-2 line-clamp-2 break-all">“{rot.motivo}”</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleEditStart(rot)}
                                                    className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-all"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(rot.id)}
                                                    className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
