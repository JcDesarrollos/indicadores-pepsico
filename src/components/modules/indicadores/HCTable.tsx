'use client';

import React from 'react';

interface Props {
    stats: { cargo: string, total: number }[];
}

export default function HCTable({ stats }: Props) {
    const totalGeneral = stats.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <div className="absolute top-0 left-0 z-[50] pointer-events-auto origin-top-left scale-[1.5]">
            <div className="bg-white border-4 border-slate-400 shadow-2xl overflow-hidden min-w-[450px]">
                {/* Header Excel Style - GIGANTE */}
                <div className="bg-slate-100 border-b-4 border-slate-400 px-8 py-5">
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                        RESUMEN DE PERSONAL (HC)
                    </h3>
                </div>

                {/* Table Content */}
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b-2 border-slate-300">
                            <th className="px-8 py-4 text-lg font-black text-slate-500 uppercase border-r-2 border-slate-300">Cargo</th>
                            <th className="px-8 py-4 text-lg font-black text-slate-500 uppercase text-right">Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.map((item, idx) => (
                            <tr key={idx} className="border-b-2 border-slate-200 hover:bg-blue-50 transition-colors">
                                <td className="px-8 py-5 text-xl font-bold text-slate-700 border-r-2 border-slate-300 uppercase">
                                    {item.cargo}
                                </td>
                                <td className="px-8 py-5 text-3xl font-black text-slate-900 text-right tabular-nums">
                                    {item.total}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-slate-100 font-black text-slate-900 border-t-4 border-slate-400">
                            <td className="px-8 py-6 text-2xl border-r-2 border-slate-300 uppercase">TOTAL GENERAL</td>
                            <td className="px-8 py-6 text-5xl text-[#004B93] text-right tabular-nums">{totalGeneral}</td>
                        </tr>
                    </tfoot>
                </table>
                
                {/* Footer Deco */}
                <div className="bg-[#004B93] h-3 w-full"></div>
            </div>
        </div>
    );
}
