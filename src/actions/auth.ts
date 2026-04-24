'use server';

import db from '@/lib/db';
import { AuthResponse } from '@/types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME!;

/**
 * Acción de servidor para manejar el inicio de sesión
 */
export async function loginAction(formData: FormData): Promise<AuthResponse> {
  const usuario = formData.get('username') as string;
  const contrasena = formData.get('password') as string;

  if (!usuario || !contrasena) {
    return { success: false, message: 'Usuario y contraseña son requeridos' };
  }

  try {
    const [rows]: any = await db.execute(
      'SELECT US_IDUSUARIO_PK, US_NOMBRE, US_CORREO, US_USUARIO, US_CONTRASENA, RL_IDROL_FK, US_ACTIVO FROM PSC_USUARIO WHERE US_USUARIO = ?',
      [usuario]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    const user = rows[0];

    if (user.US_ACTIVO !== 'SI') {
      return { success: false, message: 'El usuario se encuentra inactivo' };
    }

    // Nota: Si en RENOA la contraseña no está hasheada con bcrypt, 
    // este login fallará. Se asume compatibilidad con el sistema base.
    const isMatch = await bcrypt.compare(contrasena, user.US_CONTRASENA);

    if (!isMatch) {
      return { success: false, message: 'Usuario o contraseña incorrectos' };
    }

    // Generar Token
    const token = jwt.sign(
      { 
        id: user.US_IDUSUARIO_PK, 
        usuario: user.US_USUARIO,
        nombre: user.US_NOMBRE
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Guardar en Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800, // 7 días
      path: '/',
    });

    return { 
      success: true, 
      message: 'Bienvenido al sistema',
      user: {
        id: user.US_IDUSUARIO_PK,
        nombre: user.US_NOMBRE,
        correo: user.US_CORREO,
        usuario: user.US_USUARIO,
        rol_id: user.RL_IDROL_FK,
        activo: user.US_ACTIVO
      }
    };

  } catch (error) {
    console.error('Error in loginAction:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}
