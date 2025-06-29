// Import createBrowserClient from the new @supabase/ssr package
import { createBrowserClient } from '@supabase/ssr';

// Aquí van las variables de entorno de tu Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use createBrowserClient for the client-side Supabase instance
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
