'use client';

import React, { useState } from 'react';
import {
    Calendar, Building2, Search,
    Check, Loader2
} from 'lucide-react';
import { createPlaneacionVisita } from '@/actions/visitasActions';
import { cn } from '@/lib/utils';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface Props {
    sedes: { id: number, nombre: string, idZona: number }[];
    zonas: { id: number, nombre: string }[];
    onClose: () => void;
    onSuccess: () => void;
    initialSedeId?: number;
    initialDate?: string;
}

export default function PlaneacionModal({ sedes, zonas, onClose, onSuccess, initialSedeId, initialDate }: Props) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedZona, setSelectedZona] = useState<number | null>(
        initialSedeId ? (sedes.find(s => s.id === initialSedeId)?.idZona || null) : null
    );
    const [selectedSede, setSelectedSede] = useState<number | null>(initialSedeId || null);
    const [fecha, setFecha] = useState(initialDate || '');

    const filteredSedes = sedes.filter(s => {
        const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesZona = !selectedZona || s.idZona === selectedZona;
        return matchesSearch && matchesZona;
    });

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border border-slate-200 shadow-lg sm:rounded-lg max-h-[95vh] flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <DialogTitle className="text-lg font-bold text-slate-900 tracking-tight">Nueva Planeación</DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                        Selecciona la fecha y la instalación para programar la visita.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Fecha de Visita */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Fecha Programada</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    type="date"
                                    value={fecha}
                                    onChange={e => setFecha(e.target.value)}
                                    className="pl-9 h-10 border-slate-200 rounded-md text-sm focus-visible:ring-[#004B93]"
                                />
                            </div>
                        </div>

                        {/* Selector de Zona */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-700">Zona / Ciudad</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <select
                                    value={selectedZona || ''}
                                    onChange={e => {
                                        setSelectedZona(e.target.value ? Number(e.target.value) : null);
                                        setSelectedSede(null);
                                    }}
                                    className="w-full pl-9 h-10 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-[#004B93] transition-all appearance-none"
                                >
                                    <option value="">Todas las Zonas</option>
                                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Selector de Sede */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Instalación (Site)</Label>
                        <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                            <div className="relative border-b border-slate-50">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <Input
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="border-none pl-9 h-10 text-sm bg-transparent focus-visible:ring-0"
                                />
                            </div>
                            <ScrollArea className="h-48">
                                <div className="p-1">
                                    {filteredSedes.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setSelectedSede(s.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded text-left transition-colors",
                                                selectedSede === s.id 
                                                    ? 'bg-slate-100 text-[#004B93] font-bold' 
                                                    : 'hover:bg-slate-50 text-slate-600'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Building2 size={14} className={selectedSede === s.id ? "text-[#004B93]" : "text-slate-400"} />
                                                <span className="text-xs uppercase">{s.nombre}</span>
                                            </div>
                                            {selectedSede === s.id && <Check size={14} className="text-[#004B93]" />}
                                        </button>
                                    ))}
                                    {filteredSedes.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-xs italic">
                                            No hay resultados
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs font-bold uppercase transition-all">
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
                        className="h-9 px-6 bg-[#004B93] hover:bg-blue-800 text-white font-bold text-xs uppercase transition-all flex items-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={14} />}
                        Guardar Planeación
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 