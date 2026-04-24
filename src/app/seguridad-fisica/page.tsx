import ModuleLayout from '@/components/shared/ModuleLayout';
import { getSecurityDashboardData } from '@/services/seguridadFisicaService';
import SecurityDashboardContent from '@/components/modules/seguridad-fisica/SecurityDashboardContent';

export const metadata = {
  title: 'Seguridad Física | PepsiCo',
  description: 'KPIs y Dashboard de Seguridad Física'
};

export default async function SeguridadFisicaPage() {
  const data = await getSecurityDashboardData();

  return (
    <ModuleLayout>
      <SecurityDashboardContent data={data} />
    </ModuleLayout>
  );
}
