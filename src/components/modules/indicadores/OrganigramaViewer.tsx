'use client';

import React, { useState, useRef, useEffect } from 'react';
import { OrganigramaNode } from './OrganigramaTree';
import { ZoomIn, ZoomOut, Maximize, MousePointer2, Plus, UserPlus } from 'lucide-react';
import { PersonalNode } from '@/services/indicadoresService';
import EditPersonnelModal from './EditPersonnelModal';
import { Button } from '@/components/ui/button';

interface Props {
  data: PersonalNode[];
}

export default function OrganigramaViewer({ data }: Props) {
  const [scale, setScale] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [editingPerson, setEditingPerson] = useState<PersonalNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Manejo de Zoom con Scroll (Nativo para preventDefault)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.min(Math.max(0.15, prev + delta), 2));
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });

    // listener global para soltar el click (evita que se quede "pegado")
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheelNative);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Manejo de Panning (Arrastre)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) { // Click izquierdo o central
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const resetView = () => {
    setScale(0.8);
    setPosition({ x: 0, y: 0 });
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <button
          onClick={() => setEditingPerson({} as any)}
          className="group relative p-12 bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl border border-slate-100 dark:border-slate-800 hover:scale-110 active:scale-95 transition-all duration-300"
          title="Registrar Primer Colaborador"
        >
          <div className="absolute inset-0 bg-blue-500/5 rounded-[50px] blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <Plus className="w-20 h-20 text-[#004B93] dark:text-blue-400 group-hover:rotate-90 transition-transform duration-500" strokeWidth={1.5} />
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#004B93] text-white text-[10px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            PRIMER REGISTRO
          </div>
        </button>

        {editingPerson && (
          <EditPersonnelModal
            mode="create"
            onClose={() => setEditingPerson(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Toolbar Flotante */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <Button
          onClick={() => setEditingPerson({} as any)}
        >
          <Plus size={14} className="mr-2" /> Nuevo
        </Button>
      </div>

      <div className="absolute top-6 right-6 z-30 flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <button onClick={() => setScale(s => Math.max(0.15, s - 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400"><ZoomOut size={18} /></button>
        <span className="text-[10px] font-bold w-10 text-center text-slate-700 dark:text-slate-300 tracking-tighter">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400"><ZoomIn size={18} /></button>
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>
        <button onClick={resetView} title="Resetear Vista" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-600 dark:text-slate-400"><Maximize size={18} /></button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden outline-none select-none h-full bg-slate-100/30 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 m-4 rounded-3xl shadow-inner shadow-slate-900/5"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <div
          className="absolute transition-transform duration-75 ease-out origin-top"
          style={{
            transform: `translate(calc(-50% + ${position.x}px), ${position.y}px) scale(${scale})`,
            left: '50%',
            top: '60px'
          }}
        >
          <div className="flex flex-row flex-nowrap items-start justify-center gap-x-12 pb-80">
            {data.map(root => (
              <OrganigramaNode
                key={root.id}
                node={root}
                onEdit={setEditingPerson}
              />
            ))}
          </div>
        </div>
      </div>

      {editingPerson && (
        <EditPersonnelModal
          person={editingPerson.id ? editingPerson : undefined}
          mode={editingPerson.id ? 'edit' : 'create'}
          onClose={() => setEditingPerson(null)}
        />
      )}
    </div>
  );
}
