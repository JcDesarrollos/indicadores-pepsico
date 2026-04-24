'use client';

import React from 'react';
import { DashboardData } from '@/types/seguridadFisica';
import MetricsCards from './MetricsCards';
import ChartsGrid from './ChartsGrid';
import SitesDetailTable from './SitesDetailTable';

interface Props {
  data: DashboardData;
}

export default function SecurityDashboardContent({ data }: Props) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC] dark:bg-slate-950 animate-fade-in">
      <div className="max-w-[1700px] mx-auto space-y-6">

        {/* Header de la Página */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
            Seguridad Física
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Métricas e Indicadores Operativos</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span>Estado Global del Dispositivo</span>
          </div>
        </div>


        {/* Layout de Cuadrícula Principal Tipo Sidebar con Alturas Igualadas */}
        <div className="grid grid-cols-12 gap-6 items-stretch">

          {/* Columna Izquierda (Metrics + Zones) */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
            {/* 1. Métricas 2x2 */}
            <div className="h-[280px] shrink-0">
              <MetricsCards metrics={data.metrics} />
            </div>

            {/* 2. Presencia por Zona (Estirado hasta la base) */}
            <div className="flex-1">
              <ChartsGrid
                genderData={data.genderData}
                roleData={data.roleData}
                modalityData={data.modalityData}
                sitesDetail={data.sitesDetail}
                totalPersonnel={data.metrics.totalPersonnel}
                renderOnly="secondary-left"
              />
            </div>
          </div>

          {/* Columna Derecha (Main + Bottom Charts) */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
            {/* 3. Gráfico Principal */}
            <div className="h-[430px] shrink-0">
              <ChartsGrid
                genderData={data.genderData}
                roleData={data.roleData}
                modalityData={data.modalityData}
                sitesDetail={data.sitesDetail}
                totalPersonnel={data.metrics.totalPersonnel}
                renderOnly="main"
              />
            </div>

            {/* 4. Género y Cargos */}
            <div className="flex-1">
              <ChartsGrid
                genderData={data.genderData}
                roleData={data.roleData}
                modalityData={data.modalityData}
                sitesDetail={data.sitesDetail}
                totalPersonnel={data.metrics.totalPersonnel}
                renderOnly="secondary-bottom"
              />
            </div>
          </div>
        </div>

        {/* Tabla Base */}
        <div className="mt-8">
          <SitesDetailTable sites={data.sitesDetail} />
        </div>

        <div className="pb-10"></div>
      </div>
    </div>
  );
}
