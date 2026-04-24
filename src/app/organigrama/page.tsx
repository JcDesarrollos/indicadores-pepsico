import { getOrganigramaData, getOrganigramaStats } from '@/services/indicadoresService';
import OrganigramaViewer from '@/components/modules/indicadores/OrganigramaViewer';
import { Network } from 'lucide-react';
import ModuleLayout from '@/components/shared/ModuleLayout';

export const metadata = {
  title: 'Organigrama | PepsiCo',
  description: 'Estructura jerárquica del personal de seguridad'
};

export default async function OrganigramaPage() {
  const [data, stats] = await Promise.all([
    getOrganigramaData(),
    getOrganigramaStats()
  ]);

  return (
    <>
      <ModuleLayout>
        <div className="h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          <header className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-40">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-[#004B93] rounded-xl shadow-lg shadow-blue-500/20">
                <Network className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                Organigrama Operativo
              </h1>
            </div>
          </header>

          <OrganigramaViewer data={data} stats={stats} />
        </div>
      </ModuleLayout>
    </>
  );
}
