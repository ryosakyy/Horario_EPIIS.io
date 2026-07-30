-- Agregar columna 'nombre' a horarios para soportar múltiples horarios guardados por estudiante
ALTER TABLE horarios ADD COLUMN IF NOT EXISTS nombre TEXT DEFAULT 'Mi horario';

-- Ya no hay restricción UNIQUE en estudiante_id, cada estudiante puede tener varios horarios
CREATE INDEX IF NOT EXISTS idx_horarios_estudiante_nombre ON horarios(estudiante_id, nombre);
