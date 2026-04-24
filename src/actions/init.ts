'use server';

import db from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * Asegura que existan los registros base y el usuario administrador inicial.
 * Basado en las variables de entorno definidas en .env
 */
export async function ensureAdminUser() {
  const username = process.env.DEFAULT_ADMIN_USERNAME;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const name = process.env.DEFAULT_ADMIN_NAME || 'Administrador';
  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@pepsico.com';

  if (!username || !password) {
    console.warn('⚠️ No se han definido DEFAULT_ADMIN_USERNAME o DEFAULT_ADMIN_PASSWORD en el .env');
    return;
  }

  try {
    // 1. Asegurar Cliente ID=1
    await db.execute(
      'INSERT IGNORE INTO PSC_CLIENTE (CL_IDCLIENTE_PK, CL_NOMBRE, CL_ACTIVO) VALUES (1, "PEPSICO COLOMBIA", "SI")'
    );

    // 2. Asegurar Rol ID=1 (Administrador)
    await db.execute(
      'INSERT IGNORE INTO PSC_ROL (RL_IDROL_PK, RL_NOMBRE, RL_DESCRIPCION, RL_ACTIVO) VALUES (1, "ADMINISTRADOR", "Acceso Total", "SI")'
    );

    // 3. Verificar si el usuario ya existe
    const [rows]: any = await db.execute(
      'SELECT US_IDUSUARIO_PK FROM PSC_USUARIO WHERE US_USUARIO = ?',
      [username]
    );

    if (rows.length === 0) {
      console.log(`🚀 Inicializando usuario administrador: ${username}...`);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // 4. Insertar usuario admin
      await db.execute(
        `INSERT INTO PSC_USUARIO 
        (CL_IDCLIENTE_FK, RL_IDROL_FK, US_NOMBRE, US_CORREO, US_USUARIO, US_CONTRASENA, US_ACTIVO) 
        VALUES (1, 1, ?, ?, ?, ?, "SI")`,
        [name, email, username, hashedPassword]
      );
      
      console.log('✅ Usuario administrador creado con éxito.');
    }
  } catch (error) {
    console.error('❌ Error en el proceso de inicialización:', error);
  }
}
