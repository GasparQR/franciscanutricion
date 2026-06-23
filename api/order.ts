import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';

/**
 * GET /api/order?payment_id=XXXX
 * Lo usa la página de gracias para mostrar el producto y el botón de descarga.
 * Devuelve { status: 'ready', ... } cuando el webhook ya registró la venta,
 * o { status: 'pending' } mientras tanto (la página hace polling).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const paymentId = (req.query['payment_id'] as string) || (req.query['payment_id'] as string);
  if (!paymentId) {
    return res.status(400).json({ error: 'Falta payment_id' });
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from('orders')
      .select('download_token, buyer_name, products ( title )')
      .eq('payment_id', String(paymentId))
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      // Aún no procesado por el webhook.
      return res.status(200).json({ status: 'pending' });
    }

    const product = Array.isArray((data as any).products)
      ? (data as any).products[0]
      : (data as any).products;

    return res.status(200).json({
      status: 'ready',
      product_title: product?.title || 'tu iBook',
      buyer_name: (data as any).buyer_name || null,
      download_url: `/api/download?token=${(data as any).download_token}`,
    });
  } catch (err) {
    console.error('[order] error', err);
    return res.status(500).json({ error: 'No se pudo consultar la compra' });
  }
}
