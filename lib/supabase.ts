import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { requireEnv } from './env';

let client: SupabaseClient | null = null;

/**
 * Cliente de Supabase con clave service_role.
 * SOLO debe usarse desde funciones serverless (nunca en el frontend).
 */
export function supabaseAdmin(): SupabaseClient {
  if (!client) {
    client = createClient(
      requireEnv('SUPABASE_URL'),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      { auth: { persistSession: false } }
    );
  }
  return client;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  cover_image: string | null;
  pdf_url: string;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  product_id: string;
  buyer_name: string | null;
  buyer_email: string;
  payment_id: string;
  payment_status: string;
  amount: number;
  download_token: string;
  created_at: string;
}
