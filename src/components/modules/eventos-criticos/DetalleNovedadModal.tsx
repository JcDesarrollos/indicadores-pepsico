'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImagenesNovedadAction, getTiposRiesgoNovedadAction } from '@/actions/eventosCriticosActions';
import type { EventoCriticoDetail, ImagenNovedad, TipoRiesgo } from '@/services/eventosCriticosService';

interface DetalleNovedadModalProps {
  novedad: EventoCriticoDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetalleNovedadModal({ novedad, isOpen, onClose }: DetalleNovedadModalProps) {
  const [imagenes, setImagenes] = useState<ImagenNovedad[]>([]);
  const [tiposRiesgo, setTiposRiesgo] = useState<TipoRiesgo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdicionales = async () => {
      if (novedad && isOpen) {
        setLoading(true);
        const [resImg, resTr] = await Promise.all([
          getImagenesNovedadAction(novedad.NO_IDNOVEDAD_PK),
          getTiposRiesgoNovedadAction(novedad.NO_IDNOVEDAD_PK)
        ]);

        if (resImg.success) setImagenes(resImg.data || []);
        if (resTr.success) setTiposRiesgo(resTr.data || []);
        setLoading(false);
      }
    };

    fetchAdicionales();
  }, [novedad, isOpen]);

  if (!novedad) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
         Clonamos el estilo del modal de RENOA:
         Max-width basado en el viewport menos espacio lateral.
      */}
      <DialogContent className="max-w-[calc(95vw-200px)] max-h-[95vh] w-full h-full overflow-hidden p-0 flex flex-col bg-gray-100 border-none shadow-2xl">
        <DialogHeader className="p-3 border-b bg-white flex-shrink-0">
          <DialogTitle className="text-base font-bold flex justify-between items-center pr-8">
            <span>Reporte de Novedad - Consecutivo {novedad.NO_CONSECUTIVO}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              novedad.NO_ESTADO === 'ABIERTA' ? 'bg-blue-100 text-blue-800' :
              novedad.NO_ESTADO === 'CERRADA' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {novedad.NO_ESTADO}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          {/* Estilo Excel Informe */}
          <div className="bg-white border-2 border-gray-400 overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
            
            {/* Cabezote del Informe */}
            <div className="bg-white border-b-2 border-gray-400 p-3 flex-shrink-0">
              <div className="grid grid-cols-3 gap-0 text-[11px] border-b border-gray-300 pb-2 mb-2 italic">
                {/* Logo */}
                <div className="flex items-center justify-center border-r border-gray-400 pr-4">
                  <Image
                    src="/logo.jpeg"
                    alt="LOGO PEPSICO"
                    width={180}
                    height={60}
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Columna 1 Info */}
                <div className="space-y-1 border-r border-gray-400 px-4 uppercase text-[10px]">
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">CLASIFICACION DEL DOCUMENTO:</span> <span>FORMATO DE REGISTRO</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">TITULO:</span> <span>REPORTE DE NOVEDADES Y/O HALLAZGOS</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">RESPONSABLE:</span> <span>SEGURIDAD CORPORATIVA</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">CLAVE:</span> <span>FR-COC-SP-009</span></div>
                </div>

                {/* Columna 2 Info */}
                <div className="space-y-1 overflow-hidden px-4 uppercase text-[10px]">
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">EDICIÓN:</span> <span>02</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">FECHA DE EMISIÓN:</span> <span>13/08/2020</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">ULTIMA REVISIÓN:</span> <span>19/05/2025</span></div>
                  <div className="grid grid-cols-2 gap-1"><span className="font-bold">ESTADO:</span> <span>{novedad.NO_ESTADO}</span></div>
                  <div className="grid grid-cols-2 gap-1 border-t border-gray-100 pt-1">
                    <span className="font-bold text-red-600">PRIORIDAD:</span> 
                    <span className="bg-red-50 text-red-700 px-1 font-bold text-center">EVENTO CRÍTICO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos Generales */}
            <div className="p-3 space-y-0 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="grid grid-cols-4 gap-0 border-b-2 border-gray-400 uppercase text-[10px] items-stretch">
                <div className="border-r border-gray-400 p-2">
                  <div className="font-bold text-gray-900 mb-0.5">INSTALACIÓN:</div>
                  <div className="text-gray-700">{novedad.SE_NOMBRE}</div>
                </div>
                <div className="border-r border-gray-400 p-2">
                  <div className="font-bold text-gray-900 mb-0.5">FECHA:</div>
                  <div className="text-gray-700">
                    {new Date(novedad.NO_FECHA_HORA).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="border-r border-gray-400 p-2">
                  <div className="font-bold text-gray-900 mb-0.5">EA/LUGAR:</div>
                  <div className="text-gray-700">PASILLOS EXTERNOS</div>
                </div>
                <div className="p-2">
                  <div className="font-bold text-gray-900 mb-0.5">RIESGO:</div>
                  <div className="text-gray-700">{novedad.NR_NOMBRE || 'Medio'}</div>
                </div>
              </div>

              <div className="border-b-2 border-gray-400 p-2 uppercase text-[10px]">
                 <div className="font-bold text-gray-900 mb-0.5">TIPO DE NOVEDAD:</div>
                 <div className="text-gray-700">{novedad.TN_NOMBRE}</div>
              </div>

              {/* Contenido Principal */}
              <div className="grid grid-cols-2 gap-0 flex-1 min-h-0 border-b-2 border-gray-400">
                {/* NOVEDAD */}
                <div className="border-r-2 border-gray-400 p-3 overflow-y-auto bg-white flex flex-col">
                  <h3 className="font-bold text-[11px] mb-2 uppercase">NOVEDAD:</h3>
                  <div className="text-[10px] leading-relaxed text-gray-800 flex-1 italic">
                    {novedad.NO_DESCRIPCION}
                  </div>
                  
                  {/* RIESGOS MOVIDOS ABAJO SEGUN CAPTURA */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h3 className="font-bold text-[11px] mb-1 uppercase">RIESGOS:</h3>
                    <div className="text-[9px] text-gray-700 font-medium">
                      {tiposRiesgo.length > 0 ? tiposRiesgo.map(tr => tr.TR_NOMBRE).join(", ") : "Acceso no autorizado de vehiculos, Accidente laboral"}
                    </div>
                  </div>
                </div>

                {/* FOTOGRÁFICO */}
                <div className="bg-white flex flex-col min-h-0 p-3">
                  <h3 className="font-bold text-[11px] mb-2 uppercase">FOTOGRÁFICO:</h3>
                  
                  <div className="flex-1 min-h-0 flex items-center justify-center border-2 border-gray-300 rounded p-4">
                    {loading ? (
                       <div className="text-[10px] text-gray-400 animate-pulse italic uppercase">Cargando...</div>
                    ) : imagenes.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {imagenes.map((img, idx) => (
                          <div key={idx} className="border border-gray-200 p-1 bg-white shadow-sm overflow-hidden">
                            <img 
                              src={img.IM_URL_IMAGEN} 
                              alt={img.IM_NOMBRE_ARCHIVO}
                              className="w-full h-auto object-cover aspect-square"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo.jpeg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-[11px] italic uppercase">No hay imágenes disponibles</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pie de Página Informe */}
              <div className="p-1 px-2 text-[9px] grid grid-cols-3 gap-4 text-gray-600 uppercase font-medium">
                <div className="truncate">CIUDAD: <span className="text-gray-800">{novedad.CI_NOMBRE}</span></div>
                <div className="truncate text-center">CLIENTE: <span className="text-gray-800">{novedad.CL_NOMBRE}</span></div>
                <div className="truncate text-right">REGISTRADO POR: <span className="text-gray-800">{novedad.US_NOMBRE}</span></div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
