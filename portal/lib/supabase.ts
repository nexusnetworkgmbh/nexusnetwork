import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let client: SupabaseClient | undefined;
export function configured() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY); }
export function appUrl() {
 const parsed = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nexusnetwork.pro');
 if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost','127.0.0.1'].includes(parsed.hostname))) throw new Error('HTTPS erforderlich.');
 return parsed.origin;
}
export function supabase() {
 if (typeof window === 'undefined' || !configured()) throw new Error('Supabase ist noch nicht konfiguriert.');
 client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', referrerPolicy: 'no-referrer' }) },
 });
 return client;
}
