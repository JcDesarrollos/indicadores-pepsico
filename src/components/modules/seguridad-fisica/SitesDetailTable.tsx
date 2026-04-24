'use client';

import React, { useState } from 'react';
import { SiteDetail } from '@/types/seguridadFisica';
import PuestosModal from './PuestosModal';
import { MousePointer2 } from 'lucide-react';

interface Props {
  sites: SiteDetail[];
}

export default function SitesDetailTable({ sites }: Props) {
  const [selectedSite, setSelectedSite] = useState<{ id: number, name: string } | null>(null);

  // Agrupar datos por zona
  const groupedData: Record<string, SiteDetail[]> = {};
  sites.forEach(site => {
    if (!groupedData[site.zona]) {
      groupedData[site.zona] = [];
    }
    groupedData[site.zona].push(site);
  });

  const zones = Object.keys(groupedData).sort();

  const formatPercent = (num: number, total: number) => {
    if (total === 0) return '0,0%';
    return ((num / total) * 100).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <h5 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Dispositivo de Seguridad por Sede</h5>
          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <MousePointer2 size={12} className="text-indigo-500" />
            <span>Click en puestos para ver detalle</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border-b border-slate-300 dark:border-slate-700 text-[11px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 font-black uppercase tracking-tight border-b border-slate-300 dark:border-slate-700">
                <th className="px-4 py-3 border-r border-slate-300 dark:border-slate-700 text-center">Zona</th>
                <th className="px-4 py-3 border-r border-slate-300 dark:border-slate-700 text-left">SITE / SEDE</th>
                <th className="px-4 py-3 border-r border-slate-300 dark:border-slate-700 text-center">Puestos</th>
                <th className="px-4 py-3 border-r border-slate-300 dark:border-slate-700 text-center">Personal</th>
                <th className="px-4 py-3 border-r border-slate-300 dark:border-slate-700 text-center text-pink-700">Mujeres</th>
                <th className="px-4 py-3 text-center text-blue-700">Hombres</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zona) => {
                const zoneSites = groupedData[zona];
                return zoneSites.map((site, index) => (
                  <tr key={`${zona}-${site.site}`} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-colors">
                    {index === 0 && (
                      <td
                        rowSpan={zoneSites.length}
                        className="px-4 py-2 border-r border-slate-300 dark:border-slate-700 font-black text-[#004B93] dark:text-blue-400 align-middle text-center bg-slate-50/30"
                      >
                        <span className="uppercase tracking-widest text-[10px]">{zona}</span>
                      </td>
                    )}
                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                      {site.site}
                    </td>
                    <td
                      onClick={() => setSelectedSite({ id: site.idSede, name: site.site })}
                      className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center font-black text-indigo-600 cursor-pointer hover:bg-indigo-50/50 transition-colors group"
                    >
                      <div className="flex items-center justify-center gap-1 underline decoration-indigo-200 underline-offset-4 decoration-2 group-hover:decoration-indigo-500">
                        <span>{site.puestos}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center font-bold text-slate-600">
                      {site.personas}
                    </td>
                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700 text-center text-pink-600 font-black bg-pink-50/10">
                      {formatPercent(site.mujeres, site.personas)}
                    </td>
                    <td className="px-4 py-2 text-center text-blue-600 font-black bg-blue-50/10">
                      {formatPercent(site.hombres, site.personas)}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {selectedSite && (
          <PuestosModal
            idSede={selectedSite.id}
            siteName={selectedSite.name}
            onClose={() => setSelectedSite(null)}
          />
        )}
      </div>
    </>
  );
}
