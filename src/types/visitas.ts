export type VisitaEstado = 'PLANEADA' | 'EJECUTADA' | 'CANCELADA';

export interface VisitaTarea {
    id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
}

export interface Visita {
    id: number;
    idSede: number;
    anio: number;
    mes: number;
    semana: number;
    estado: VisitaEstado;
    fechaEjecucion?: Date;
    responsable?: string;
    observaciones?: string;
}

export interface VisitaCronogramaRow {
    idSede: number;
    zona: string;
    site: string;
    /** 
     * Mapa de visitas: llave "M{mes}-S{semana}" (ej: "M1-S1") 
     * Valor es una lista de visitas programadas en esa semana
     */
    plan: Record<string, Visita[]>;
}

export interface VisitaResultado {
    idTarea: number;
    nombreTarea: string;
    descripcionTarea?: string;
    hallazgo?: string;
    fotos?: string[]; // URLs de las imágenes capturadas
}

export interface VisitaEjecucion {
    idVisita: number;
    fechaInicio: Date;
    fechaFin?: Date;
    responsable: string;
    observaciones?: string;
    resultados: VisitaResultado[];
}
