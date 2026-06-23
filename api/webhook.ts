import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { supabaseAdmin, Product } from '../lib/supabase';
import { paymentClient } from '../lib/mercadopago';
import { sendDeliveryEmail } from '../lib/email';
import { siteUrl, optionalEnv } from '../lib/env';

/**
 * POST /api/webhook
 * Notificaciones de Mercado Pago. Solo procesa pagos APROBADOS.
 * - Valida la firma (si MP_WEBHOOK_SECRET está definido).
 * - Registra la orden de forma idempotente (unique payment_id) -> evita duplicados.
 * - Envía el email de entrega una sola vez (solo en el alta real).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    // El id del pago puede venir por query (?data.id / ?id) o en el body.
    const type = (req.query['type'] as string) || (req.query['topic'] as string) || body.type || body.topic;
    const paymentId =
      (req.query['data.id'] as string) ||
      (req.query['id'] as string) ||
      body?.data?.id ||
      body?.id;

    // Solo nos interesan notificaciones de pago.
    if (type && type !== 'payment') {
      return res.status(200).json({ received: true, ignored: type });
    }
    if (!paymentId) {
      return res.status(200).json({ received: true, ignored: 'sin id' });
    }

    // ── Validación de firma (opcional pero recomendada) ──
    if (!isValidSignature(req, String(paymentId))) {
      console.warn('[webhook] firma inválida para payment', paymentId);
      return res.status(401).json({ error: 'Firma inválida' });
    }

    // ── Consultar el pago real en la API de MP (no confiar en el body) ──
    const payment = await paymentClient().get({ id: String(paymentId) });

    if (payment.status !== 'approved') {
      return res.status(200).json({ received: true, status: payment.status });
    }

    const productId = payment.external_reference || (payment.metadata as any)?.product_id;
    if (!productId) {
      console.error('[webhook] pago aprobado sin product_id', paymentId);
      return res.status(200).json({ received: true, warning: 'sin product_id' });
    }

    const db = supabaseAdmin();
    const { data: prodData } = await db
      .from('products')
      .select('id, title, pdf_url')
      .eq('id', productId)
      .single();
    const product = prodData as Pick<Product, 'id' | 'title' | 'pdf_url'> | null;
    if (!product) {
      console.error('[webhook] producto inexistente', productId);
      return res.status(200).json({ received: true, warning: 'producto inexistente' });
    }

    const buyerEmail = payment.payer?.email || '';
    const buyerName =
      [payment.payer?.first_name, payment.payer?.last_name].filter(Boolean).join(' ').trim() || null;

    // ── Alta idempotente: si ya existe la orden, no se inserta ni se reenvía email ──
    const { data: inserted, error: insertError } = await db
      .from('orders')
      .insert({
        product_id: product.id,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        payment_id: String(payment.id),
        payment_status: payment.status,
        amount: Number(payment.transaction_amount || 0),
      })
      .select('id, download_token')
      .single();

    if (insertError) {
      // 23505 = unique_violation -> ya estaba registrada (reintento de webhook). Idempotente.
      if ((insertError as any).code === '23505') {
        return res.status(200).json({ received: true, duplicate: true });
      }
      throw insertError;
    }

    // ── Email de entrega (una sola vez) ──
    if (buyerEmail) {
      const downloadUrl = `${siteUrl()}/api/download?token=${inserted.download_token}`;
      try {
        await sendDeliveryEmail({
          to: buyerEmail,
          buyerName,
          productTitle: product.title,
          downloadUrl,
        });
      } catch (mailErr) {
        // No revertimos la venta si falla el email; queda registrada y se puede reenviar.
        console.error('[webhook] fallo al enviar email', mailErr);
      }
    }

    return res.status(200).json({ received: true, registered: true });
  } catch (err) {
    console.error('[webhook] error', err);
    // Devolvemos 200 para evitar reintentos infinitos ante errores no recuperables,
    // salvo que prefieras 500 para que MP reintente. 200 + log es lo más estable.
    return res.status(200).json({ received: true, error: true });
  }
}

/** Valida la firma x-signature de Mercado Pago si hay secreto configurado. */
function isValidSignature(req: VercelRequest, dataId: string): boolean {
  const secret = optionalEnv('MP_WEBHOOK_SECRET');
  if (!secret) return true; // sin secreto configurado, no se exige firma

  const signature = req.headers['x-signature'] as string | undefined;
  const requestId = req.headers['x-request-id'] as string | undefined;
  if (!signature) return false;

  const parts = Object.fromEntries(
    signature.split(',').map((kv) => kv.split('=').map((s) => s.trim()))
  );
  const ts = parts['ts'];
  const v1 = parts['v1'];
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId || ''};ts:${ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  try {
    const a = new Uint8Array(Buffer.from(expected));
    const b = new Uint8Array(Buffer.from(v1));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
