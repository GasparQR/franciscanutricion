// api/meta-event.js · Relay de la Conversions API de Meta.
//
// CommonJS a propósito: el repo NO tiene package.json, así que el runtime Node
// de Vercel interpreta los .js como CommonJS. Con `export default` fallaría.
// No hay dependencias: node:crypto y fetch son nativos.
//
// Variables de entorno (Vercel → Settings → Environment Variables):
//   META_PIXEL_ID         ID del pixel (público, el mismo que en meta-pixel.js)
//   META_CAPI_TOKEN       token de la Conversions API — SECRETO, nunca en el repo
//   META_TEST_EVENT_CODE  solo en Preview, mientras se prueba. Borrar en Production:
//                         con este código los eventos no cuentan para optimización.
//   META_ALLOWED_HOSTS    lista separada por comas, ej: franciscanutricion.com,vercel.app

const crypto = require('node:crypto');

const GRAPH_VERSION = 'v21.0';

// Lista blanca: sin esto cualquiera podría inyectar eventos arbitrarios al pixel.
const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'InitiateCheckout',
  'Lead',
  'Contact',
  'CopyAlias',
  'ClickEbooks',
]);

const sha256 = (v) =>
  crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const PIXEL_ID = process.env.META_PIXEL_ID;
  const TOKEN = process.env.META_CAPI_TOKEN;

  // Sin credenciales no hacemos nada, pero nunca rompemos el front.
  if (!PIXEL_ID || !TOKEN) {
    res.status(204).end();
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = null; }
  }

  if (!body || !ALLOWED_EVENTS.has(body.event_name)) {
    res.status(400).json({ error: 'bad_event' });
    return;
  }

  // Anti-abuso: solo aceptamos pedidos desde nuestros propios dominios.
  const allowed = (process.env.META_ALLOWED_HOSTS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const origin = req.headers.origin || '';
  if (allowed.length && origin && !allowed.some((h) => origin.endsWith(h))) {
    res.status(403).json({ error: 'forbidden_origin' });
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || '';
  const ud = body.user_data || {};

  // Regla de Meta: fbp, fbc, IP y user agent NO se hashean; external_id sí.
  const user_data = {
    client_ip_address: ip,
    client_user_agent: ua,
    ...(ud.fbp ? { fbp: ud.fbp } : {}),
    ...(ud.fbc ? { fbc: ud.fbc } : {}),
    ...(ud.external_id ? { external_id: [sha256(ud.external_id)] } : {}),
  };

  const event = {
    event_name: body.event_name,
    event_time: Math.min(Number(body.event_time) || now, now),
    event_id: String(body.event_id || '').slice(0, 120),
    event_source_url: String(body.event_source_url || '').slice(0, 500),
    action_source: 'website',
    user_data,
    custom_data: body.custom_data || {},
  };

  const payload = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events` +
      `?access_token=${encodeURIComponent(TOKEN)}`;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!r.ok) console.error('[capi]', r.status, await r.text());
    res.status(200).json({ ok: r.ok });
  } catch (e) {
    console.error('[capi] fetch_fail', e);
    res.status(200).json({ ok: false }); // el front ignora la respuesta
  }
};
