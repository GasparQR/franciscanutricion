import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../lib/supabase';
import { requireEnv } from '../lib/env';

/**
 * GET /api/download?token=UUID
 * Entrega el PDF solo a quien tiene un token de descarga válido (orden pagada).
 * Genera una URL firmada temporal del bucket privado y redirige a ella.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token = req.query['token'] as string;
  if (!token) {
    return res.status(400).send('Falta el token de descarga.');
  }

  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from('orders')
      .select('payment_status, products ( pdf_url )')
      .eq('download_token', token)
      .maybeSingle();

    if (error) throw error;
    if (!data || (data as any).payment_status !== 'approved') {
      return res.status(404).send('Descarga no disponible o enlace inválido.');
    }

    const product = Array.isArray((data as any).products)
      ? (data as any).products[0]
      : (data as any).products;
    const pdfPath: string | undefined = product?.pdf_url;
    if (!pdfPath) {
      return res.status(404).send('El archivo no está disponible.');
    }

    // Si ya es una URL completa, redirigimos directo.
    if (/^https?:\/\//i.test(pdfPath)) {
      res.setHeader('Cache-Control', 'no-store');
      return res.redirect(302, pdfPath);
    }

    // Si es una ruta dentro del bucket privado, firmamos una URL temporal (5 min).
    const bucket = requireEnv('SUPABASE_PDF_BUCKET');
    const { data: signed, error: signErr } = await db.storage
      .from(bucket)
      .createSignedUrl(pdfPath, 60 * 5, { download: true });

    if (signErr || !signed?.signedUrl) {
      throw signErr || new Error('No se pudo firmar la URL');
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, signed.signedUrl);
  } catch (err) {
    console.error('[download] error', err);
    return res.status(500).send('No se pudo generar la descarga. Intentá nuevamente.');
  }
}
