'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save, Trash2, Edit2, CheckCircle2, ArrowLeft, Settings2, Loader2, Check,
    PlusCircle, ListTodo, Camera, Activity
} from 'lucide-react';
import { Visita, VisitaTarea, VisitaResultado } from '@/types/visitas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { upsertVisitaTarea, deleteVisitaTarea, executeVisita, uploadEvidencePhotos } from '@/actions/visitasActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Props {
    visita: Visita & { site?: string, zona?: string, resultados?: VisitaResultado[] };
    allTareas: VisitaTarea[];
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function VisitaExecutionPanel({ visita, allTareas: initialTareas, onClose, onSuccess }: Props) {
    const router = useRouter();
    const [allTareas, setAllTareas] = useState<VisitaTarea[]>(initialTareas);
    const [resultados, setResultados] = useState<VisitaResultado[]>(visita.resultados || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Estado para "Añadir Tarea"
    const [selectedTareaId, setSelectedTareaId] = useState<string>('');
    const [currentHallazgo, setCurrentHallazgo] = useState('');
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Estado para Gestión de Catálogo
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const [catalogForm, setCatalogForm] = useState<{ id?: number, nombre: string }>({ nombre: '' });

    const handleClose = () => {
        if (onClose) onClose();
        else router.push('/visitas');
    };

    const handleSuccess = () => {
        if (onSuccess) onSuccess();
        else router.push('/visitas');
    };

    const availableTareas = allTareas.filter(t =>
        !resultados.some((r, idx) => r.idTarea === t.id && idx !== editingIndex)
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
            if (res.success) handleSuccess();
            else alert(res.error || 'Error al guardar la visita');
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

    const handleSaveCatalogItem = async () => {
        if (!catalogForm.nombre) return;
        setCatalogLoading(true);
        const res = await upsertVisitaTarea({ ...catalogForm, activo: 'SI' });
        if (res.success) {
            setCatalogForm({ nombre: '' });
            router.refresh();
            if (catalogForm.id) {
                setAllTareas(prev => prev.map(t => t.id === catalogForm.id ? { ...t, nombre: catalogForm.nombre } : t));
            }
        }
        setCatalogLoading(false);
    };

    const handleDeleteCatalogItem = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar esta tarea del catálogo global?')) return;
        setCatalogLoading(true);
        const res = await deleteVisitaTarea(id);
        if (res.success) {
            setAllTareas(prev => prev.filter(t => t.id !== id));
            router.refresh();
        } else alert(res.error);
        setCatalogLoading(false);
    };

    return (
        <div className="flex flex-col h-screen bg-background font-sans">
            {/* Header Puro Shadcn Style */}
            <header className="h-14 shrink-0 border-b flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-semibold tracking-tight">Ejecución #{visita.id}</h2>
                            <Badge variant="default" className="text-[10px] h-4 px-1.5 leading-none">EN PROCESO</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{visita.site}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleClose} className="text-[10px] font-bold">CANCELAR</Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={resultados.length === 0 || isSaving}
                        className="bg-primary text-primary-foreground font-bold text-[10px] gap-2 px-4"
                    >
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        FINALIZAR REGISTRO
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* LADO IZQUIERDO: Formulario de Registro */}
                <aside className="w-[360px] border-r flex flex-col p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                {editingIndex !== null ? 'Editar Hallazgo' : 'Registro de Hallazgo'}
                            </h3>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setIsCatalogOpen(true)}
                            >
                                <Settings2 className="h-3 w-3" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">REGISTRO TÉCNICO DE SEGURIDAD</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tarea del Catálogo</Label>
                            <Select value={selectedTareaId} onValueChange={setSelectedTareaId}>
                                <SelectTrigger className="h-9 text-[11px] font-medium uppercase">
                                    <SelectValue placeholder="Seleccione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableTareas.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()} className="text-[11px] font-medium uppercase">
                                            {t.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Hallazgo Detectado</Label>
                            <Textarea
                                value={currentHallazgo}
                                onChange={(e) => setCurrentHallazgo(e.target.value)}
                                placeholder="Escriba los detalles aquí..."
                                className="min-h-[120px] text-[11px] placeholder:text-muted-foreground/50 resize-none focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Evidencias ({tempImages.length}/6)</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {tempImages.map((src, idx) => (
                                    <div key={idx} className="aspect-square relative rounded border group overflow-hidden bg-muted">
                                        <img src={src} className="w-full h-full object-cover" alt="" />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => setTempImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {tempImages.length < 6 && (
                                    <label className="aspect-square border border-dashed rounded flex flex-col items-center justify-center text-muted-foreground hover:bg-muted cursor-pointer transition-colors group">
                                        <Camera className="h-4 w-4 mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-[8px] font-bold">FOTO</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                )}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Button
                                className="w-full h-9 font-bold text-[10px] uppercase tracking-wider"
                                onClick={handleAddTarea}
                                disabled={!selectedTareaId || isUploading}
                            >
                                {isUploading ? 'PROCESANDO...' : editingIndex !== null ? 'ACTUALIZAR REGISTRO' : 'AÑADIR A LA LISTA'}
                            </Button>
                            {editingIndex !== null && (
                                <Button variant="ghost" className="w-full h-8 text-[10px] text-muted-foreground" onClick={resetForm}>
                                    CANCELAR EDICIÓN
                                </Button>
                            )}
                        </div>
                    </div>
                </aside>

                {/* LADO DERECHO: Lista de Registros */}
                <main className="flex-1 bg-muted/20 flex flex-col p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-primary" />
                            <h3 className="text-sm font-bold uppercase tracking-tight">Hallazgos Registrados</h3>
                        </div>
                        <Badge variant="outline" className="bg-background font-bold text-[10px]">{resultados.length} ITEMS</Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-20">
                            {resultados.map((res, idx) => (
                                <Card key={idx} className="group border shadow-sm hover:border-primary transition-colors">
                                    <CardHeader className="p-3 border-b bg-background flex flex-row items-center justify-between space-y-0">
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                            <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                                            <span className="text-[10px] font-bold uppercase truncate">{res.nombreTarea}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(idx)}><Edit2 className="h-3 w-3" /></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(idx)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 space-y-3">
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase leading-normal break-words whitespace-pre-wrap">
                                            {res.hallazgo || 'Sin observaciones registradas.'}
                                        </p>
                                        {res.fotos && res.fotos.length > 0 && (
                                            <div className="flex gap-1.5 flex-wrap">
                                                {res.fotos.map((foto, fIdx) => (
                                                    <div key={fIdx} className="w-10 h-10 rounded border bg-background overflow-hidden shadow-xs hover:scale-110 transition-transform">
                                                        <img src={foto} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {resultados.length === 0 && (
                                <div className="col-span-full h-48 border border-dashed rounded flex flex-col items-center justify-center opacity-40">
                                    <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">SIN REGISTROS TÉCNICOS</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </main>
            </div>

            {/* MODAL GESTIÓN CATÁLOGO - PURE SHADCN */}
            <Dialog open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden outline-none">
                    <DialogHeader className="p-4 border-b">
                        <div className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            <DialogTitle className="text-sm font-bold uppercase tracking-tight">Catálogo Global</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="p-4 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">{catalogForm.id ? 'Modificar' : 'Nuevo'}</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={catalogForm.nombre}
                                    onChange={e => setCatalogForm(prev => ({ ...prev, nombre: e.target.value.toUpperCase() }))}
                                    className="h-8 text-[11px]"
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSaveCatalogItem}
                                    disabled={catalogLoading || !catalogForm.nombre}
                                    className="h-8 px-4 font-bold text-[10px]"
                                >
                                    {catalogForm.id ? 'UPDATE' : 'ADD'}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Tareas ({allTareas.length})</Label>
                            <ScrollArea className="h-60 rounded border p-2 bg-muted/10">
                                <div className="space-y-1">
                                    {allTareas.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-2 hover:bg-muted rounded transition-colors group">
                                            <span className="text-[10px] font-semibold text-muted-foreground uppercase truncate pr-2">{t.nombre}</span>
                                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCatalogForm({ id: t.id, nombre: t.nombre })}><Edit2 className="h-3 w-3" /></Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteCatalogItem(t.id)}><Trash2 className="h-3 w-3" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
            `}</style>
        </div>
    );
}
