'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, LabelList
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  LineChart as LineChartIcon,
  BarChart3,
  Search,
} from "lucide-react";
import { getComparativaEventosCriticos, getDetallesEventosCriticos } from "@/actions/eventosCriticosActions";
import DetalleNovedadModal from './DetalleNovedadModal';

// --- TIPOS ---
interface ComparativaPorSede {
  sede: string;
  año1: number;
  año2: number;
}

interface EventoCriticoDetail {
  NO_IDNOVEDAD_PK: number;
  NO_CONSECUTIVO: number;
  NO_FECHA_HORA: string;
  NO_DESCRIPCION: string;
  NO_GESTION: string | null;
  NO_ESTADO: string;
  TN_NOMBRE: string;
  SE_NOMBRE: string;
  CI_NOMBRE: string;
  US_NOMBRE: string;
  NR_NOMBRE: string | null;
  CL_NOMBRE: string;
  [key: string]: any;
}

interface DetallesTipoNovedad {
  tipo: string;
  cantidad: number;
  novedades: EventoCriticoDetail[];
}

export default function EventosCriticosModule() {
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [anio1, setAnio1] = useState(new Date().getFullYear() - 1);
  const [anio2, setAnio2] = useState(new Date().getFullYear());
  const [datosComparativa, setDatosComparativa] = useState<ComparativaPorSede[]>([]);
  const [detallesTipos, setDetallesTipos] = useState<DetallesTipoNovedad[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<{ sede: string; año: number } | null>(null);

  // Estados para el modal (Replicando funcionalidad RENOA)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNovedadDetail, setSelectedNovedadDetail] = useState<EventoCriticoDetail | null>(null);

  const [tipoGrafico, setTipoGrafico] = useState<"linea" | "barra">("linea");
  const [seriesVisibles, setSeriesVisibles] = useState<Record<string, boolean>>({
    [`${anio1}`]: true,
    [`${anio2}`]: true,
  });

  // Cargar datos comparativos
  useEffect(() => {
    fetchComparativa();
  }, [anio1, anio2]);

  // Cargar detalles cuando se selecciona una sede/año
  useEffect(() => {
    const fetchDetalles = async () => {
      try {
        const result = await getDetallesEventosCriticos(
          sedeSeleccionada ? sedeSeleccionada.año : null,
          sedeSeleccionada ? sedeSeleccionada.sede : null
        );

        if (result.success && result.data) {
          const novelties = result.data as EventoCriticoDetail[];
          const agrupado: Record<string, DetallesTipoNovedad> = {};

          novelties.forEach((n: any) => {
            const tipo = n.TN_NOMBRE || "Sin tipo";
            if (!agrupado[tipo]) {
              agrupado[tipo] = { tipo, cantidad: 0, novedades: [] };
            }
            agrupado[tipo].cantidad++;
            agrupado[tipo].novedades.push(n);
          });

          setDetallesTipos(Object.values(agrupado));
        }
      } catch (error) {
        console.error("Error fetching detalles:", error);
      }
    };
    fetchDetalles();
  }, [sedeSeleccionada]);

  const fetchComparativa = async () => {
    setLoadingData(true);
    try {
      const result = await getComparativaEventosCriticos(anio1, anio2);
      if (result.success && result.data) {
        const mappedData = result.data.map((item: any) => ({
          sede: item.SE_NOMBRE,
          año1: item.AÑO1_COUNT,
          año2: item.AÑO2_COUNT
        }));
        setDatosComparativa(mappedData);
      }
    } catch (error) {
      console.error("Error fetching comparativa:", error);
    } finally {
      setLoadingData(false);
      setLoading(false);
    }
  };

  const handleLegendClick = (e: any) => {
    const dataKey = e?.dataKey || e?.value;
    if (dataKey && (dataKey === `${anio1}` || dataKey === `${anio2}`)) {
      setSeriesVisibles((prev) => ({
        ...prev,
        [dataKey]: !prev[dataKey],
      }));
    }
  };

  const chartData = datosComparativa.map((item) => ({
    sede: item.sede.length > 10 ? item.sede.slice(0, 10) + "..." : item.sede,
    sedeCompleta: item.sede,
    [`${anio1}`]: item.año1,
    [`${anio2}`]: item.año2,
  }));

  const [filtroSede, setFiltroSede] = useState("");
  const datosFiltrados = datosComparativa.filter(item =>
    item.sede.toLowerCase().includes(filtroSede.toLowerCase())
  );

  const totalAño1 = datosFiltrados.reduce((sum, item) => sum + item.año1, 0);
  const totalAño2 = datosFiltrados.reduce((sum, item) => sum + item.año2, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="p-0 space-y-6">
      {/* 1. SELECTORES SUPERIORES (DISEÑO RENOA) */}
      <div className="flex flex-wrap items-center gap-3 pb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sede:</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Todas las sedes"
              className="flex h-9 min-w-[200px] border border-gray-300 bg-white pl-8 pr-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Año 1:</label>
          <select
            value={anio1}
            onChange={(e) => setAnio1(parseInt(e.target.value))}
            className="flex h-9 min-w-[90px] border border-gray-300 bg-white px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Año 2:</label>
          <select
            value={anio2}
            onChange={(e) => setAnio2(parseInt(e.target.value))}
            className="flex h-9 min-w-[90px] border border-gray-300 bg-white px-3 py-1 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* 2. CARD COMPARATIVA (CONTENEDOR TABLA + GRAFICO COMO RENOA) */}
      <Card>
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Comparativa de Eventos</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={tipoGrafico === "linea" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipoGrafico("linea")}
                className="h-7 w-7 p-0"
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={tipoGrafico === "barra" ? "default" : "outline"}
                size="sm"
                onClick={() => setTipoGrafico("barra")}
                className="h-7 w-7 p-0"
              >
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* TABLA - COLUMNA IZQUIERDA (DISEÑO INDUSTRIAL RENOA) */}
            <div className="lg:col-span-4">
              <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
                <table className="border border-black text-xs w-full">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th className="bg-[rgb(28,28,28)] text-white px-1.5 py-1 border border-black text-[10px] text-left">
                        Sede
                      </th>
                      <th className="bg-[rgb(28,28,28)] text-white px-1.5 py-1 border border-black text-[10px] w-14">
                        {anio1}
                      </th>
                      <th className="bg-[rgb(28,28,28)] text-white px-1.5 py-1 border border-black text-[10px] w-14">
                        {anio2}
                      </th>
                      <th className="bg-[rgb(28,28,28)] text-white px-1.5 py-1 border border-black text-[10px] w-12">
                        Dif.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {datosFiltrados.map((item) => {
                      const diferencia = item.año1 - item.año2;
                      const esAño1Sel = sedeSeleccionada?.sede === item.sede && sedeSeleccionada?.año === anio1;
                      const esAño2Sel = sedeSeleccionada?.sede === item.sede && sedeSeleccionada?.año === anio2;

                      return (
                        <tr key={item.sede}>
                          <td className="border border-black px-1.5 py-1 text-left text-[9px] font-medium truncate" title={item.sede}>
                            {item.sede}
                          </td>
                          <td
                            className={`border border-black px-1.5 py-1 text-center cursor-pointer hover:bg-gray-100 text-[10px] transition-colors ${esAño1Sel ? "bg-blue-100" : ""
                              }`}
                            onClick={() => setSedeSeleccionada({ sede: item.sede, año: anio1 })}
                          >
                            {item.año1}
                          </td>
                          <td
                            className={`border border-black px-1.5 py-1 text-center cursor-pointer hover:bg-gray-100 text-[10px] transition-colors ${esAño2Sel ? "bg-blue-100" : ""
                              }`}
                            onClick={() => setSedeSeleccionada({ sede: item.sede, año: anio2 })}
                          >
                            {item.año2}
                          </td>
                          <td className={`border border-black px-1.5 py-1 text-center text-[10px] font-medium ${diferencia > 0 ? "text-red-600" : diferencia < 0 ? "text-green-600" : ""}`}>
                            {diferencia > 0 ? "+" : ""}{diferencia}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold">
                      <td className="border border-black px-1.5 py-1 text-left text-[10px]">Total</td>
                      <td className="border border-black px-1.5 py-1 text-center text-[10px]">{totalAño1}</td>
                      <td className="border border-black px-1.5 py-1 text-center text-[10px]">{totalAño2}</td>
                      <td className="border border-black px-1.5 py-1 text-center text-[10px]">{totalAño1 - totalAño2}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* GRAFICO - COLUMNA DERECHA (DISEÑO RENOA) */}
            <div className="lg:col-span-8">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {tipoGrafico === "linea" ? (
                    <LineChart data={chartData} margin={{ top: 40, right: 20, left: 10, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sede" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(label) => chartData.find(d => d.sede === label)?.sedeCompleta || label} />
                      <Legend onClick={handleLegendClick} wrapperStyle={{ fontSize: "12px", cursor: "pointer" }} />
                      <Line type="monotone" dataKey={`${anio1}`} stroke="#1e40af" strokeWidth={2} name={`Eventos ${anio1}`} hide={!seriesVisibles[`${anio1}`]}>
                        <LabelList dataKey={`${anio1}`} position="top" style={{ fontSize: "10px", fill: "#1e40af", fontWeight: "bold" }} />
                      </Line>
                      <Line type="monotone" dataKey={`${anio2}`} stroke="#10b981" strokeWidth={2} name={`Eventos ${anio2}`} hide={!seriesVisibles[`${anio2}`]}>
                        <LabelList dataKey={`${anio2}`} position="top" style={{ fontSize: "10px", fill: "#10b981", fontWeight: "bold" }} />
                      </Line>
                    </LineChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 40, right: 20, left: 10, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sede" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(label) => chartData.find(d => d.sede === label)?.sedeCompleta || label} />
                      <Legend onClick={handleLegendClick} wrapperStyle={{ fontSize: "12px", cursor: "pointer" }} />
                      <Bar dataKey={`${anio1}`} fill="#1e40af" name={`Eventos ${anio1}`} hide={!seriesVisibles[`${anio1}`]} barSize={20}>
                        <LabelList dataKey={`${anio1}`} position="top" style={{ fontSize: "10px", fill: "#1e40af", fontWeight: "bold" }} />
                      </Bar>
                      <Bar dataKey={`${anio2}`} fill="#10b981" name={`Eventos ${anio2}`} hide={!seriesVisibles[`${anio2}`]} barSize={20}>
                        <LabelList dataKey={`${anio2}`} position="top" style={{ fontSize: "10px", fill: "#10b981", fontWeight: "bold" }} />
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. DETALLES DE EVENTOS (FILA INFERIOR COMPLETA - DISEÑO RENOA) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">
            {sedeSeleccionada
              ? `Detalles de Eventos (${sedeSeleccionada.sede} ${sedeSeleccionada.año})`
              : "Detalles de Eventos"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!sedeSeleccionada && !detallesTipos.length ? (
            <p className="text-center text-gray-500 py-12 italic">Seleccione una cantidad en la tabla para ver el desglose por tipo</p>
          ) : detallesTipos.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No hay registros detallados para la selección</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {detallesTipos.map((detalle) => (
                <Card
                  key={detalle.tipo}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    if (detalle.novedades.length > 0) {
                      setSelectedNovedadDetail(detalle.novedades[0]);
                      setIsDetailModalOpen(true);
                    }
                  }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{detalle.tipo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{detalle.cantidad}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL DE DETALLE OFICIAL */}
      <DetalleNovedadModal
        novedad={selectedNovedadDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedNovedadDetail(null);
        }}
      />
    </div>
  );
}
