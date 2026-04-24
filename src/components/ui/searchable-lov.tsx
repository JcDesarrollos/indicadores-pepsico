'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  id: string | number;
  label: string;
  sublabel?: string;
}

interface SearchableLOVProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function SearchableLOV({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  label,
  disabled = false,
  className
}: SearchableLOVProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.id) === String(value));

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full h-9 border rounded-md px-3 flex items-center justify-between cursor-pointer transition-all bg-background",
          isOpen ? "ring-2 ring-primary-500 border-primary-500 shadow-md" : "border-slate-200 dark:border-slate-800",
          disabled && "opacity-50 cursor-not-allowed grayscale"
        )}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white truncate">
                {selectedOption.label}
              </span>
              {selectedOption.sublabel && (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">
                  {selectedOption.sublabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm font-medium text-slate-400 italic">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={cn("text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </div>

      {isOpen && (
        <div className="absolute z-[110] mt-2 w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                autoFocus
                type="text"
                className="w-full h-9 pl-9 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Escribe para filtrar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[250px] overflow-y-auto custom-scrollbar py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={cn(
                    "px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group",
                    String(value) === String(opt.id) && "bg-primary-50 dark:bg-primary-900/10"
                  )}
                >
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-xs font-bold leading-tight",
                      String(value) === String(opt.id) ? "text-primary-600" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {opt.label}
                    </span>
                    {opt.sublabel && (
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                  {String(value) === String(opt.id) && <Check size={14} className="text-primary-600" />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <Search size={24} className="opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-widest">No se encontraron resultados</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
