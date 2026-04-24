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
    // 1. Separar hijos reales de los contenedores de huerfanos (fantasmas)
    const realChildren = node.children?.filter(c => !c.esFantasma) || [];
    const ghostChildren = node.children?.filter(c => c.esFantasma) || [];

    // 2. Grid de hijos reales (Supervisores / Operadores con lineas conectoras)
    const realChildrenGrid = realChildren.length > 0 && (
        <div className="relative flex flex-col items-center w-full mt-4">
            {/* Linea horizontal centrada exactamente entre el primero y el ultimo */}
            <div className="absolute top-0 h-0.5 bg-slate-400 dark:bg-slate-700" 
                 style={{ 
                     left: realChildren.length > 1 ? 'calc(128px + 1.5rem)' : '50%', 
                     right: realChildren.length > 1 ? 'calc(128px + 1.5rem)' : '50%' 
                 }}></div>

            <div className="flex flex-row flex-nowrap justify-center gap-x-12 px-6 pt-10">
                {realChildren.map((child) => (
                    <div key={child.id} className="relative flex-shrink-0 flex flex-col items-center">
                        <div className="absolute -top-10 w-0.5 h-10 bg-slate-400 dark:bg-slate-700"></div>
                        <OrganigramaNode node={child} level={level + 1} onEdit={onEdit} />
                    </div>
                ))}
            </div>
        </div>
    );

    // 3. Grid Global de Guardas (La Base de la Piramide - SIN LINEAS - UNA SOLA FILA)
    const ghostChildrenGrid = ghostChildren.length > 0 && (
        <div className="mt-32 w-full flex flex-col items-center">
            {/* Contenedor forzado a no romperse en filas (flex-nowrap) */}
            <div className="flex flex-row flex-nowrap justify-center gap-8 px-12">
                {ghostChildren.map((ghost) => (
                    <React.Fragment key={ghost.id}>
                        {ghost.children?.map(opGhost => (
                            <React.Fragment key={opGhost.id}>
                                {opGhost.children?.map(guard => (
                                    <div key={guard.id} className="flex-shrink-0">
                                        <OrganigramaNode node={guard} level={level + 1} onEdit={onEdit} />
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );

    // Bypass para nodos fantasmas (ellos no se dibujan, solo sus hijos)
    if (node.esFantasma) {
        return (
             <div className="flex flex-row flex-nowrap justify-center gap-8">
                {node.children?.map(c => (
                    <OrganigramaNode key={c.id} node={c} level={level} onEdit={onEdit} />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center">
            {/* Nodo actual */}
            <div className="relative flex flex-col items-center">
                {/* Connector Line (Top) with Arrow - MÁS GRANDE Y PEGADO */}
                {level > 0 && (
                    <div className="flex flex-col items-center -mt-10 mb-0">
                        <div className="w-0.5 h-10 bg-slate-400 dark:bg-slate-700"></div>
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-400 dark:border-t-slate-700"></div>
                    </div>
                )}

                <div className="relative group p-0.5">
                    <div className="relative bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-200 dark:border-slate-800 shadow-xl w-64 overflow-hidden">
                        {/* Botón Editar (Solo aparece en hover para limpieza) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(node);
                            }}
                            className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-[#004B93] p-2.5 rounded-2xl shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 border border-slate-100 dark:border-slate-700"
                        >
                            <Pencil size={14} />
                        </button>

                        {/* Foto optimizada */}
                        {node.foto && (
                            <div className="h-72 w-full relative overflow-hidden bg-slate-50 border-b-2 border-slate-100 dark:border-slate-800">
                                <img src={node.foto} alt={node.nombre} className="w-full h-full object-cover object-top" />
                            </div>
                        )}

                        {/* Información */}
                        <div className={`p-6 ${!node.foto ? 'pt-8' : ''}`}>
                            <div className="flex flex-col items-center text-center">
                                {!node.foto && (
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 border-2 border-slate-100 dark:border-slate-700 shadow-inner text-slate-300">
                                        <User className="w-8 h-8" />
                                    </div>
                                )}
                                <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1 line-clamp-1">
                                    {node.nombre}
                                </h3>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50/50 dark:bg-blue-900/10 rounded-full mb-4">
                                    <Briefcase className="w-3 h-3 text-[#004B93] dark:text-blue-400" />
                                    <span className="text-[9px] font-bold text-[#004B93] dark:text-blue-400 uppercase tracking-tighter line-clamp-1">
                                        {node.cargo}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t-2 border-slate-50 dark:border-slate-800">
                                    <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">GÉNERO</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase leading-none">{node.genero || '---'}</span>
                                    </div>
                                    <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">NIVEL</span>
                                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase leading-none">{level + 1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Conector Inferior (SÓLO PARA HIJOS REALES) */}
                    {realChildren.length > 0 && (
                        <div className="w-0.5 h-12 bg-slate-400 dark:bg-slate-700 mx-auto transition-colors group-hover:bg-[#004B93]"></div>
                    )}
                </div>
            </div>

            {realChildrenGrid}
            {ghostChildrenGrid}
        </div>
    );
};
