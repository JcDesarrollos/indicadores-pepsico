'use client';

import { useState, useEffect } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, AlertCircle, ArrowRightLeft,
  Globe, MapPin, Building2, Shield, Plus
} from "lucide-react";
import { cn } from '@/lib/utils';
import SearchableLOV from '@/components/ui/searchable-lov';

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

  const [personalId, setPersonalId] = useState('');
  const [tipo, setTipo] = useState('RENUNCIA');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [motivo, setMotivo] = useState('');

  const [assignmentType, setAssignmentType] = useState<AssignmentType>('SEDE');
  const [idDestino, setIdDestino] = useState('');

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
        fetch('/api/zonas/activos').then(r => r.json()),
        fetch('/api/puestos/activos').then(r => r.json())
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
          assignmentType: tipo === 'ROTACION' ? assignmentType : null,
          idDestino: tipo === 'ROTACION' ? parseInt(idDestino) : null
        })
      });

      const result = await response.json();
      if (result.success) {
        onSuccess();
        onClose();
        resetFields();
      } else {
        alert("Error al registrar: " + result.error);
      }
    } catch (error) {
      console.error("Error al registrar rotación:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    setPersonalId('');
    setMotivo('');
    setIdDestino('');
  };

  const personalOptions = personal.map(p => ({
    id: p.PR_IDPERSONAL_PK,
    label: p.PR_NOMBRE,
    sublabel: `Actual: ${p.SE_NOMBRE || p.CI_NOMBRE || 'Alcance Nacional'}`
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {tipo === 'ROTACION' ? <ArrowRightLeft className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
            {tipo === 'ROTACION' ? 'Traslado de Personal' : 'Registrar Novedad'}
          </DialogTitle>
          <DialogDescription>
            Complete los datos para procesar el cambio en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="space-y-2">
            <SearchableLOV
              label="Colaborador"
              placeholder="Buscar colaborador..."
              options={personalOptions}
              value={personalId}
              onChange={(val) => setPersonalId(val?.toString() || '')}
              disabled={loadingInitial}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Tipo de Novedad</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value);
                  setIdDestino('');
                }}
              >
                <option value="MAL DESEMPEÑO">Mal Desempeño</option>
                <option value="RENUNCIA">Renuncia</option>
                <option value="ROTACION">Rotación (Traslado)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Fecha Efectiva</Label>
              <Input
                type="date"
                required
                className="h-9"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
          </div>

          {tipo === 'ROTACION' && (
            <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border">
              <Label className="text-[10px] font-semibold uppercase text-muted-foreground mb-2 block">Destino del Traslado</Label>

              <div className="flex gap-2">
                {[
                  { id: 'NACIONAL', label: 'Global', icon: <Globe size={14} /> },
                  { id: 'ZONA', label: 'Zona', icon: <MapPin size={14} /> },
                  { id: 'SEDE', label: 'Sede', icon: <Building2 size={14} /> },
                  { id: 'PUESTO', label: 'Puesto', icon: <Shield size={14} /> }
                ].map(type => (
                  <Button
                    key={type.id}
                    type="button"
                    variant={assignmentType === type.id ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 flex-col h-auto py-2 gap-1"
                    onClick={() => {
                      setAssignmentType(type.id as AssignmentType);
                      setIdDestino('');
                    }}
                  >
                    {type.icon}
                    <span className="text-[10px] font-medium">{type.label}</span>
                  </Button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                {assignmentType === 'ZONA' && (
                  <SearchableLOV 
                    options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                    value={idDestino}
                    onChange={val => setIdDestino(val?.toString() || '')}
                    placeholder="Seleccionar Zona..."
                  />
                )}

                {assignmentType === 'SEDE' && (
                  <div className="grid grid-cols-2 gap-2">
                    <SearchableLOV 
                      options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                      value={tempZonaId}
                      onChange={val => { setTempZonaId(val?.toString() || ''); setTempSedeId(''); setIdDestino(''); }}
                      placeholder="1. Zona"
                    />
                    <SearchableLOV 
                      disabled={!tempZonaId}
                      options={sedes.filter(s => s.idZona === parseInt(tempZonaId)).map(s => ({ id: s.id, label: s.nombre }))}
                      value={idDestino}
                      onChange={val => setIdDestino(val?.toString() || '')}
                      placeholder="2. Sede"
                    />
                  </div>
                )}

                {assignmentType === 'PUESTO' && (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <SearchableLOV 
                        options={zonas.map(z => ({ id: z.id, label: z.nombre }))}
                        value={tempZonaId}
                        onChange={val => { setTempZonaId(val?.toString() || ''); setTempSedeId(''); setIdDestino(''); }}
                        placeholder="1. Zona"
                      />
                      <SearchableLOV 
                        disabled={!tempZonaId}
                        options={sedes.filter(s => s.idZona === parseInt(tempZonaId)).map(s => ({ id: s.id, label: s.nombre }))}
                        value={tempSedeId}
                        onChange={val => { setTempSedeId(val?.toString() || ''); setIdDestino(''); }}
                        placeholder="2. Sede"
                      />
                    </div>
                    <SearchableLOV 
                      disabled={!tempSedeId}
                      options={puestos.filter(pu => pu.idSede === parseInt(tempSedeId)).map(pu => ({ id: pu.id, label: pu.nombre }))}
                      value={idDestino}
                      onChange={val => setIdDestino(val?.toString() || '')}
                      placeholder="3. Puesto Específico"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs">Justificación</Label>
            <Textarea
              className="min-h-[80px] text-xs resize-none"
              placeholder="Detalle el motivo del registro..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          {(tipo === 'RENUNCIA' || tipo === 'MAL DESEMPEÑO') && (
            <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 text-destructive border border-destructive/10">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-[10px] font-medium leading-tight uppercase tracking-tight">
                {tipo === 'RENUNCIA' 
                  ? "Esta acción marcará al colaborador como inactivo." 
                  : "Se registrará una sanción por bajo desempeño."}
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading} size="sm">
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !personalId}
            size="sm"
            variant={tipo === 'RENUNCIA' ? 'destructive' : 'default'}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Confirmar Registro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
