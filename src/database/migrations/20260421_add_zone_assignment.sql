-- ===================================================
--  MIGRACIÓN: AMPLIACIÓN DE ALCANCE DE PERSONAL
--  DESCRIPCIÓN: Agrega soporte para asignación por Zona (Ciudades) en el personal
--  FECHA: 2026-04-21
-- ===================================================

USE RENOA_PEPSICO;

-- 1. Agregar campo CI_IDCIUDAD_FK a PSC_PERSONAL para asignación por zona
ALTER TABLE PSC_PERSONAL ADD COLUMN IF NOT EXISTS CI_IDCIUDAD_FK INT;

-- 2. Establecer la relación de llave foránea
ALTER TABLE PSC_PERSONAL 
ADD CONSTRAINT FK_PR_CIUDAD 
FOREIGN KEY (CI_IDCIUDAD_FK) REFERENCES PSC_CIUDAD(CI_IDCIUDAD_PK);

-- 3. Nota: PR_ASIGNACION_TIPO podría ser una columna adicional 
-- para facilitar la lógica, pero lo manejaremos por la presencia de FKs.
