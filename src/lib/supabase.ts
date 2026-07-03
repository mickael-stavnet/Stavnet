import { createClient } from '@supabase/supabase-js';

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
