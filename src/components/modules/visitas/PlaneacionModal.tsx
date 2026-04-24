'use client';

import React, { useState } from 'react';
import {
    X, Calendar, Building2, Search,
    Check, Loader2, Plus
} from 'lucide-react';
import { createPlaneacionVisita } from '@/actions/visitasActions';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface Props {
    sedes: { id: number, nombre: string, idZona: number }[];
    zonas: { id: number, nombre: string }[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function PlaneacionModal({ sedes, zonas, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedZona, setSelectedZona] = useState<number | null>(null);
    const [selectedSede, setSelectedSede] = useState<number | null>(null);
    const [fecha, setFecha] = useState('');

    const filteredSedes = sedes.filter(s => {
        const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesZona = !selectedZona || s.idZona === selectedZona;
        return matchesSearch && matchesZona;
    });

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                <DialogHeader className="px-8 py-6 border-b border-slate-50 bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#004B93]/5 text-[#004B93] rounded-2xl flex items-center justify-center border border-[#004B93]/10">
                            <Plus size={24} />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight uppercase">Nueva Planeación</DialogTitle>
                            <DialogDescription className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                                SGI-OS Seguridad PepsiCo
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6 bg-slate-50/20">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Fecha de Visita */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Fecha Programada</Label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={e => setFecha(e.target.value)}
                                    className="pl-11 h-11 bg-white border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:ring-[#004B93]/10"
                                />
                            </div>
                        </div>

                        {/* Selector de Zona */}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Zona (Ciudad)</Label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <select
                                    value={selectedZona || ''}
                                    onChange={e => {
                                        setSelectedZona(e.target.value ? Number(e.target.value) : null);
                                        setSelectedSede(null);
                                    }}
                                    className="w-full pl-11 h-11 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none appearance-none px-4"
                                >
                                    <option value="">-- Todas --</option>
                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Selector de Sede */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1 tracking-widest">Instalación (Site)</Label>
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <div className="relative border-b border-slate-100">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    placeholder="BUSCAR SITE..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="border-none pl-11 py-5 h-12 text-[10px] font-bold uppercase bg-transparent focus-visible:ring-0"
                                />
                            </div>
                            <ScrollArea className="h-44">
                                <div className="p-1 space-y-0.5">
                                    {filteredSedes.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedSede(s.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left transition-all",
                                                selectedSede === s.id ? 'bg-[#004B93]/5 text-[#004B93]' : 'hover:bg-slate-50'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                                    selectedSede === s.id ? "bg-[#004B93] text-white" : "bg-slate-100 text-slate-400"
                                                )}>
                                                    <Building2 size={13} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase leading-none">{s.nombre}</span>
                                            </div>
                                            {selectedSede === s.id && <div className="w-4 h-4 bg-[#004B93] rounded-full flex items-center justify-center text-white"><Check size={8} /></div>}
                                        </button>
                                    ))}
                                    {filteredSedes.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 italic text-[10px] uppercase font-bold tracking-widest">
                                            No se encontraron sitios
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 bg-white border-t border-slate-50 flex items-center justify-between gap-4">
                    <Button variant="ghost" onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Cancelar
                    </Button>
                    <Button
                        disabled={loading || !selectedSede || !fecha}
                        onClick={async () => {
                            setLoading(true);
                            const res = await createPlaneacionVisita({ idSede: selectedSede!, fecha });
                            if (res.success) onSuccess();
                            setLoading(false);
                        }}
                        className="px-8 bg-[#004B93] hover:bg-[#003a73] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/10 gap-2 h-11"
                    >
                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                        Confirmar Registro
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 