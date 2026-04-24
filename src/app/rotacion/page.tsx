import ModuleLayout from '@/components/shared/ModuleLayout';
import RotacionModule from '@/components/modules/rotacion/RotacionModule';
import { UserMinus } from 'lucide-react';

export default function RotacionPage() {
  return (
    <ModuleLayout>
      <div className="p-4 lg:p-10 space-y-8">
        {/* Encabezado del Módulo */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <UserMinus size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Indicadores de Gestión Humana</span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Control de Rotación de Personal
          </h1>
          <p className="text-sm text-slate-500 max-w-2xl font-medium">
            Monitoreo comparativo de bajas, renuncias y estabilidad laboral por sedes y departamentos.
          </p>
        </div>

        {/* Dashboard de Rotación */}
        <RotacionModule />
      </div>
    </ModuleLayout>
  );
}
