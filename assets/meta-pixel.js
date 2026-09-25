// meta-pixel.js · Meta Pixel + capa compartida de tracking
//
// Va en el <head> de TODAS las páginas, SIN defer (antes que cualquier otro script).
//
// El PIXEL_ID es público por diseño (viaja en el HTML). El secreto es el token
// de la Conversions API, que vive solo en el servidor. Si el pixel cambia, hay
// que actualizarlo acá, en el <noscript> de las 4 páginas y en la variable de
// entorno META_PIXEL_ID de Vercel.
//
// El guard de abajo es una red de seguridad: si alguien deja el placeholder,
// el pixel no carga en vez de mandar eventos a un ID inexistente.

(function (w, d) {
  var PIXEL_ID = '1071270859131219';
  var CAPI_URL = '/api/meta-event';
  var ATTR_KEY = 'fn_attr';
  var UID_KEY = 'fn_uid';

  var enabled = PIXEL_ID.indexOf('REEMPLAZAR') === -1;

  /* ---------- 1. Atribución: persistir utm_* y fbclid durante la sesión ---------- */

  var ATTR = {};
  try { ATTR = JSON.parse(sessionStorage.getItem(ATTR_KEY) || '{}'); } catch (e) {}

  (function captureAttribution() {
    try {
      var qs = new URLSearchParams(w.location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid']
        .forEach(function (k) {
          var v = qs.get(k);
          if (v) ATTR[k] = v.slice(0, 120);
        });
      if (!ATTR.landing) ATTR.landing = w.location.pathname;
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(ATTR));
    } catch (e) {
      /* sessionStorage puede fallar en modo privado: no es crítico */
    }
  })();

  /* ---------- 2. Identificador anónimo estable (external_id) ---------- */

  var UID;
  try { UID = localStorage.getItem(UID_KEY); } catch (e) {}
  if (!UID) {
    UID = (w.crypto && w.crypto.randomUUID
      ? w.crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).slice(2)
    ).replace(/-/g, '');
    try { localStorage.setItem(UID_KEY, UID); } catch (e) {}
  }

  function cookie(name) {
    var m = d.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }

  // Si Meta mandó fbclid y todavía no existe la cookie _fbc, la reconstruimos.
  function fbc() {
    var c = cookie('_fbc');
    if (c) return c;
    return ATTR.fbclid ? 'fb.1.' + Date.now() + '.' + ATTR.fbclid : '';
  }

  function newEventId(name) {
    return name + '.' + UID.slice(0, 8) + '.' + Date.now().toString(36) + '.' +
      Math.random().toString(36).slice(2, 7);
  }

  /* ---------- 3. Base code de Meta ---------- */

  if (enabled) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (w,d,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    w.fbq('init', PIXEL_ID);
  }

  /* ---------- 4. track(): pixel + CAPI con el MISMO event_id (deduplicación) ---------- */

  function track(name, params, opts) {
    if (!enabled) return null;
    params = params || {};
    opts = opts || {};

    var eventId = opts.eventId || newEventId(name);

    try {
      w.fbq(opts.custom ? 'trackCustom' : 'track', name, params, { eventID: eventId });
    } catch (e) {
      /* el pixel puede estar bloqueado: la CAPI es la red de seguridad */
    }

    var send = function () {
      var payload = JSON.stringify({
        event_name: name,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: w.location.href,
        custom_data: params,
        user_data: { fbp: cookie('_fbp'), fbc: fbc(), external_id: UID },
        attribution: ATTR,
      });

      // keepalive: el envío sobrevive a la navegación cuando el usuario salta a
      // WhatsApp. Nunca hacemos preventDefault(): la navegación no se bloquea.
      try {
        if (w.fetch) {
          w.fetch(CAPI_URL, {
            method: 'POST',
            keepalive: true,
            mode: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          })['catch'](function () {});
        } else if (navigator.sendBeacon) {
          navigator.sendBeacon(CAPI_URL, new Blob([payload], { type: 'application/json' }));
        }
      } catch (e) {}
    };

    // fbevents.js escribe la cookie _fbp de forma asíncrona. Si mandamos el
    // PageView a la CAPI en el mismo tick va sin fbp y baja la calidad de
    // coincidencia; por eso solo ese evento espera.
    if (opts.capiDelay) setTimeout(send, opts.capiDelay);
    else send();

    return eventId;
  }

  /* ---------- 5. API pública ---------- */

  w.FN = {
    track: track,
    attr: ATTR,
    uid: UID,
    enabled: enabled,

    // Referencia legible que se inyecta en el texto de los links de wa.me,
    // para que Fran vea en el chat de dónde vino cada mensaje.
    ref: function (extra) {
      return [
        'web',
        ATTR.utm_source || (ATTR.fbclid ? 'meta' : 'directo'),
        ATTR.utm_campaign || '',
        extra || '',
        UID.slice(0, 6),
      ].filter(Boolean).join('·');
    },
  };

  /* ---------- 6. PageView ---------- */

  track('PageView', {}, { capiDelay: 800 });
})(window, document);
