import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazy initialization of Supabase client to avoid crash when keys are pending.
 * Checks import.meta.env (vite), process.env (node), localStorage or window overrides.
 */
export function getSupabase(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  const url =
    (typeof window !== 'undefined' && (window as any)._env_?.VITE_SUPABASE_URL) ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_URL_OVERRIDE__) ||
    (typeof window !== 'undefined' && localStorage.getItem('E_WARGA_SUPABASE_URL')) ||
    (typeof process !== 'undefined' && process.env.SUPABASE_URL) ||
    ((import.meta as any).env?.VITE_SUPABASE_URL) ||
    '';

  const anonKey =
    (typeof window !== 'undefined' && (window as any)._env_?.VITE_SUPABASE_ANON_KEY) ||
    (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY_OVERRIDE__) ||
    (typeof window !== 'undefined' && localStorage.getItem('E_WARGA_SUPABASE_ANON_KEY')) ||
    (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) ||
    ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    '';

  if (!url || !anonKey) {
    throw new Error(
      'Supabase credentials are not configured. Please use the Database Setup console to configure your Supabase URL and Anon Key.'
    );
  }

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return supabaseInstance;
}

/**
 * True if credentials are configured
 */
export function hasSupabaseConfig(): boolean {
  try {
    const url =
      (typeof window !== 'undefined' && (window as any)._env_?.VITE_SUPABASE_URL) ||
      (typeof window !== 'undefined' && (window as any).__SUPABASE_URL_OVERRIDE__) ||
      (typeof window !== 'undefined' && localStorage.getItem('E_WARGA_SUPABASE_URL')) ||
      (typeof process !== 'undefined' && process.env.SUPABASE_URL) ||
      ((import.meta as any).env?.VITE_SUPABASE_URL);

    const anonKey =
      (typeof window !== 'undefined' && (window as any)._env_?.VITE_SUPABASE_ANON_KEY) ||
      (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY_OVERRIDE__) ||
      (typeof window !== 'undefined' && localStorage.getItem('E_WARGA_SUPABASE_ANON_KEY')) ||
      (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) ||
      ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

    return !!(url && anonKey);
  } catch {
    return false;
  }
}
