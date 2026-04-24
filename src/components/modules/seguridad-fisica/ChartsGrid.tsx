'use client';

import React from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, ComposedChart, PieChart, Pie, Cell, BarChart as ReBarChart,
  LabelList
} from 'recharts';
import { GenderDistribution, RoleDistribution, ModalityDistribution, SiteDetail } from '@/types/seguridadFisica';
import { Dots } from 'tabler-icons-react';

interface Props {
  genderData: GenderDistribution[];
  roleData: RoleDistribution[];
  modalityData: ModalityDistribution[];
  sitesDetail: SiteDetail[];
  totalPersonnel: number;
  renderOnly?: 'main' | 'secondary-left' | 'secondary-bottom';
}

export default function ChartsGrid({ genderData, roleData, modalityData, sitesDetail, totalPersonnel, renderOnly }: Props) {
  const LARKON_ORANGE = '#FF6B4A';
  const LARKON_GREEN = '#10B981';

  const zoneSummary = sitesDetail.reduce((acc: any, curr) => {
    acc[curr.zona] = (acc[curr.zona] || 0) + 1;
    return acc;
  }, {});
  
  const zoneData = Object.keys(zoneSummary).map(key => ({
    name: key,
    value: zoneSummary[key]
  })).sort((a, b) => b.value - a.value);

  const mainChart = (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Cantidad de puestos y sus modalidades</h5>
        <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><Dots size={14} /></button>
      </div>
      <div className="flex-1 min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={modalityData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="modality" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '10px' }} />
            <Bar dataKey="count" fill={LARKON_ORANGE} radius={[4, 4, 0, 0]} barSize={30}>
               <LabelList dataKey="count" position="top" style={{ fill: '#64748b', fontSize: 9, fontWeight: 800 }} />
            </Bar>
            <Line type="monotone" dataKey="count" stroke={LARKON_GREEN} strokeWidth={2} dot={{ r: 2 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const zonesChart = (
    <div className="h-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
       <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Presencia por Zona</h5>
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Balance de Género</h5>
         <div className="h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%" cy="80%" startAngle={180} endAngle={0}
                  innerRadius={55} outerRadius={75} paddingAngle={0} dataKey="value" stroke="none"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? LARKON_ORANGE : '#f1f5f9'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 text-center">
               <span className="text-xl font-black text-slate-900">{genderData[0]?.value || 0}</span>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Mujeres</p>
            </div>
         </div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4">Cargos</h5>
         <div className="space-y-4">
            {roleData.slice(0, 5).map((role, i) => (
               <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold uppercase">
                     <span className="text-slate-500">{role.role}</span>
                     <span className="text-slate-900">{role.count}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${totalPersonnel > 0 ? (role.count / totalPersonnel) * 100 : 0}%` }}></div>
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
    <div className="space-y-4">
      {mainChart}
      {zonesChart}
      {bottomCharts}
    </div>
  );
}
