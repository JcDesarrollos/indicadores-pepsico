'use client';

import { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  Loader2,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getNovedadesAction, toggleCriticoAction } from "@/actions/novedadesActions";
import DetalleNovedadModal from '../eventos-criticos/DetalleNovedadModal';

export default function NovedadesModule() {
  const [loading, setLoading] = useState(true);
  const [novedades, setNovedades] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNovedad, setSelectedNovedad] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchNovedades();
  }, []);

  const fetchNovedades = async () => {
    setLoading(true);
    const res = await getNovedadesAction();
    if (res.success) setNovedades(res.data ?? []);
    setLoading(false);
  };

  const handleToggleCritico = async (id: number, currentStatus: string) => {
    setActionLoading(id);
    const res = await toggleCriticoAction(id, currentStatus);
    if (res.success) {
      setNovedades(prev => prev.map(n =>
        n.NO_IDNOVEDAD_PK === id ? { ...n, NO_ES_CRITICO: res.newStatus } : n
      ));
    }
    setActionLoading(null);
  };

  const filteredNovedades = novedades.filter(n =>
    n.NO_CONSECUTIVO?.toString().includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col p-6 animate-in fade-in duration-500">
      
      {/* Header Estilo RENOA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            Consola de Novedades
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Gestión y promoción de eventos operativos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-9 h-9 w-[250px] rounded-md bg-white dark:bg-slate-900 border-slate-200 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-md bg-white shadow-none">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabla de Novedades - Sin sombras pesadas y más cuadrada */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-1 flex flex-col overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 sticky top-0 z-10">
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">ID</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Fecha / Hora</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Sede / Ciudad</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Cliente</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipo</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">Usuario</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Crítico</th>
                <th className="px-4 py-2 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto text-slate-400" />
                  </td>
                </tr>
              ) : filteredNovedades.length > 0 ? (
                filteredNovedades.map((n) => (
                  <tr key={n.NO_IDNOVEDAD_PK} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-1.5 text-[10px] text-slate-400">
                      #{n.NO_CONSECUTIVO}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-slate-600">
                      {new Date(n.NO_FECHA_HORA).toLocaleDateString()} {new Date(n.NO_FECHA_HORA).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-slate-600 uppercase">
                      {n.SE_NOMBRE} - {n.CI_NOMBRE}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-slate-600">
                      {n.CL_NOMBRE}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-slate-500 uppercase">
                      {n.TN_NOMBRE}
                    </td>
                    <td className="px-4 py-1.5 text-[10px] text-slate-600 uppercase">
                      {n.US_NOMBRE}
                    </td>
                    <td className="px-4 py-1.5 text-center">
                      <button 
                        title="Marcar Crítico"
                        className={cn(
                          "h-5 w-5 rounded transition-all inline-flex items-center justify-center",
                          n.NO_ES_CRITICO === 'SI' 
                            ? "bg-amber-500 text-white" 
                            : "text-slate-300 hover:text-amber-500"
                        )}
                        onClick={() => handleToggleCritico(n.NO_IDNOVEDAD_PK, n.NO_ES_CRITICO)}
                        disabled={actionLoading === n.NO_IDNOVEDAD_PK}
                      >
                        <Zap size={10} className={cn(n.NO_ES_CRITICO === 'SI' && "fill-white")} />
                      </button>
                    </td>
                    <td className="px-4 py-1.5 text-right">
                      <button 
                        title="Ver reporte"
                        className="h-5 w-5 rounded inline-flex items-center justify-center text-slate-400 hover:text-blue-500"
                        onClick={() => {
                          setSelectedNovedad(n);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 text-[10px] italic">
                    Sin registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer simple con contador */}
        <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <span>Total registros: {filteredNovedades.length}</span>
           <span>Pepsico Operaciones - Novedades</span>
        </div>
      </div>

      {/* Modal de Detalle */}
      {selectedNovedad && (
        <DetalleNovedadModal 
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          novedad={selectedNovedad}
        />
      )}
    </div>
  );
}
