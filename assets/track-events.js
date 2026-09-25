// track-events.js · Engancha los eventos de Meta a los CTAs del sitio.
//
// Va con defer al final del <body>. Depende de window.FN (assets/meta-pixel.js).
//
// Cómo funciona:
//  - Un único listener delegado en document (fase de captura) cubre tanto los
//    CTAs estáticos del HTML como las tarjetas que store.js genera con innerHTML.
//  - Todos los links de wa.me se decoran con la referencia de origen, así Fran
//    ve en el chat si el mensaje vino del anuncio, de Instagram o directo.
//  - Nunca se llama preventDefault(): la navegación a WhatsApp no se bloquea.

(function () {
  if (!window.FN) return;

  /* ---------- Referencia de origen en los links de WhatsApp ---------- */

  function decorateWhatsApp(root) {
    var links = (root || document).querySelectorAll('a[href*="wa.me/"]:not([data-fn-ref])');
    Array.prototype.forEach.call(links, function (a) {
      var u;
      try { u = new URL(a.href, location.href); } catch (e) { return; }

      var ref = window.FN.ref(a.getAttribute('data-fn-id') || '');
      u.searchParams.set('text', (u.searchParams.get('text') || '') + '\n\n— ref: ' + ref);
      a.href = u.toString();
      a.setAttribute('data-fn-ref', ref);
    });
  }

  /* ---------- Listener delegado ---------- */

  document.addEventListener('click', function (ev) {
    var t = ev.target;
    if (!t || !t.closest) return;

    var el = t.closest('[data-fn-event], a[href*="wa.me/"]');
    if (!el) return;

    // Sin data-fn-event explícito, cualquier link a WhatsApp es un Contact.
    var name = el.getAttribute('data-fn-event') || 'Contact';

    var params = {
      content_name: el.getAttribute('data-fn-name') || el.textContent.trim().slice(0, 60),
    };

    var id = el.getAttribute('data-fn-id');
    if (id) {
      params.content_ids = [id];
      params.content_type = 'product';
    }

    var value = el.getAttribute('data-fn-value');
    if (value) {
      params.value = Number(value);
      params.currency = 'ARS';
      params.num_items = 1;
    }

    var ref = el.getAttribute('data-fn-ref');
    if (ref) params.ref = ref;

    window.FN.track(name, params, { custom: el.hasAttribute('data-fn-custom') });
  }, true);

  /* ---------- ViewContent del catálogo (solo en tienda.html) ---------- */

  function whenCatalogReady(cb) {
    var grid = document.getElementById('catalog');
    if (!grid) return;
    if (grid.querySelector('.card')) return cb(grid);

    // store.js renderiza con innerHTML dentro de su propio DOMContentLoaded:
    // observamos el nodo en vez de depender del orden de los listeners.
    var mo = new MutationObserver(function () {
      if (grid.querySelector('.card')) {
        mo.disconnect();
        cb(grid);
      }
    });
    mo.observe(grid, { childList: true });
  }

  function catalogEvents(grid) {
    decorateWhatsApp(grid);

    if (!window.PRODUCTS) return;

    // Vista del catálogo completo.
    window.FN.track('ViewContent', {
      content_type: 'product_group',
      content_ids: window.PRODUCTS.map(function (p) { return p.id; }),
      content_category: 'ebooks',
      currency: 'ARS',
    });

    if (!('IntersectionObserver' in window)) return;

    // Vista por producto: la tarjeta tiene que estar visible al menos 1 segundo.
    var seen = {};
    var timers = {};

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var id = e.target.getAttribute('data-product-id');
        if (!id || seen[id]) return;

        if (!e.isIntersecting) {
          clearTimeout(timers[id]);
          return;
        }

        timers[id] = setTimeout(function () {
          if (seen[id]) return;
          seen[id] = true;

          var p = window.PRODUCTS.filter(function (x) { return x.id === id; })[0] || {};
          window.FN.track('ViewContent', {
            content_type: 'product',
            content_ids: [id],
            content_name: p.title,
            value: p.price || 0,
            currency: 'ARS',
          });
        }, 1000);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(
      grid.querySelectorAll('.card[data-product-id]'),
      function (card) { io.observe(card); }
    );
  }

  /* ---------- Arranque ---------- */

  function init() {
    decorateWhatsApp();
    whenCatalogReady(catalogEvents);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
