'use client';

import React from 'react';
import { PersonalNode } from '@/services/indicadoresService';
import { User, Briefcase, Pencil } from 'lucide-react';

interface Props {
    node: PersonalNode;
    level?: number;
    onEdit?: (node: PersonalNode) => void;
}

export const OrganigramaNode: React.FC<Props> = ({ node, level = 0, onEdit }) => {
    const hasChildren = node.children && node.children.length > 0;

    const renderChildren = () => (
        <div className="relative flex flex-col items-center w-full">
            {/* Línea horizontal que conecta todos los hijos */}
            <div className="absolute top-0 h-px bg-slate-300 dark:bg-slate-800" style={{ left: 'calc(128px + 1.5rem)', right: 'calc(128px + 1.5rem)' }}></div>

            <div className="flex flex-row flex-nowrap justify-center gap-x-12 px-8 pt-8">
                {node.children!.map((child) => (
                    <div key={child.id} className="relative flex-shrink-0">
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-300 dark:bg-slate-800"></div>
                        <OrganigramaNode node={child} level={level + 1} onEdit={onEdit} />
                    </div>
                ))}
            </div>
        </div>
    );

    if (node.esFantasma) {
        return (
            <div className="flex flex-col items-center">
                {/* Espacio invisible que ocupa el lugar del nodo */}
                <div className="flex flex-col items-center justify-center p-0.5 mb-14">
                   <div className="w-64 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] opacity-40">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-4 leading-tight">
                            {node.nombre}
                        </span>
                   </div>
                   <div className="w-px h-12 bg-slate-300 dark:bg-slate-700 mt-0"></div>
                </div>
                {hasChildren && renderChildren()}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Nodo actual */}
            <div className="relative flex flex-col items-center">
                {/* Connector Line (Top) with Arrow */}
                {level > 0 && (
                    <div className="flex flex-col items-center -mt-8 mb-2">
                        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700"></div>
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-slate-300 dark:border-t-slate-700"></div>
                    </div>
                )}

                <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className="relative group p-0.5"
                >
                    <div className="relative bg-white dark:bg-slate-900 rounded-[32px] border border-slate-400/50 dark:border-slate-700 shadow-xl w-64 overflow-hidden">
                        {/* Botón Editar */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(node);
                            }}
                            className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-[#004B93] dark:text-blue-400 p-2.5 rounded-2xl shadow-lg transition-all hover:scale-110 z-20 border border-slate-100 dark:border-slate-700 hover:bg-[#004B93] hover:text-white dark:hover:bg-blue-600 outline-none"
                            title="Editar Perfil"
                        >
                            <Pencil size={14} />
                        </button>

                        {/* Foto optimizada con encuadre superior */}
                        {node.foto ? (
                            <div className="h-72 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                                <img
                                    src={node.foto}
                                    alt={node.nombre}
                                    className="w-full h-full object-cover object-top transition-none"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                            </div>
                        ) : null}

                        {/* Información inferior */}
                        <div className={`p-6 ${!node.foto ? 'pt-8' : ''}`}>
                            <div className="flex flex-col items-center text-center">
                                {!node.foto && (
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700 shadow-inner text-slate-300">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}

                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 leading-tight line-clamp-1">
                                    {node.nombre}
                                </h3>

                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-full mb-4">
                                    <Briefcase className="w-3 h-3 text-[#004B93] dark:text-blue-400" />
                                    <span className="text-[10px] font-bold text-[#004B93] dark:text-blue-400 uppercase tracking-tighter line-clamp-1">
                                        {node.cargo}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Género</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{node.genero || '---'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nivel</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">{level + 1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conector Inferior */}
                    {hasChildren && (
                        <div className="w-px h-12 bg-slate-300 dark:bg-slate-700 mx-auto transition-colors group-hover:bg-[#004B93]"></div>
                    )}
                </div>
            </div>

            {/* Sub-nodos */}
            {hasChildren && renderChildren()}
        </div>
    );
};
