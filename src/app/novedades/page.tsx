import NovedadesModule from "@/components/modules/novedades/NovedadesModule";
import ModuleLayout from "@/components/shared/ModuleLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gestión de Novedades | PepsiCo",
  description: "Listado general de novedades y eventos reportados.",
};

export default async function NovedadesPage() {
  return (
    <ModuleLayout>
      <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] dark:bg-slate-950">
        <NovedadesModule />
      </div>
    </ModuleLayout>
  );
}
