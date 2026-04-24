'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Table, Plus } from "lucide-react";
import {
  getComparativaRotacionAction,
  getRotacionSedeMesAction,
  getRotacionMotivosAction
} from "@/actions/rotacionActions";
import RegistrarRotacionModal from './RegistrarRotacionModal';
import DetalleRotacionesModal from './DetalleRotacionesModal';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function RotacionModule() {
  const [loading, setLoading] = useState(true);
  const [anio1, setAnio1] = useState(2025);
  const [anio2, setAnio2] = useState(2026);

  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);
  const [matrizSede, setMatrizSede] = useState<any[]>([]);
  const [motivosAño1, setMotivosAño1] = useState<any[]>([]);
  const [motivosAño2, setMotivosAño2] = useState<any[]>([]);

  // Estado para el modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para el modal de detalle
  const [detailConfig, setDetailConfig] = useState<{ isOpen: boolean, sede: string, mes: number } | null>(null);

  useEffect(() => {
    fetchData();
  }, [anio1, anio2]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resGraf, resMat, resMot1, resMot2] = await Promise.all([
        getComparativaRotacionAction(anio1, anio2),
        getRotacionSedeMesAction(anio2),
        getRotacionMotivosAction(anio1),
        getRotacionMotivosAction(anio2)
      ]);

      if (resGraf.success && resGraf.data) {
        const mapped = resGraf.data.map((item: any) => ({
          mes: item.mes.slice(0, 3),
          [`${anio1}`]: item.año1,
          [`${anio2}`]: item.año2
        }));
        setDatosGrafico(mapped);
      }

      if (resMat.success && resMat.data) setMatrizSede(resMat.data);
      if (resMot1.success && resMot1.data) setMotivosAño1(resMot1.data);
      if (resMot2.success && resMot2.data) setMotivosAño2(resMot2.data);

    } catch (error) {
      console.error("Error al cargar datos de rotación:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* SELECCIÓN DE AÑOS Y ACCIÓN PRINCIPAL */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 border rounded-lg shadow-sm border-l-4 border-l-rose-500">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Año A:</label>
            <select
              value={anio1}
              onChange={(e) => setAnio1(parseInt(e.target.value))}
              className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 border-l pl-4">
            <label className="text-[10px] font-medium text-muted-foreground uppercase">Año B:</label>
            <select
              value={anio2}
              onChange={(e) => setAnio2(parseInt(e.target.value))}
              className="flex h-8 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Registrar Nueva Rotación
        </Button>
      </div>

      {/* GRÁFICO DE ROTACIÓN (%) */}
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tight">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            Porcentaje de Rotación Mensual
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosGrafico} margin={{ top: 30, right: 30, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: any) => [`${value}%`, 'Rotación']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  type="monotone"
                  dataKey={`${anio1}`}
                  stroke="#1e4d6b"
                  strokeWidth={3}
                  name={`${anio1}`}
                  dot={{ r: 4, fill: '#1e4d6b', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList dataKey={`${anio1}`} position="top" offset={10} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#1e4d6b' }} formatter={(v: any) => `${v}%`} />
                </Line>
                <Line
                  type="monotone"
                  dataKey={`${anio2}`}
                  stroke="#e67e22"
                  strokeWidth={3}
                  name={`${anio2}`}
                  dot={{ r: 4, fill: '#e67e22', strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                >
                  <LabelList dataKey={`${anio2}`} position="top" offset={10} style={{ fontSize: '11px', fontWeight: 'bold', fill: '#e67e22' }} formatter={(v: any) => `${v}%`} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* MATRIZ POR SEDE (MES A MES) */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black flex items-center gap-2 uppercase">
            <Table className="h-4 w-4" />
            Rotaciones por Sede (Año {anio2})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse">
              <thead className="bg-[#f8f9fa] sticky top-0 uppercase">
                <tr className="border-b border-gray-300">
                  <th className="px-3 py-2 border-r border-gray-200 text-center w-12 font-bold">No</th>
                  <th className="px-3 py-2 border-r border-gray-200 text-left font-bold">Site (Sede)</th>
                  {MESES.map(m => (
                    <th key={m} className="px-2 py-2 border-r border-gray-200 text-center w-10 font-bold">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {matrizSede.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 border-r border-gray-200 text-center font-medium bg-gray-50">{idx + 1}</td>
                    <td className="px-3 py-2 border-r border-gray-200 italic text-blue-900 font-bold">{row.sede}</td>
                    {row.meses.map((val: number, i: number) => (
                      <td
                        key={i}
                        onClick={() => val > 0 && setDetailConfig({ isOpen: true, sede: row.sede, mes: i + 1 })}
                        className={`px-2 py-2 border-r border-gray-100 text-center font-mono ${val > 0 ? 'bg-orange-50 font-bold text-orange-700 cursor-pointer hover:bg-orange-100 transition-all' : 'text-gray-400'}`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* TABLAS COMPARATIVAS DE MOTIVOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xs font-black uppercase text-gray-600 flex items-center justify-between">
              <span>Desglose por Mes (Año {anio1})</span>
              <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded">HISTORIAL</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#fcfcfc] border-b">
                <tr className="uppercase text-[10px] font-bold">
                  <th className="px-4 py-2 border-r w-16">Mes</th>
                  <th className="px-4 py-2 border-r">Descripción</th>
                  <th className="px-4 py-2 text-center w-20">{anio1}</th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((mes, index) => {
                  const items = motivosAño1.filter(m => m.mes === mes);
                  return items.length > 0 ? (
                    items.map((item, i) => (
                      <tr key={`${mes}-${i}`} className="border-b border-gray-50">
                        {i === 0 && <td className="px-4 py-2 border-r font-bold bg-gray-50" rowSpan={items.length}>{mes}</td>}
                        <td className="px-4 py-2 border-r italic">{item.descripcion}</td>
                        <td className="px-4 py-2 text-center font-mono font-bold bg-blue-50 text-blue-800">{item.cantidad}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={mes} className="border-b border-gray-50 opacity-40">
                      <td className="px-4 py-2 border-r font-bold bg-gray-50">{mes}</td>
                      <td className="px-4 py-2 border-r">-</td>
                      <td className="px-4 py-2 text-center">0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-xs font-black uppercase text-gray-600 flex items-center justify-between">
              <span>Desglose por Mes (Año {anio2})</span>
              <span className="text-[10px] bg-orange-200 px-2 py-0.5 rounded text-orange-900 border border-orange-300">ACTUAL</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#fcfcfc] border-b">
                <tr className="uppercase text-[10px] font-bold">
                  <th className="px-4 py-2 border-r w-16">Mes</th>
                  <th className="px-4 py-2 border-r">Descripción</th>
                  <th className="px-4 py-2 text-center w-20">{anio2}</th>
                </tr>
              </thead>
              <tbody>
                {MESES.map((mes, index) => {
                  const items = motivosAño2.filter(m => m.mes === mes);
                  return items.length > 0 ? (
                    items.map((item, i) => (
                      <tr key={`${mes}-${i}`} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        {i === 0 && <td className="px-4 py-2 border-r border-slate-200 font-bold bg-slate-50 text-slate-700" rowSpan={items.length}>{mes}</td>}
                        <td className="px-4 py-2 border-r border-slate-200 italic text-orange-900">{item.descripcion}</td>
                        <td
                          className="px-4 py-2 text-center font-mono font-bold bg-orange-50 text-orange-800 cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => setDetailConfig({ isOpen: true, sede: 'TODOS', mes: index + 1 })}
                        >
                          {item.cantidad}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={mes} className="border-b border-slate-200 opacity-60 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2 border-r border-slate-200 font-bold bg-slate-50 text-slate-400">{mes}</td>
                      <td className="px-4 py-2 border-r border-slate-200">-</td>
                      <td
                        className="px-4 py-2 text-center cursor-pointer hover:bg-slate-100"
                        onClick={() => setDetailConfig({ isOpen: true, sede: 'TODOS', mes: index + 1 })}
                      >
                        0
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* MODAL DE DETALLE */}
      {detailConfig && (
        <DetalleRotacionesModal
          isOpen={detailConfig.isOpen}
          onClose={() => setDetailConfig(prev => prev ? { ...prev, isOpen: false } : null)}
          sedeNom={detailConfig.sede}
          mesNum={detailConfig.mes}
          anio={anio2}
          onDataChange={fetchData}
        />
      )}

      {/* MODAL DE REGISTRO */}
      <RegistrarRotacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
