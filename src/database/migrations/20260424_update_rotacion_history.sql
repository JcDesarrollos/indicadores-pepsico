-- MIGRACIÓN PARA EL HISTORIAL DE TRASLADOS Y NOVEDADES (ROTACIÓN)
-- FECHA: 2026-04-24
-- DESCRIPCIÓN: Añadir campos de destino para persistencia de historial y autocompletado en edición.

USE RENOA_PEPSICO;

-- 1. Actualizar tabla de rotación con campos de destino
ALTER TABLE PSC_ROTACION 
ADD COLUMN IF NOT EXISTS RO_ASSIGNMENT_TYPE VARCHAR(20) NULL COMMENT 'Tipo de ámbito del traslado: SEDE, ZONA, PUESTO, NACIONAL',
ADD COLUMN IF NOT EXISTS RO_ID_DESTINO INT NULL COMMENT 'ID de la entidad de destino seleccionada';

-- 2. Índices para búsqueda rápida en historial (Opcional pero recomendado)
CREATE INDEX IDX_ROTACION_FECHA ON PSC_ROTACION(RO_FECHA);
CREATE INDEX IDX_ROTACION_TIPO ON PSC_ROTACION(RO_TIPO);
