import { createBrowserClient } from '@supabase/ssr';

// Variables de entorno para Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear cliente de Supabase para el lado cliente
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
