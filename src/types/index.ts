/**
 * Definiciones de tipos globales para el proyecto Indicadores PepsiCo
 */

export interface User {
  id: number;
  nombre: string;
  correo: string | null;
  usuario: string;
  rol_id: number;
  activo: 'SI' | 'NO';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
