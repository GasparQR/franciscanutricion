import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, Product } from '../lib/supabase';

/**
 * GET /api/products
 * Devuelve los iBooks activos para el catálogo.
 * Nunca expone pdf_url (la ruta del archivo privado).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('products')
      .select('id, title, description, price, cover_image, active, created_at')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const products = (data as Omit<Product, 'pdf_url'>[]).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: Number(p.price),
      cover_image: p.cover_image,
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ products });
  } catch (err) {
    console.error('[products] error', err);
    return res.status(500).json({ error: 'No se pudo obtener el catálogo' });
  }
}
