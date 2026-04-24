'use client';

import React from 'react';
import { PersonalNode } from '@/services/indicadoresService';
import { User, Briefcase, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    node: PersonalNode;
    level?: number;
    onEdit?: (node: PersonalNode) => void;
}

export const OrganigramaNode: React.FC<Props> = ({ node, level = 0, onEdit }) => {
    const realChildren = node.children?.filter(c => !c.esFantasma) || [];
    const ghostChildren = node.children?.filter(c => c.esFantasma) || [];

    const realChildrenGrid = realChildren.length > 0 && (
        <div className="relative flex flex-col items-center w-full mt-4">
            <div className="absolute top-0 h-px bg-slate-300 dark:bg-slate-800" 
                 style={{ 
                     left: realChildren.length > 1 ? '10%' : '50%', 
                     right: realChildren.length > 1 ? '10%' : '50%' 
                 }}></div>

            <div className="flex flex-row flex-nowrap justify-center gap-x-12 px-2 pt-8">
                {realChildren.map((child) => (
                    <div key={child.id} className="relative flex-shrink-0 flex flex-col items-center">
                        <div className="absolute -top-8 w-px h-8 bg-slate-300 dark:bg-slate-800"></div>
                        <OrganigramaNode node={child} level={level + 1} onEdit={onEdit} />
                    </div>
                ))}
            </div>
        </div>
    );

    const ghostChildrenGrid = ghostChildren.length > 0 && (
        <div className="mt-20 w-full flex flex-col items-center">
            {/* Separador visual sutil si hay ramas reales arriba */}
            {realChildren.length > 0 && (
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-12"></div>
            )}
            <div className="flex flex-row flex-wrap justify-center gap-x-6 gap-y-12 px-2 max-w-[1400px]">
                {ghostChildren.map((ghost) => (
                    <React.Fragment key={ghost.id}>
                        {ghost.children?.map(c => (
                            <OrganigramaNode key={c.id} node={c} level={level + 1} onEdit={onEdit} />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    if (node.esFantasma) {
        return (
            <div className="flex flex-col items-center">
                {/* Los fantasmas simplemente pasan sus hijos al grid */}
                <div className="flex flex-row flex-wrap justify-center gap-6">
                    {node.children?.map(c => (
                        <OrganigramaNode key={c.id} node={c} level={level} onEdit={onEdit} />
                    ))}
                </div>
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

                    {/* Conector Inferior (SÓLO PARA HIJOS REALES) */}
                    {realChildren.length > 0 && (
                        <div className="w-px h-12 bg-slate-300 dark:bg-slate-700 mx-auto transition-colors group-hover:bg-[#004B93]"></div>
                    )}
                </div>
            </div>

            {realChildrenGrid}
            {ghostChildrenGrid}
        </div>
    );
};
