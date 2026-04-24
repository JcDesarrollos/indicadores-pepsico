export interface Puesto {
    id: number;
    nombre: string;
    idModalidad: number;
    modalidad?: string;
    activo: 'SI' | 'NO';
    cantidad?: number;
}

export interface ModalidadPuesto {
    id: number;
    nombre: string;
}
