import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

let cachedClient: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = readRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

function bindClientMethod(method: unknown): unknown {
  if (typeof method === "function") {
    return method.bind(getSupabaseClient());
  }

  return method;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property, receiver) {
    if (property === Symbol.toStringTag) {
      return "SupabaseClient";
    }

    const client = getSupabaseClient();
    const value = Reflect.get(client, property, receiver);

    return bindClientMethod(value);
  },
}) as SupabaseClient;
