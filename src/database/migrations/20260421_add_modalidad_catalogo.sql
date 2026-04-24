-- ===================================================
--  MIGRACIÓN: CATÁLOGO DE MODALIDADES DE PUESTO
--  DESCRIPCIÓN: Convierte el campo PU_MODALIDAD de texto a FK a tabla de catálogo
--  FECHA: 2026-04-21
-- ===================================================

USE RENOA_PEPSICO;

-- 1. Crear tabla de catálogo de modalidades
CREATE TABLE IF NOT EXISTS PSC_MODALIDAD_PUESTO (
    MP_IDMODALIDAD_PK   INT             AUTO_INCREMENT PRIMARY KEY,
    MP_NOMBRE           VARCHAR(100)    NOT NULL UNIQUE,
    MP_ACTIVO           VARCHAR(2)      DEFAULT 'SI' NOT NULL,
    MP_CREADOPOR        VARCHAR(100)    DEFAULT 'SISTEMA',
    MP_CREADOEN         DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- 2. Insertar modalidades específicas proporcionadas por el usuario
INSERT IGNORE INTO PSC_MODALIDAD_PUESTO (MP_NOMBRE) VALUES 
('24 Hrs - D- D'), 
('12 Hrs L-S Diurno'), 
('12 Hrs - L-S 19:00 - 07'), 
('L-S 17:00 a 05:00');

-- 3. Agregar el campo de FK a la tabla de puestos
ALTER TABLE PSC_PUESTO ADD COLUMN IF NOT EXISTS MP_IDMODALIDAD_FK INT;

-- 4. Migrar datos existentes (intento de matching por texto)
-- Nota: Como los strings pueden no coincidir exactamente con los anteriores, 
-- se recomienda mapear manualmente si es necesario o dejar que el sistema asigne los nuevos.
UPDATE PSC_PUESTO P
JOIN PSC_MODALIDAD_PUESTO M ON P.PU_MODALIDAD = M.MP_NOMBRE
SET P.MP_IDMODALIDAD_FK = M.MP_IDMODALIDAD_PK;

-- 5. Agregar la restricción de llave foránea
ALTER TABLE PSC_PUESTO 
ADD CONSTRAINT FK_PU_MODALIDAD 
FOREIGN KEY (MP_IDMODALIDAD_FK) REFERENCES PSC_MODALIDAD_PUESTO(MP_IDMODALIDAD_PK);
