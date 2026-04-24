'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, AlertCircle, ArrowRightLeft,
  Globe, MapPin, Building2, Shield
} from "lucide-react";
import { cn } from '@/lib/utils';

interface RegistrarRotacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type AssignmentType = 'NACIONAL' | 'ZONA' | 'SEDE' | 'PUESTO';

export default function RegistrarRotacionModal({ isOpen, onClose, onSuccess }: RegistrarRotacionModalProps) {
  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState<any[]>([]);
  const [sedes, setSedes] = useState<any[]>([]);
  const [zonas, setZonas] = useState<any[]>([]);
  const [puestos, setPuestos] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Campos del formulario
  const [personalId, setPersonalId] = useState('');
  const [tipo, setTipo] = useState('RENUNCIA');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('');

  // Lógica de Traslado (Paridad con EditPersonnelModal)
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('SEDE');
  const [idDestino, setIdDestino] = useState('');

  // Estados para cascada
  const [tempZonaId, setTempZonaId] = useState('');
  const [tempSedeId, setTempSedeId] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    try {
      const [resPers, resSedes, resZonas, resPuestos] = await Promise.all([
        fetch('/api/personal/activos').then(r => r.json()),
        fetch('/api/sedes/activos').then(r => r.json()),
        fetch('/api/zonas/activos').then(r => r.json()), // Necesitaremos esta API
        fetch('/api/puestos/activos').then(r => r.json()) // Necesitaremos esta API
      ]);

      if (resPers.success) setPersonal(resPers.data);
      if (resSedes.success) setSedes(resSedes.data);
      if (resZonas.success) setZonas(resZonas.data);
      if (resPuestos.success) setPuestos(resPuestos.data);
    } catch (error) {
      console.error("Error al cargar datos iniciales:", error);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalId) return;

    if (tipo === 'ROTACION' && assignmentType !== 'NACIONAL' && !idDestino) {
      alert("Debe seleccionar el destino del traslado.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/rotacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalId: parseInt(personalId),
          tipo,
          fecha,
          motivo,
          // Nuevos campos de destino dinámicos
          assignmentType: tipo === 'ROTACION' ? assignmentType : null,
          idDestino: tipo === 'ROTACION' ? parseInt(idDestino) : null
        })
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setPersonalId('');
        setMotivo('');
        setIdDestino('');
      } else {
        alert("Error al registrar: " + result.error);
      }
    } catch (error) {
      console.error("Error al registrar rotación:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase text-slate-800 flex items-center gap-2">
            {tipo === 'ROTACION' ? <ArrowRightLeft className="h-5 w-5 text-indigo-600" /> : <Plus className="h-5 w-5 text-[#004B93]" />}
            {tipo === 'ROTACION' ? 'Gestión de Traslado' : 'Registrar Novedad de Personal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Seleccionar Colaborador:</label>
            <select
              required
              className="w-full h-11 border rounded-xl px-4 text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-slate-700 shadow-sm"
              value={personalId}
              onChange={(e) => setPersonalId(e.target.value)}
              disabled={loadingInitial}
            >
              <option value="">-- Buscar colaborador activo --</option>
              {personal.map((p) => (
                <option key={p.PR_IDPERSONAL_PK} value={p.PR_IDPERSONAL_PK}>
                  {p.PR_NOMBRE} - (Actual: {p.SE_NOMBRE || p.CI_NOMBRE || 'Alcance Nacional'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo de Novedad:</label>
              <select
                className="w-full h-11 border rounded-xl px-4 text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none font-black text-[#004B93]"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setIdDestino('');
                }}
              >
                <option value="MAL DESEMPEÑO">MAL DESEMPEÑO</option>
                <option value="RENUNCIA">RENUNCIA</option>
                <option value="ROTACION">ROTACIÓN (TRASLADO)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Fecha del Cambio:</label>
              <input
                type="date"
                required
                className="w-full h-11 border rounded-xl px-4 text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none font-semibold"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          {/* LÓGICA DE TRASLADO DINÁMICA (PARIDAD CON EDIT MODAL) */}
          {tipo === 'ROTACION' && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
              <label className="text-[10px] font-black uppercase text-indigo-700 tracking-widest mb-2 block">Ámbito de Destino:</label>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { id: 'NACIONAL', label: 'Todos', icon: <Globe size={16} /> },
                  { id: 'ZONA', label: 'Zona', icon: <MapPin size={16} /> },
                  { id: 'SEDE', label: 'Sede', icon: <Building2 size={16} /> },
                  { id: 'PUESTO', label: 'Puesto', icon: <Shield size={16} /> }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setAssignmentType(type.id as AssignmentType);
                      setIdDestino('');
                      setTempZonaId('');
                      setTempSedeId('');
                    }}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${assignmentType === type.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500'}`}
                  >
                    {type.icon}
                    <span className="text-[9px] font-black uppercase tracking-tighter">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="animate-in fade-in duration-300">
                {assignmentType === 'ZONA' && (
                  <select
                    required
                    className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900"
                    value={idDestino}
                    onChange={(e) => setIdDestino(e.target.value)}
                  >
                    <option value="">-- Seleccionar Zona (Ciudad) --</option>
                    {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                  </select>
                )}

                {assignmentType === 'SEDE' && (
                  <div className="space-y-3">
                    <select
                      required
                      className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900"
                      value={tempZonaId}
                      onChange={(e) => {
                        setTempZonaId(e.target.value);
                        setTempSedeId('');
                        setIdDestino('');
                      }}
                    >
                      <option value="">1. Seleccionar Zona --</option>
                      {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                    </select>

                    <select
                      required
                      disabled={!tempZonaId}
                      className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900 disabled:opacity-50 disabled:bg-slate-50"
                      value={idDestino}
                      onChange={(e) => setIdDestino(e.target.value)}
                    >
                      <option value="">2. Seleccionar Sede --</option>
                      {sedes
                        .filter(s => s.idZona === parseInt(tempZonaId))
                        .map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)
                      }
                    </select>
                  </div>
                )}

                {assignmentType === 'PUESTO' && (
                  <div className="space-y-3">
                    <select
                      required
                      className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900"
                      value={tempZonaId}
                      onChange={(e) => {
                        setTempZonaId(e.target.value);
                        setTempSedeId('');
                        setIdDestino('');
                      }}
                    >
                      <option value="">1. Seleccionar Zona --</option>
                      {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                    </select>

                    <select
                      required
                      disabled={!tempZonaId}
                      className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900 disabled:opacity-50 disabled:bg-slate-50"
                      value={tempSedeId}
                      onChange={(e) => {
                        setTempSedeId(e.target.value);
                        setIdDestino('');
                      }}
                    >
                      <option value="">2. Seleccionar Sede --</option>
                      {sedes
                        .filter(s => s.idZona === parseInt(tempZonaId))
                        .map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)
                      }
                    </select>

                    <select
                      required
                      disabled={!tempSedeId}
                      className="w-full h-11 border border-indigo-200 rounded-xl px-4 text-sm bg-white focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-indigo-900 disabled:opacity-50 disabled:bg-slate-50"
                      value={idDestino}
                      onChange={(e) => setIdDestino(e.target.value)}
                    >
                      <option value="">3. Seleccionar Puesto --</option>
                      {puestos
                        .filter(pu => pu.idSede === parseInt(tempSedeId))
                        .map(pu => <option key={pu.id} value={pu.id}>{pu.nombre}</option>)
                      }
                    </select>
                  </div>
                )}
                {assignmentType === 'NACIONAL' && (
                  <div className="text-center p-4 bg-white/50 rounded-xl border border-dashed border-indigo-300">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase italic">El colaborador pasará a tener alcance nacional (sin sede fija)</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Justificación / Motivo:</label>
            <textarea
              className="w-full min-h-[100px] border rounded-xl p-4 text-sm bg-slate-50 focus:ring-2 focus:ring-primary-500 outline-none text-slate-600 font-medium placeholder:italic"
              placeholder="Describa el motivo del traslado o la desvinculación..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className={cn(
                "p-4 rounded-2xl flex gap-4 text-[11px] font-bold leading-relaxed border-2 shadow-sm transition-all",
                tipo === 'ROTACION' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' : 
                tipo === 'RENUNCIA' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
                'bg-amber-50 border-amber-200 text-amber-800'
            )}>
            <AlertCircle className="h-6 w-6 shrink-0 opacity-80" />
            <p>
              {tipo === 'ROTACION'
                ? "IMPORTANTE: Este movimiento reubicará al colaborador en la estructura operativa seleccionada. El registro quedará archivado como movimiento interno de rotación."
                : tipo === 'RENUNCIA'
                ? "ATENCIÓN: Al proceder con esta renuncia, el colaborador dejará de figurar en el personal activo automáticamente."
                : "Aviso: Se creará un registro de novedad por mal desempeño en el historial del colaborador. Este registro será visible en los reportes de rotación."}
            </p>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="px-8 font-black text-xs uppercase tracking-widest">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={tipo === 'ROTACION' ? 'default' : tipo === 'RENUNCIA' ? 'destructive' : 'secondary'}
              disabled={loading || !personalId}
              className={cn(
                "font-black text-xs uppercase tracking-widest min-w-[180px] shadow-lg transition-all",
                tipo === 'ROTACION' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 
                tipo === 'RENUNCIA' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200 text-white' : 
                'bg-slate-800 hover:bg-slate-900 shadow-slate-200 text-white'
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {tipo === 'ROTACION' ? 'Confirmar Traslado' : tipo === 'RENUNCIA' ? 'Ejecutar Renuncia' : 'Registrar Novedad'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
