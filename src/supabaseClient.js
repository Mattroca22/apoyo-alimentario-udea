import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación previa para evitar el colapso de la pantalla en blanco
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ ERROR EN VARIABLES DE ENTORNO:\n" +
    "No se están detectando las credenciales en el archivo .env.local.\n" +
    "Asegúrate de que las variables inicien con 'VITE_' y que reiniciaste el servidor."
  );
}

// Inicialización con valores de respaldo para mantener vivo el renderizado
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-proyecto.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);