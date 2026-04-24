import Image from 'next/image';
import Link from 'next/link';
import { getSession } from '@/services/auth';
import { 
  Users, 
  ShieldCheck, 
  CalendarCheck, 
  AlertTriangle, 
  UserMinus,
  ArrowRight
} from 'lucide-react';
import { redirect } from 'next/navigation';
import ModuleLayout from '@/components/shared/ModuleLayout';

const MENU_OPTIONS = [
  {
    id: 'organigrama',
    title: 'Organigrama',
    description: 'Estructura organizacional y jerarquías operativas.',
    icon: Users,
    color: 'text-blue-600',
    borderColor: 'border-blue-100',
    bgColor: 'bg-blue-50',
    href: '/organigrama'
  },
  {
    id: 'seguridad-fisica',
    title: 'Seguridad Física',
    description: 'Dashboard de pie de fuerza, sedes y puestos.',
    icon: ShieldCheck,
    color: 'text-indigo-600',
    borderColor: 'border-indigo-100',
    bgColor: 'bg-indigo-50',
    href: '/seguridad-fisica'
  },
  {
    id: 'visitas',
    title: 'Gestión de Visitas',
    description: 'Trazabilidad de tareas y cronogramas en campo.',
    icon: CalendarCheck,
    color: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    bgColor: 'bg-emerald-50',
    href: '/visitas'
  },
  {
    id: 'eventos-criticos',
    title: 'Eventos Críticos',
    description: 'Análisis de novedades de alto impacto por sede.',
    icon: AlertTriangle,
    color: 'text-amber-600',
    borderColor: 'border-amber-100',
    bgColor: 'bg-amber-50',
    href: '/eventos-criticos'
  },
  {
    id: 'rotacion',
    title: 'Control de Rotación',
    description: 'Bajas, renuncias y desempeño del personal.',
    icon: UserMinus,
    color: 'text-rose-600',
    borderColor: 'border-rose-100',
    bgColor: 'bg-rose-50',
    href: '/rotacion'
  }
];

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <ModuleLayout>
      <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-[#004B93] mb-2 tracking-tight">Bienvenido al Panel de Gestión</h2>
          <p className="text-slate-500 max-w-2xl text-sm font-medium">
            Plataforma centralizada para el monitoreo de indicadores de seguridad, gestión de personal y trazabilidad operativa.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MENU_OPTIONS.map((option) => (
            <Link 
              key={option.id} 
              href={option.href}
              className={`group bg-white border ${option.borderColor} rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full ${option.bgColor.replace('bg-', 'bg-').replace('50', '500')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 ${option.bgColor} rounded-xl flex items-center justify-center mb-6`}>
                  <option.icon className={option.color} size={28} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#004B93] transition-colors">
                  {option.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-8">
                  {option.description}
                </p>

                <div className="mt-auto flex items-center gap-2 text-xs font-bold text-[#004B93] uppercase tracking-wider">
                  <span>Abrir módulo</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ModuleLayout>
  );
}
