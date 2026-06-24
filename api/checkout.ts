import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin, Product } from '../lib/supabase';
import { preferenceClient } from '../lib/mercadopago';
import { siteUrl } from '../lib/env';

/**
 * POST /api/checkout  { product_id: string }
 * Crea una preferencia de Mercado Pago (Checkout Pro) y devuelve el init_point.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const productId = body.product_id;
    if (!productId) {
      return res.status(400).json({ error: 'Falta product_id' });
    }

    const { data, error } = await supabaseAdmin()
      .from('products')
      .select('id, title, description, price, active')
      .eq('id', productId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const product = data as Pick<Product, 'id' | 'title' | 'description' | 'price' | 'active'>;
    if (!product.active) {
      return res.status(409).json({ error: 'Producto no disponible' });
    }

    const base = siteUrl();
    const preference = await preferenceClient().create({
      body: {
        items: [
          {
            id: product.id,
            title: product.title,
            description: product.description?.slice(0, 250) || undefined,
            quantity: 1,
            unit_price: Number(product.price),
            currency_id: 'ARS',
          },
        ],
        external_reference: product.id,
        metadata: { product_id: product.id },
        back_urls: {
          success: `${base}/gracias.html`,
          failure: `${base}/tienda.html?pago=fallido`,
          pending: `${base}/gracias.html`,
        },
        auto_return: 'approved',
        notification_url: `${base}/api/webhook`,
        statement_descriptor: 'FRANCISCA NUTRI',
      },
    });

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
    });
  } catch (err) {
    console.error('[checkout] error', err);
    return res.status(500).json({ error: 'No se pudo iniciar el pago' });
  }
}
