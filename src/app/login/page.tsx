'use client';

import { useState } from 'react';
import Image from 'next/image';
import { loginAction } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, User, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await loginAction(formData);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      
      {/* Left Side: Branding and Hero */}
      <div className="hidden md:flex md:w-1/2 bg-[#004B93] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 text-center max-w-lg">
          <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8 inline-block animate-bounce-slow">
            <Image 
              src="/img-mini-logo.jpeg" 
              alt="PepsiCo Colombia" 
              width={80} 
              height={80} 
              style={{ height: 'auto' }}
              className="rounded-xl"
            />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Control de Indicadores Operativos
          </h2>
          <p className="text-blue-100/70 text-lg font-medium leading-relaxed">
            Plataforma corporativa de monitoreo avanzado para la gestión de seguridad y eficiencia operativa.
          </p>
        </div>

        {/* Decorative Wave (Simplified SVG) */}
        <div className="absolute bottom-0 left-0 w-full h-32 opacity-20">
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,192C384,171,480,117,576,128C672,139,768,213,864,229.3C960,245,1056,203,1152,181.3C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-16 lg:p-24 relative">
        <div className="w-full max-w-sm">
          <div className="mb-12">
            <div className="relative w-40 h-14 mb-8">
               <Image 
                src="/logo.jpeg" 
                alt="PepsiCo Logo" 
                fill 
                sizes="160px"
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Acceso Corporativo</h1>
            <p className="text-slate-500 text-sm mt-2">Inicia sesión con tus credenciales de red autorizadas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Usuario</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004B93] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    name="username"
                    type="text"
                    placeholder="ej: juanperez"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:border-[#004B93] focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#004B93] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-11 pr-4 py-3.5 rounded-xl outline-none focus:border-[#004B93] focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 font-medium"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#004B93] hover:bg-[#003870] text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
             <Image 
               src="/img-mini-logo.jpeg" 
               alt="Mini Logo" 
               width={24} 
               height={24} 
               style={{ height: 'auto' }}
               className="rounded opacity-60" 
             />
             <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
               Seguridad PepsiCo v1.0
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
