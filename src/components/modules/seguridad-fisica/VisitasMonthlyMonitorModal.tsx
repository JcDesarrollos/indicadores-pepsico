'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react';

const MESES_FULL = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mensualData: { mes_num: number, planeadas: number, ejecutadas: number }[];
}

export default function VisitasMonthlyMonitorModal({ isOpen, onClose, mensualData }: Props) {
  const currentMonthNum = new Date().getMonth() + 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-slate-900 border-b border-white/10">
          <DialogTitle className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-400" />
            Monitor Mensual de Visitas
          </DialogTitle>
          <div className="flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Cumplido</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Actual</span></div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Pendiente</span></div>
          </div>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MESES_FULL.map((m, index) => {
              const mesNum = index + 1;
              const data = mensualData.find(d => d.mes_num === mesNum) || { planeadas: 0, ejecutadas: 0 };
              const perc = data.planeadas > 0 ? (data.ejecutadas / data.planeadas) * 100 : 0;
              const isCurrent = mesNum === currentMonthNum;
              const isFuture = mesNum > currentMonthNum;
              
              let bgColor = "bg-rose-50/50";
              let textColor = "text-rose-600";
              let borderColor = "border-rose-200";
              let accentColor = "bg-rose-500";

              if (isCurrent) {
                bgColor = "bg-amber-50";
                textColor = "text-amber-600";
                borderColor = "border-amber-300";
                accentColor = "bg-amber-500";
              } else if (data.planeadas > 0 && perc >= 100) {
                bgColor = "bg-emerald-50/50";
                textColor = "text-emerald-600";
                borderColor = "border-emerald-200";
                accentColor = "bg-emerald-500";
              } else if (isFuture) {
                bgColor = "bg-slate-50";
                textColor = "text-slate-400";
                borderColor = "border-slate-100";
                accentColor = "bg-slate-200";
              } else if (data.planeadas === 0) {
                bgColor = "bg-slate-50 opacity-40";
                textColor = "text-slate-300";
                borderColor = "border-slate-100";
                accentColor = "bg-slate-100";
              }

              return (
                <div 
                  key={m} 
                  className={`${bgColor} border ${borderColor} rounded-lg p-3 flex flex-col justify-between h-24 transition-all hover:shadow-md cursor-default`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-tighter truncate w-20">
                       {m}
                    </span>
                    <span className={`text-[11px] font-black ${textColor}`}>
                       {perc > 0 ? `${perc.toFixed(0)}%` : '-'}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                     <div className="flex justify-between items-baseline">
                        <span className="text-xs font-black text-slate-800">
                           {data.ejecutadas}/{data.planeadas}
                        </span>
                        {isCurrent && <Clock size={10} className="text-amber-500 animate-pulse" />}
                     </div>
                     <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                        <div 
                           className={`h-full ${accentColor}`}
                           style={{ width: `${Math.min(perc, 100)}%` }}
                        ></div>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
