'use client';

import React, { useState, useEffect } from 'react';
import {
    Camera, Loader2, User, Pencil, Check,
    UserPlus, Globe, MapPin, Building2, Shield
} from 'lucide-react';
import {
    updatePersonnel, createPersonnel, uploadPhoto,
    getPersonnelList, getCargos, getSedes, getZonas, getPuestos
} from '@/actions/personnelActions';
import { PersonalNode } from '@/services/indicadoresService';
import SearchableLOV from '@/components/ui/searchable-lov';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
            setCargos(cList.sort((a, b) => a.nombre.localeCompare(b.nombre)));
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

        const cleanedData = {
            ...formData,
            idSede: formData.assignmentType === 'SEDE' ? formData.idSede : null,
            idCiudad: formData.assignmentType === 'ZONA' ? formData.idCiudad : null,
            idPuesto: formData.assignmentType === 'PUESTO' ? formData.idPuesto : null,
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
        <Dialog open={true} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        {mode === 'edit' ? <Pencil className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
                        <DialogTitle className="text-xl">
                            {mode === 'edit' ? 'Editar Colaborador' : 'Nuevo Colaborador'}
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Gestione la información del perfil operativo y su ubicación en la red.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4">
                    {/* Foto */}
                    <div className="md:col-span-4 flex flex-col items-center gap-2">
                        <div className="relative group w-full aspect-[3/4] bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all hover:ring-2 hover:ring-primary/20">
                            {formData.foto ? (
                                <img src={formData.foto} className="w-full h-full object-cover" alt="Foto" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-2">
                                    <User size={64} strokeWidth={1} />
                                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] opacity-30">SIN FOTO</span>
                                </div>
                            )}

                            <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all text-white gap-2 backdrop-blur-sm">
                                {photoLoading ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                                <span className="text-[10px] font-semibold uppercase">Actualizar</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={photoLoading} />
                            </label>
                        </div>
                    </div>

                    {/* Datos */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-9 space-y-2">
                                <Label className="text-xs">Nombre Completo</Label>
                                <Input
                                    value={formData.nombre}
                                    onChange={e => setFormData(p => ({ ...p, nombre: e.target.value.toUpperCase() }))}
                                    className="h-9 font-medium"
                                    placeholder="EJ. JUAN PÉREZ"
                                    readOnly={mode === 'edit'}
                                />
                            </div>
                            <div className="col-span-3 space-y-2">
                                <Label className="text-xs block text-center">Activo</Label>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, activo: p.activo === 'SI' ? 'NO' : 'SI' }))}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${formData.activo === 'SI' ? 'bg-primary' : 'bg-slate-200'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.activo === 'SI' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <SearchableLOV
                                label="Categoría"
                                options={cargos.map(c => ({ id: c.id, label: c.nombre }))}
                                value={formData.idCargo}
                                onChange={val => setFormData(p => ({ ...p, idCargo: Number(val) }))}
                            />
                            <div className="space-y-2">
                                <Label className="text-xs">Género</Label>
                                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 border rounded-md">
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, genero: 'HOMBRE' }))}
                                        className={`flex-1 py-1 text-[10px] font-semibold rounded-sm transition-all ${formData.genero === 'HOMBRE' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >HOMBRE</button>
                                    <button
                                        onClick={() => setFormData(p => ({ ...p, genero: 'MUJER' }))}
                                        className={`flex-1 py-1 text-[10px] font-semibold rounded-sm transition-all ${formData.genero === 'MUJER' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >MUJER</button>
                                </div>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Asignación de Lugar</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: 'NACIONAL', label: 'Todos', icon: <Globe size={14} /> },
                                    { id: 'ZONA', label: 'Zona', icon: <MapPin size={14} /> },
                                    { id: 'SEDE', label: 'Sede', icon: <Building2 size={14} /> },
                                    { id: 'PUESTO', label: 'Puesto', icon: <Shield size={14} /> }
                                ].map(type => (
                                    <Button
                                        key={type.id}
                                        variant={formData.assignmentType === type.id ? 'default' : 'outline'}
                                        size="sm"
                                        className="h-auto flex-col py-2 gap-1"
                                        onClick={() => setFormData(p => ({ ...p, assignmentType: type.id as AssignmentType }))}
                                    >
                                        {type.icon}
                                        <span className="text-[10px] font-medium">{type.label}</span>
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-3">
                                {formData.assignmentType === 'ZONA' && (
                                    <SearchableLOV
                                        options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                                        value={formData.idCiudad}
                                        onChange={val => setFormData(p => ({ ...p, idCiudad: Number(val) }))}
                                        placeholder="Seleccionar Ciudad..."
                                    />
                                )}
                                {formData.assignmentType === 'SEDE' && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <SearchableLOV
                                            options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                                            value={formData.idCiudad}
                                            onChange={val => setFormData(p => ({ ...p, idCiudad: Number(val), idSede: null }))}
                                            placeholder="1. Ciudad"
                                        />
                                        <SearchableLOV
                                            disabled={!formData.idCiudad}
                                            options={sedes.filter(s => s.idZona === formData.idCiudad).map(s => ({ id: s.id, label: s.nombre }))}
                                            value={formData.idSede}
                                            onChange={val => setFormData(p => ({ ...p, idSede: Number(val) }))}
                                            placeholder="2. Sede"
                                        />
                                    </div>
                                )}
                                {formData.assignmentType === 'PUESTO' && (
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <SearchableLOV
                                                options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                                                value={formData.idCiudad}
                                                onChange={val => setFormData(p => ({ ...p, idCiudad: Number(val), idSede: null, idPuesto: null }))}
                                                placeholder="1. Ciudad"
                                            />
                                            <SearchableLOV
                                                disabled={!formData.idCiudad}
                                                options={sedes.filter(s => s.idZona === formData.idCiudad).map(s => ({ id: s.id, label: s.nombre }))}
                                                value={formData.idSede}
                                                onChange={val => setFormData(p => ({ ...p, idSede: Number(val), idPuesto: null }))}
                                                placeholder="2. Sede"
                                            />
                                        </div>
                                        <SearchableLOV
                                            disabled={!formData.idSede}
                                            options={puestos.filter(pu => pu.idSede === formData.idSede).map(pu => ({ id: pu.id, label: pu.nombre }))}
                                            value={formData.idPuesto}
                                            onChange={val => setFormData(p => ({ ...p, idPuesto: Number(val) }))}
                                            placeholder="3. Puesto Específico"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 pt-2">
                            <div className="col-span-7 space-y-2">
                                <Label className="text-xs">Cargo Nómina</Label>
                                <Input
                                    value={formData.cargoLargo}
                                    onChange={e => setFormData(p => ({ ...p, cargoLargo: e.target.value.toUpperCase() }))}
                                    className="h-9 text-[11px] font-medium text-slate-500"
                                />
                            </div>
                            <div className="col-span-5">
                                <SearchableLOV
                                    label="Jefe Directo"
                                    options={jefes.map(j => ({ id: j.id, label: j.nombre }))}
                                    value={formData.idJefe}
                                    onChange={val => setFormData(p => ({ ...p, idJefe: val ? Number(val) : null }))}
                                    placeholder="NINGUNO"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button
                        disabled={loading || !formData.nombre}
                        onClick={handleSubmit}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        {mode === 'edit' ? 'Guardar Cambios' : 'Crear Colaborador'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
