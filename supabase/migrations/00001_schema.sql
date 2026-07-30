-- Esquema inicial para el sistema de horarios EPIIS-UNAMBA
-- Ejecutar en el SQL Editor de Supabase

-- 1. Tabla de estudiantes registrados
CREATE TABLE IF NOT EXISTS estudiantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  correo TEXT UNIQUE NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 12),
  created_at TIMESTAMPTZ DEFAULT now(),
  ultima_conexion TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de horarios guardados por estudiante
CREATE TABLE IF NOT EXISTS horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  semestre INTEGER NOT NULL,
  seleccionados JSONB DEFAULT '[]'::jsonb,
  actividades JSONB DEFAULT '[]'::jsonb,
  personalizadas JSONB DEFAULT '[]'::jsonb,
  sesiones_movidas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_horarios_estudiante ON horarios(estudiante_id);

-- 3. Tabla de sesiones de administrador (creadas internamente)
CREATE TABLE IF NOT EXISTS administradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de intentos de bloqueo de admin
CREATE TABLE IF NOT EXISTS bloqueos_admin (
  email TEXT PRIMARY KEY,
  fails INTEGER DEFAULT 0,
  until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de visitas/métricas
CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE SET NULL,
  dia DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trigger para actualizar updated_at en horarios
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_horarios_updated_at
  BEFORE UPDATE ON horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 7. Trigger para actualizar ultima_conexion al insertar visita
CREATE OR REPLACE FUNCTION update_ultima_conexion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estudiante_id IS NOT NULL THEN
    UPDATE estudiantes SET ultima_conexion = now() WHERE id = NEW.estudiante_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_visitas_conexion
  AFTER INSERT ON visitas
  FOR EACH ROW
  EXECUTE FUNCTION update_ultima_conexion();

-- 8. Row Level Security
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE administradores ENABLE ROW LEVEL SECURITY;

-- Políticas: estudiantes solo ven/editan su propio registro
CREATE POLICY "estudiantes_self_select" ON estudiantes
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "estudiantes_self_insert" ON estudiantes
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "estudiantes_self_update" ON estudiantes
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "horarios_self_select" ON horarios
  FOR SELECT USING (estudiante_id = auth.uid());
CREATE POLICY "horarios_self_insert" ON horarios
  FOR INSERT WITH CHECK (estudiante_id = auth.uid());
CREATE POLICY "horarios_self_update" ON horarios
  FOR UPDATE USING (estudiante_id = auth.uid());
CREATE POLICY "horarios_self_delete" ON horarios
  FOR DELETE USING (estudiante_id = auth.uid());

-- Admin seed
INSERT INTO administradores (nombre, email)
VALUES ('Dirección EPIIS', 'admin@unamba.edu.pe')
ON CONFLICT (email) DO NOTHING;

-- Políticas para permitir registro de visitas
CREATE POLICY "visitas_insert_all" ON visitas
  FOR INSERT WITH CHECK (true);


-- 9. Funciones y Políticas de Administrador
-- Función para verificar si un usuario es administrador basado en su email autenticado
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM administradores 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para que los administradores puedan ver todos los datos
CREATE POLICY "admin_all_select_estudiantes" ON estudiantes
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_all_select_horarios" ON horarios
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_all_select_visitas" ON visitas
  FOR SELECT USING (is_admin());

CREATE POLICY "admin_all_select_administradores" ON administradores
  FOR SELECT USING (is_admin());
