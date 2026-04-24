'use client';

import React, { useState } from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, ComposedChart, PieChart, Pie, Cell, BarChart as ReBarChart,
  LabelList
} from 'recharts';
import { DashboardData } from '@/types/seguridadFisica';
import { Dots, TrendingUp as TrendUp, Man, Woman } from 'tabler-icons-react';
import VisitasMonthlyMonitorModal from './VisitasMonthlyMonitorModal';

interface Props extends DashboardData {
  renderOnly?: 'main' | 'secondary-left' | 'secondary-bottom';
  totalPersonnel: number;
}

export default function ChartsGrid({ 
  genderData, roleData, modalityData, sitesDetail, totalPersonnel, renderOnly, visitasStats, rotationStats 
}: Props) {
  const [isVisitasModalOpen, setIsVisitasModalOpen] = useState(false);
  const LARKON_ORANGE = '#FF6B4A';
  const LARKON_GREEN = '#10B981';

  const planeadas = visitasStats?.planeadas || 0;
  const ejecutadas = visitasStats?.ejecutadas || 0;
  const cumplimiento = planeadas > 0 ? Math.round((ejecutadas / planeadas) * 100) : 0;

  const zoneSummary = sitesDetail.reduce((acc: any, curr) => {
    acc[curr.zona] = (acc[curr.zona] || 0) + 1;
    return acc;
  }, {});
  
  const zoneData = Object.keys(zoneSummary).map(key => ({
    name: key,
    value: zoneSummary[key]
  })).sort((a, b) => b.value - a.value);

  const mainChart = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 h-full">
        <div className="col-span-1 md:col-span-4 flex flex-col bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest border-l-2 border-orange-500 pl-3">
               Cantidad de puestos y sus modalidades
            </h5>
            <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Dots size={14} /></button>
          </div>
          <div className="flex-1 min-h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={modalityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="modality" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis scale="sqrt" domain={[0, 'dataMax + 10']} axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill={LARKON_ORANGE} radius={[4, 4, 0, 0]} barSize={35}>
                   <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                </Bar>
                <Line type="monotone" dataKey="count" stroke={LARKON_GREEN} strokeWidth={2} dot={{ r: 3, fill: LARKON_GREEN, strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div 
          onClick={() => setIsVisitasModalOpen(true)}
          className="col-span-1 md:col-span-2 flex flex-col bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500 transition-all duration-300"
        >
          <h5 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6 border-l-2 border-indigo-500 pl-3">
             Gestión de Visitas
          </h5>
          
          <div className="flex-1 flex flex-col items-center justify-center py-2">
             <div className="relative w-32 h-32 mb-6">
                <div className="w-full h-full rounded-full border-[10px] border-slate-50 dark:border-slate-800 flex items-center justify-center shadow-inner">
                   <div className="text-center">
                     <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block leading-none">{cumplimiento}%</span>
                     <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Ejecución</span>
                   </div>
                </div>
                <div 
                  className="absolute top-0 left-0 w-full h-full rounded-full border-[10px] border-indigo-500 border-t-transparent"
                  style={{ transform: `rotate(${(cumplimiento * 3.6) - 45}deg)`, transition: 'all 1s ease' }}
                ></div>
             </div>

             <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3">
                   <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ejecutadas</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{ejecutadas}</p>
                   </div>
                   <div className="h-8 w-[1px] bg-slate-200"></div>
                   <div className="text-center">
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Planeadas</p>
                      <p className="text-xl font-black text-indigo-500 leading-none">{planeadas}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      <VisitasMonthlyMonitorModal 
        isOpen={isVisitasModalOpen} 
        onClose={() => setIsVisitasModalOpen(false)} 
        mensualData={visitasStats?.mensual || []}
      />
    </>
  );

  const zonesChart = (
    <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
       <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3 italic">Presencia por Zona</h5>
       <div className="flex-1 w-full" style={{ minHeight: `${Math.max(zoneData.length * 30, 400)}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={zoneData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} 
                width={110}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 3, 3, 0]} barSize={10}>
                <LabelList dataKey="value" position="right" style={{ fill: '#6366f1', fontSize: 9, fontWeight: 800 }} />
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );

  const bottomCharts = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Panel Dual: Género y Rotación */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-full flex overflow-hidden">
         {/* Lado A: Balance de Género */}
         <div className="flex-1 p-5 border-r border-slate-100 dark:border-slate-800 flex flex-col">
            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 border-l-2 border-pink-500 pl-3">
               Balance de Género
            </h5>
            <div className="flex-1 flex flex-col justify-around gap-2">
               {genderData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl">
                     <div 
                       className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-white"
                       style={{ backgroundColor: entry.color }}
                     >
                        {entry.name === 'HOMBRE' ? <Man size={16} strokeWidth={3} /> : <Woman size={16} strokeWidth={3} />}
                     </div>
                     <div className="flex-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">{entry.name}S</p>
                        <div className="flex items-baseline gap-2">
                           <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{entry.value}</span>
                           <span className="text-[8px] font-bold text-slate-400">{totalPersonnel > 0 ? ((entry.value / totalPersonnel) * 100).toFixed(0) : 0}%</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Lado B: Rotación Anual */}
         <div className="flex-1 p-5 bg-slate-50/20 dark:bg-slate-900/50 flex flex-col">
            <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-3">
               Rotación {new Date().getFullYear()}
            </h5>
            <div className="flex-1 flex flex-col">
               <div className="mb-4">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Rotaciones</p>
                  <span className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                     {rotationStats?.total || 0}
                  </span>
               </div>
               
               <div className="flex-1 space-y-2">
                  {rotationStats?.byType.slice(0, 3).map((rot, i) => (
                     <div key={i} className="flex justify-between items-center bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-100 dark:border-slate-700">
                        <span className="text-[8px] font-bold text-slate-500 uppercase truncate pr-2">{rot.name}</span>
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">{rot.value}</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
         <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-8 border-l-2 border-indigo-500 pl-3">Distribución por Cargos</h5>
         <div className="space-y-5 flex-1">
            {roleData.slice(0, 5).map((role, i) => (
               <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                     <span className="text-slate-500">{role.role}</span>
                     <span className="text-slate-900 dark:text-white">{role.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                        style={{ width: `${totalPersonnel > 0 ? (role.count / totalPersonnel) * 100 : 0}%` }}
                     ></div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  if (renderOnly === 'main') return mainChart;
  if (renderOnly === 'secondary-left') return zonesChart;
  if (renderOnly === 'secondary-bottom') return bottomCharts;

  return (
    <div className="space-y-6">
      {mainChart}
      {zonesChart}
      {bottomCharts}
    </div>
  );
}
