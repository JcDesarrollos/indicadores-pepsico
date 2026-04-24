'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    X, Save, Plus, Camera, Trash2, Edit2,
    CheckCircle2, AlertCircle, Image as ImageIcon,
    ArrowLeft, Search, Activity
} from 'lucide-react';
import { Visita, VisitaTarea, VisitaResultado } from '@/types/visitas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { executeVisita, uploadEvidencePhotos } from '@/actions/visitasActions';

interface Props {
    visita: Visita & { site?: string, zona?: string, resultados?: VisitaResultado[] };
    allTareas: VisitaTarea[];
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function VisitaExecutionPanel({ visita, allTareas, onClose, onSuccess }: Props) {
    const router = useRouter();
    const [resultados, setResultados] = useState<VisitaResultado[]>(visita.resultados || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Estado para "Añadir Tarea"
    const [selectedTareaId, setSelectedTareaId] = useState<string>('');
    const [currentHallazgo, setCurrentHallazgo] = useState('');
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Handlers para navegación
    const handleClose = () => {
        if (onClose) onClose();
        else router.push('/visitas');
    };

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
        else router.push('/visitas');
    };

    // Filtrar tareas disponibles
    const availableTareas = allTareas.filter(t =>
        !resultados.some((r, idx) => r.idTarea === t.id && idx !== editingIndex) &&
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetForm = () => {
        setSelectedTareaId('');
        setCurrentHallazgo('');
        setTempImages([]);
        setEditingIndex(null);
    };

    const handleAddTarea = () => {
        if (!selectedTareaId) return;

        const tarea = allTareas.find(t => t.id.toString() === selectedTareaId);
        if (!tarea) return;

        const nuevoResultado: VisitaResultado = {
            idTarea: tarea.id,
            nombreTarea: tarea.nombre,
            descripcionTarea: tarea.descripcion,
            hallazgo: currentHallazgo,
            fotos: tempImages
        };

        if (editingIndex !== null) {
            const newRes = [...resultados];
            newRes[editingIndex] = nuevoResultado;
            setResultados(newRes);
        } else {
            setResultados([nuevoResultado, ...resultados]);
        }

        resetForm();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(f => formData.append('photos', f));

            const urlsRes = await uploadEvidencePhotos(formData);
            if (urlsRes.success && urlsRes.urls) {
                setTempImages(prev => [...prev, ...urlsRes.urls!]);
            }
        } catch (error) {
            console.error('Error al subir fotos:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (resultados.length === 0) return;
        setIsSaving(true);
        try {
            const finalResultados = resultados.map(r => ({
                idTarea: r.idTarea,
                hallazgo: r.hallazgo || '',
                imagenes: r.fotos || []
            }));

            const res = await executeVisita(visita.id, finalResultados);
            if (res.success) {
                handleSuccess();
            } else {
                alert(res.error || 'Error al guardar la visita');
            }
        } catch (error) {
            console.error('Error al guardar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (idx: number) => {
        const res = resultados[idx];
        setEditingIndex(idx);
        setSelectedTareaId(res.idTarea.toString());
        setCurrentHallazgo(res.hallazgo || '');
        setTempImages(res.fotos || []);
    };

    const handleDelete = (idx: number) => {
        setResultados(prev => prev.filter((_, i) => i !== idx));
        if (editingIndex === idx) resetForm();
    };

    return (
        <div className="relative h-screen bg-[#F8FAFC] flex flex-col overflow-hidden animate-in fade-in duration-700">
            {/* Header Superior Premium Blanco */}
            <div className="h-24 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-10 shadow-sm">
                <div className="flex items-center gap-8">
                    <button
                        onClick={handleClose}
                        className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#004B93] hover:text-white transition-all shadow-sm border border-slate-100"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Ejecución de Visita #{visita.id}</h2>
                            <Badge className="bg-[#004B93] text-white border-none font-black text-[10px] px-2.5 rounded-full uppercase tracking-widest">En Proceso</Badge>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {visita.site} <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Registro de EVIDENCIAS
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleClose}
                        className="px-8 py-3 text-[11px] font-black text-slate-400 hover:text-slate-800 uppercase tracking-widest transition-all"
                    >
                        Cancelar
                    </button>
                    <Button
                        onClick={handleSave}
                        disabled={resultados.length === 0 || isSaving}
                        className="bg-[#004B93] hover:bg-blue-900 text-white font-black text-[11px] uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl shadow-blue-900/10 gap-3"
                    >
                        {isSaving ? 'Guardando...' : 'Finalizar Registro'}
                        <Save size={18} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* LADO IZQUIERDO: Panel Blanco Limpio */}
                <div className="w-[450px] h-full shrink-0 border-r border-slate-200 bg-white p-10 flex flex-col gap-8 shadow-2xl z-10">
                    <div className="flex flex-col gap-2 border-b border-slate-50 pb-6">
                        <h3 className="text-base font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-[#004B93]">
                                <Plus size={20} />
                            </div>
                            {editingIndex !== null ? 'Editar Registro' : 'Nueva Tarea'}
                        </h3>
                        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Completa la información técnica.</p>
                    </div>

                    <div className="flex flex-col gap-6 overflow-y-auto pr-2">
                        {/* Selector de Tareas */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarea del Catálogo</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <select
                                    value={selectedTareaId}
                                    onChange={(e) => setSelectedTareaId(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 text-slate-800 text-sm p-4 pl-12 rounded-2xl outline-none focus:border-[#004B93] focus:bg-white transition-all appearance-none font-bold"
                                >
                                    <option value="" className="text-slate-400">Seleccione una tarea...</option>
                                    {availableTareas.map(t => (
                                        <option key={t.id} value={t.id}>{t.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Hallazgo / Observaciones */}
                        <div className="flex flex-col gap-2.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hallazgo / Comentario Técnico</label>
                            <Textarea
                                value={currentHallazgo}
                                onChange={(e) => setCurrentHallazgo(e.target.value)}
                                placeholder="Escribe aquí los detalles encontrados..."
                                className="bg-slate-50 border-2 border-slate-100 text-slate-800 text-sm min-h-[120px] rounded-2xl focus:border-[#004B93] focus:bg-white transition-all font-medium placeholder:text-slate-300"
                            />
                        </div>

                        {/* Evidencias (Imágenes) */}
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidencias Fotográficas</label>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{tempImages.length} archivos</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {tempImages.map((src, idx) => (
                                    <div key={idx} className="aspect-square relative rounded-2xl overflow-hidden group border-2 border-slate-100">
                                        <img src={src} className="w-full h-full object-cover" alt={`evidencia-${idx}`} />
                                        <button
                                            onClick={() => {
                                                setTempImages(prev => prev.filter((_, i) => i !== idx));
                                            }}
                                            className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                ))}
                                {tempImages.length < 6 && (
                                    <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-[#004B93] hover:border-[#004B93] transition-all cursor-pointer hover:bg-blue-50/50 group">
                                        <div className="p-3 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                            <Camera size={24} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase mt-2">Cargar</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACCIONES FIJAS AL FINAL DEL PANEL */}
                    <div className="flex flex-col gap-2 mt-auto pt-6 border-t border-slate-50">
                        <Button
                            onClick={handleAddTarea}
                            disabled={!selectedTareaId || isUploading}
                            className="w-full h-14 bg-[#004B93] hover:bg-blue-900 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-900/10"
                        >
                            {isUploading ? 'Procesando...' : editingIndex !== null ? 'Actualizar Registro' : 'Añadir a la Lista'}
                        </Button>

                        {editingIndex !== null && (
                            <button
                                onClick={resetForm}
                                className="py-2 text-[10px] font-black text-slate-400 uppercase hover:text-slate-800 transition-colors"
                            >
                                Cancelar Edición
                            </button>
                        )}
                    </div>
                </div>

                {/* LADO DERECHO: Resumen */}
                <div className="flex-1 bg-slate-50/30 p-10 overflow-hidden flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                        <div className="flex flex-col gap-1.5">
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Tareas Registradas</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-[#004B93]" />
                                Total: {resultados.length} items en revisión
                            </p>
                        </div>
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Search className="text-slate-300" size={24} />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 pr-6">
                        <div className="flex flex-col gap-6">
                            {resultados.map((res, idx) => (
                                <div
                                    key={idx}
                                    className="p-8 rounded-[2.5rem] bg-white border border-slate-100 flex flex-col gap-6 group hover:border-[#004B93] hover:shadow-2xl hover:shadow-blue-500/5 transition-all w-full min-w-0 overflow-hidden"
                                >
                                    <div className="flex items-start justify-between gap-6 w-full overflow-hidden">
                                        <div className="flex items-start gap-6 flex-1 min-w-0">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#004B93] flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:rotate-3">
                                                <CheckCircle2 size={28} />
                                            </div>
                                            <div className="flex flex-col gap-1.5 min-w-0 flex-1 overflow-hidden">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-slate-800 uppercase tracking-tight break-all">{res.nombreTarea}</span>
                                                </div>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed break-all">
                                                    {res.hallazgo || 'Tarea registrada sin hallazgos específicos.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(idx)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#004B93] rounded-xl transition-all shadow-sm bg-slate-50"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm bg-slate-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {res.fotos && res.fotos.length > 0 && (
                                        <div className="flex gap-3 flex-wrap ml-20">
                                            {res.fotos.map((foto, fIdx) => (
                                                <div key={fIdx} className="w-24 h-24 rounded-[1.25rem] overflow-hidden border-2 border-slate-50 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                                    <img src={foto} className="w-full h-full object-cover" alt={`evidencia-${fIdx}`} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {resultados.length === 0 && (
                                <div className="py-24 flex flex-col items-center justify-center text-center gap-8 opacity-20">
                                    <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                        <Plus size={64} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <span className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Sin registros</span>
                                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Empieza añadiendo tareas del catálogo</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
