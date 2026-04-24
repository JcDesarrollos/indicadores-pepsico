import Sidebar from './Sidebar';
import { getSession } from '@/services/auth';
import SplashScreen from './SplashScreen';

interface ModuleLayoutProps {
  children: React.ReactNode;
}

export default async function ModuleLayout({ children }: ModuleLayoutProps) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Minimalista */}
      <Sidebar user={session} />

      {/* Área de Trabajo - Full Width/Height */}
      <main className="flex-1 h-screen overflow-y-auto relative">
           <SplashScreen />
           {children}
      </main>
    </div>
  );
}
