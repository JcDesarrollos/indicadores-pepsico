'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function SplashScreen() {
  const pathname = usePathname();
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Cada vez que el pathname cambie, reiniciamos el cargador
  useEffect(() => {
    setShow(true);
    setFadeOut(false);

    // 1. Tiempo mínimo de logo (1.2s)
    const holdTimer = setTimeout(() => {
      setFadeOut(true); 
    }, 1000);

    // 2. Tiempo total para desmontar (2s aprox)
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 1800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(removeTimer);
    };
  }, [pathname]); // Se dispara en cada cambio de página

  if (!show) return null;

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-slate-950 z-[9999] transition-opacity duration-700 ease-in-out ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      <div className="relative flex flex-col items-center">
        
        {/* Contenedor del Logo con animación de entrada */}
        <div className="relative overflow-hidden rounded-full p-2 bg-white shadow-sm border border-slate-100 animate-in zoom-in duration-500">
            <Image 
                src="/img-mini-logo.jpeg" 
                alt="PepsiCo" 
                width={85} 
                height={85} 
                className="rounded-full object-cover"
                priority
            />
        </div>

        {/* Spinner circular suave */}
        <div className="absolute inset-0 border-2 border-transparent border-t-blue-600 rounded-full animate-spin-slow m-[-6px]"></div>
      </div>

      <div className="mt-8">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] block animate-in fade-in slide-in-from-bottom-2 duration-1000">
          PepsiCo
        </span>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
