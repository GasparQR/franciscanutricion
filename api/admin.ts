import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { requireEnv } from '../lib/env';

/**
 * GET /api/admin   (header: Authorization: Bearer <ADMIN_TOKEN>)
 * Panel de solo consulta: ventas totales, compras recientes, emails y productos vendidos.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Autenticación simple por token.
  const auth = (req.headers['authorization'] as string) || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== requireEnv('ADMIN_TOKEN')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from('orders')
      .select('id, buyer_name, buyer_email, amount, payment_status, created_at, products ( title )')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const orders = (data || []).map((o: any) => ({
      id: o.id,
      buyer_name: o.buyer_name,
      buyer_email: o.buyer_email,
      amount: Number(o.amount),
      status: o.payment_status,
      created_at: o.created_at,
      product_title: Array.isArray(o.products) ? o.products[0]?.title : o.products?.title,
    }));

    const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

    // Ranking de productos vendidos.
    const byProduct: Record<string, { title: string; count: number; revenue: number }> = {};
    for (const o of orders) {
      const key = o.product_title || 'Sin producto';
      byProduct[key] = byProduct[key] || { title: key, count: 0, revenue: 0 };
      byProduct[key].count += 1;
      byProduct[key].revenue += o.amount || 0;
    }
    const products = Object.values(byProduct).sort((a, b) => b.count - a.count);

    return res.status(200).json({
      stats: {
        total_revenue: totalRevenue,
        total_orders: orders.length,
        unique_buyers: new Set(orders.map((o) => o.buyer_email)).size,
      },
      products,
      orders,
    });
  } catch (err) {
    console.error('[admin] error', err);
    return res.status(500).json({ error: 'No se pudieron obtener los datos' });
  }
}
