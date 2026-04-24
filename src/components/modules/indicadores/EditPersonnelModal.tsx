'use client';

import React, { useState, useEffect } from 'react';
import {
    X, Camera, Loader2, User, Pencil, Check,
    ChevronDown, UserPlus, Globe, MapPin, Building2, Shield
} from 'lucide-react';
import {
    updatePersonnel, createPersonnel, uploadPhoto,
    getPersonnelList, getCargos, getSedes, getZonas, getPuestos
} from '@/actions/personnelActions';
import { PersonalNode } from '@/services/indicadoresService';

interface Props {
    person?: PersonalNode;
    onClose: () => void;
    mode: 'edit' | 'create';
}

type AssignmentType = 'NACIONAL' | 'ZONA' | 'SEDE' | 'PUESTO';

export default function EditPersonnelModal({ person, onClose, mode }: Props) {
    const [loading, setLoading] = useState(false);
    const [photoLoading, setPhotoLoading] = useState(false);
    const [jefes, setJefes] = useState<{ id: number, nombre: string }[]>([]);
    const [cargos, setCargos] = useState<{ id: number, nombre: string }[]>([]);
    const [sedes, setSedes] = useState<{ id: number, nombre: string, idZona: number }[]>([]);
    const [zonas, setZonas] = useState<{ id: number, nombre: string }[]>([]);
    const [puestos, setPuestos] = useState<{ id: number, nombre: string, idSede: number }[]>([]);

    const [formData, setFormData] = useState({
        nombre: person?.nombre || '',
        cargoLargo: person?.cargo || '',
        idJefe: person?.idJefe || null,
        idCargo: person?.idCargo || 2,
        genero: person?.genero || 'HOMBRE',
        foto: person?.foto || null,
        activo: person?.activo || 'SI',
        assignmentType: (person?.idPuesto ? 'PUESTO' : person?.idSede ? 'SEDE' : person?.idCiudad ? 'ZONA' : 'NACIONAL') as AssignmentType,
        idSede: person?.idSede || null,
        idPuesto: person?.idPuesto || null,
        idCiudad: person?.idCiudad || null
    });

    useEffect(() => {
        Promise.all([
            getPersonnelList(), getCargos(), getSedes(), getZonas(), getPuestos()
        ]).then(([pList, cList, sList, zList, puList]) => {
            setJefes(pList.filter(p => !person || p.id !== person.id));
            setCargos(cList);
            setSedes(sList);
            setZonas(zList);
            setPuestos(puList);
        });
    }, [person]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoLoading(true);
        const fData = new FormData();
        fData.append('photo', file);

        const res = await uploadPhoto(fData, formData.foto || undefined);
        if (res.success) {
            setFormData(prev => ({ ...prev, foto: res.url || null }));
        }
        setPhotoLoading(false);
    };

    const handleSubmit = async () => {
        if (!formData.nombre || !formData.cargoLargo) return;
        setLoading(true);

        // Limpiar IDs según el tipo de asignación
        const cleanedData = {
            ...formData,
            idSede: formData.assignmentType === 'SEDE' ? formData.idSede : null,
            idCiudad: formData.assignmentType === 'ZONA' ? formData.idCiudad : null,
            idPuesto: formData.assignmentType === 'PUESTO' ? formData.idPuesto : null,
            // En Nacional todos son null
        };

        const res = mode === 'edit' && person
            ? await updatePersonnel(person.id, {
                cargo: cleanedData.cargoLargo,
                idJefe: cleanedData.idJefe,
                foto: cleanedData.foto || undefined,
                genero: cleanedData.genero,
                activo: cleanedData.activo,
                idCargo: cleanedData.idCargo,
                idSede: cleanedData.idSede,
                idPuesto: cleanedData.idPuesto,
                idCiudad: cleanedData.idCiudad
            })
            : await createPersonnel({
                nombre: cleanedData.nombre,
                cargo: cleanedData.cargoLargo,
                idJefe: cleanedData.idJefe,
                genero: cleanedData.genero,
                foto: cleanedData.foto || undefined,
                activo: cleanedData.activo,
                idCargo: cleanedData.idCargo,
                idSede: cleanedData.idSede,
                idPuesto: cleanedData.idPuesto,
                idCiudad: cleanedData.idCiudad
            });

        if (res.success) onClose();
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 h-auto max-h-[90vh]">

                {/* Header Compacto */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#004B93] rounded-lg text-white">
                            {mode === 'edit' ? <Pencil size={16} /> : <UserPlus size={16} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                                {mode === 'edit' ? 'Editar Colaborador' : 'Nuevo Colaborador'}
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Gestión de Talento Pepsico</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* Columna Foto (3 cols) */}
                        <div className="md:col-span-4 flex flex-col items-center gap-4">
                            <div className="relative group w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                                {formData.foto ? (
                                    <img src={formData.foto} className="w-full h-full object-cover" alt="Foto" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                        <User size={48} strokeWidth={1} />
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">Sin Fotografía</span>
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-white gap-2 backdrop-blur-[2px]">
                                    {photoLoading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        <>
                                            <Camera size={24} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Cambiar Imagen</span>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={photoLoading} />
                                </label>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Formato 3:4 Recomendado</span>
                        </div>

                        {/* Columna Datos (8 cols) */}
                        <div className="md:col-span-8 flex flex-col gap-5">

                            {/* Fila 1: Nombre y Estado */}
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-8">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre Completo</label>
                                    <input
                                        value={formData.nombre}
                                        onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#004B93] transition-all"
                                        placeholder="Ej. Juan Pérez"
                                        readOnly={mode === 'edit'}
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Estado</label>
                                    <div className="flex justify-center">
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, activo: p.activo === 'SI' ? 'NO' : 'SI' }))}
                                            className={`relative w-14 h-7 rounded-full transition-all duration-300 group ${formData.activo === 'SI' ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${formData.activo === 'SI' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                                            <span className={`absolute ${formData.activo === 'SI' ? 'left-2' : 'right-2'} text-[8px] font-black text-white top-1.5`}>
                                                {formData.activo === 'SI' ? 'ACT' : 'INA'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Fila 2: Categoría */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Categoría Operativa</label>
                                    <div className="relative">
                                        <select
                                            value={formData.idCargo}
                                            onChange={e => setFormData(p => ({ ...p, idCargo: Number(e.target.value) }))}
                                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-800 dark:text-white outline-none focus:border-[#004B93] transition-all pr-10"
                                        >
                                            {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Género</label>
                                    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex gap-1 border border-slate-200 dark:border-slate-800">
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, genero: 'HOMBRE' }))}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.genero === 'HOMBRE' ? 'bg-[#004B93] text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
                                        >HOMBRE</button>
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, genero: 'MUJER' }))}
                                            className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.genero === 'MUJER' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}
                                        >MUJER</button>
                                    </div>
                                </div>
                            </div>

                            {/* Fila 3: Pertenece a... (NUEVO) */}
                            <div>
                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ámbito de Pertenencia / Alcance</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'NACIONAL', label: 'Todos', icon: <Globe size={14} /> },
                                        { id: 'ZONA', label: 'Zona', icon: <MapPin size={14} /> },
                                        { id: 'SEDE', label: 'Sede', icon: <Building2 size={14} /> },
                                        { id: 'PUESTO', label: 'Puesto', icon: <Shield size={14} /> }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData(p => ({ ...p, assignmentType: type.id as AssignmentType }))}
                                            className={`flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${formData.assignmentType === type.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {type.icon}
                                            <span className="text-[8px] font-black uppercase tracking-tighter">{type.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Selección Condicional de LOV en Cascada */}
                                <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                    {formData.assignmentType === 'ZONA' && (
                                        <div className="relative">
                                            <select
                                                value={formData.idCiudad || ''}
                                                onChange={e => setFormData(p => ({ ...p, idCiudad: Number(e.target.value) }))}
                                                className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10"
                                            >
                                                <option value="">-- Seleccionar Zona (Ciudad) --</option>
                                                {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                        </div>
                                    )}
                                    {formData.assignmentType === 'SEDE' && (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <select
                                                    value={formData.idCiudad || ''}
                                                    onChange={e => setFormData(p => ({ ...p, idCiudad: Number(e.target.value), idSede: null }))}
                                                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10"
                                                >
                                                    <option value="">1. Seleccionar Zona --</option>
                                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    disabled={!formData.idCiudad}
                                                    value={formData.idSede || ''}
                                                    onChange={e => setFormData(p => ({ ...p, idSede: Number(e.target.value) }))}
                                                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10 disabled:opacity-50"
                                                >
                                                    <option value="">2. Seleccionar Sede --</option>
                                                    {sedes.filter(s => s.idZona === formData.idCiudad).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    )}
                                    {formData.assignmentType === 'PUESTO' && (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <select
                                                    value={formData.idCiudad || ''}
                                                    onChange={e => setFormData(p => ({ ...p, idCiudad: Number(e.target.value), idSede: null, idPuesto: null }))}
                                                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10"
                                                >
                                                    <option value="">1. Seleccionar Zona --</option>
                                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    disabled={!formData.idCiudad}
                                                    value={formData.idSede || ''}
                                                    onChange={e => setFormData(p => ({ ...p, idSede: Number(e.target.value), idPuesto: null }))}
                                                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10 disabled:opacity-50"
                                                >
                                                    <option value="">2. Seleccionar Sede --</option>
                                                    {sedes.filter(s => s.idZona === formData.idCiudad).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    disabled={!formData.idSede}
                                                    value={formData.idPuesto || ''}
                                                    onChange={e => setFormData(p => ({ ...p, idPuesto: Number(e.target.value) }))}
                                                    className="w-full appearance-none px-4 py-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-900/30 text-sm font-semibold outline-none focus:border-indigo-500 transition-all pr-10 disabled:opacity-50"
                                                >
                                                    <option value="">3. Seleccionar Puesto Específico --</option>
                                                    {puestos.filter(pu => pu.idSede === formData.idSede).map(pu => <option key={pu.id} value={pu.id}>{pu.nombre}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 text-indigo-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fila 4: Cargo Detallado y Jefe */}
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-7">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Posición Detallada (Nomina)</label>
                                    <input
                                        value={formData.cargoLargo}
                                        onChange={e => setFormData(p => ({ ...p, cargoLargo: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 outline-none focus:border-[#004B93] transition-all"
                                        placeholder="Ej. ADMINISTRADOR DE CONTRATO FUNZA"
                                    />
                                </div>
                                <div className="col-span-5">
                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Jefe Directo</label>
                                    <div className="relative">
                                        <select
                                            value={formData.idJefe || ''}
                                            onChange={e => setFormData(p => ({ ...p, idJefe: e.target.value ? Number(e.target.value) : null }))}
                                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 outline-none focus:border-[#004B93] transition-all pr-10 italic"
                                        >
                                            <option value="">-- Ninguno (Raíz) --</option>
                                            {jefes.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Compacto */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 border border-slate-200 dark:border-slate-800"
                    >
                        Descartar
                    </button>
                    <button
                        disabled={loading || !formData.nombre || !formData.cargoLargo}
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#004B93] text-white font-black text-[10px] uppercase tracking-[0.1em] hover:bg-[#003a72] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                        {mode === 'edit' ? 'Guardar Cambios' : 'Crear Colaborador'}
                    </button>
                </div>
            </div>
        </div>
    );
}
