import React from 'react';
import { Map2, BuildingSkyscraper, ShieldCheck, Users } from 'tabler-icons-react';
import { SecurityMetrics } from '@/types/seguridadFisica';

interface Props {
  metrics: SecurityMetrics;
}

export default function MetricsCards({ metrics }: Props) {
  const cards = [
    {
      title: 'Zonas',
      value: metrics.totalZones,
      icon: Map2,
      styles: 'bg-blue-50 text-blue-600 dark:bg-blue-900/10',
      barColor: 'bg-blue-500',
    },
    {
      title: 'Sedes',
      value: metrics.totalSites,
      icon: BuildingSkyscraper,
      styles: 'bg-orange-50 text-orange-600 dark:bg-orange-900/10',
      barColor: 'bg-orange-500',
    },
    {
      title: 'Puestos',
      value: metrics.totalPosts,
      icon: ShieldCheck,
      styles: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10',
      barColor: 'bg-emerald-500',
    },
    {
      title: 'Personal',
      value: metrics.totalPersonnel,
      icon: Users,
      styles: 'bg-purple-50 text-purple-600 dark:bg-purple-900/10',
      barColor: 'bg-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-3 h-full">
      {cards.map((card, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className={`p-1.5 rounded-lg ${card.styles}`}>
              <card.icon size={16} />
            </div>
          </div>
          
          <div className="mt-2 text-left">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{card.title}</span>
            <h4 className="text-xl font-black text-slate-900 dark:text-white mt-0.5 leading-none">
              {card.value.toLocaleString()}
            </h4>
          </div>
          
          <div className="mt-3 w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
             <div className={`h-full ${card.barColor} w-2/3 rounded-full opacity-40`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
