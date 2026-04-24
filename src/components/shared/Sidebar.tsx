'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  CalendarCheck,
  AlertTriangle,
  UserMinus,
  LayoutGrid,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MENU_ITEMS = [
  { id: 'dashboard', title: 'Inicio', icon: LayoutGrid, href: '/' },
  { id: 'organigrama', title: 'Organigrama', icon: Users, href: '/organigrama' },
  { id: 'seguridad-fisica', title: 'Seguridad Física', icon: ShieldCheck, href: '/seguridad-fisica' },
  { id: 'visitas', title: 'Gestión de Visitas', icon: CalendarCheck, href: '/visitas' },
  { id: 'rotacion', title: 'Gestión de Rotación', icon: UserMinus, href: '/rotacion' },
  { id: 'eventos-criticos', title: 'Eventos Críticos', icon: AlertTriangle, href: '/eventos-criticos' },
  { id: 'novedades', title: 'Novedades', icon: Bell, href: '/novedades' },
];

interface SidebarProps {
  user?: {
    nombre: string;
  } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen transition-all duration-300 z-50">
      {/* User Profile Section at Top - Integrated with PepsiCo Logo */}
      <div className="p-4 lg:p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <Image
              src="/img-mini-logo.jpeg"
              alt="PepsiCo"
              width={40}
              height={40}
              style={{ height: 'auto' }}
              className="object-contain"
            />
          </div>
          <div className="hidden lg:block overflow-hidden">
            <p className="text-sm font-bold text-[#004B93] truncate leading-none capitalize">
              {user?.nombre?.toLowerCase() || 'Usuario'}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Admin Corporativo
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.id}
              href={item.href}
              title={item.title}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-slate-50 text-[#004B93]"
                  : "text-slate-400 hover:text-[#004B93] hover:bg-slate-50/50"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md transition-colors",
                isActive ? "bg-white shadow-sm ring-1 ring-slate-100" : "bg-transparent"
              )}>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "hidden lg:block text-[11px] font-bold tracking-tight uppercase",
                isActive ? "text-[#004B93]" : "text-slate-500"
              )}>
                {item.title}
              </span>

              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-[#004B93] rounded-r-full hidden lg:block"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Logout */}
      <div className="p-3 border-t border-slate-50">
        <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group">
          <LogOut size={18} />
          <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">Salir</span>
        </button>
      </div>
    </aside>
  );
}
