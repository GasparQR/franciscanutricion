// store.js · Catálogo de iBooks y confirmación de compra por WhatsApp

const WHATSAPP_NUMBER = '5492995129235';

const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function bookIcon() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`;
}

function whatsappLink(p) {
  const message = `Hola! Te mando el comprobante de pago por el iBook "${p.title}" (${ARS.format(p.price)}).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function cardHtml(p) {
  const cover = p.cover_image
    ? `<img class="book-cover" src="${p.cover_image}" alt="Portada de ${escapeHtml(p.title)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;book-cover placeholder&quot;>${bookIcon()}</div>'">`
    : `<div class="book-cover placeholder">${bookIcon()}</div>`;

  const subtitle = p.subtitle
    ? `<p class="muted" style="margin:-.3rem 0 .6rem;font-size:.92rem">${escapeHtml(p.subtitle)}</p>`
    : '';

  return `
    <article class="card">
      ${cover}
      <h3>${escapeHtml(p.title)}</h3>
      ${subtitle}
      <p>${escapeHtml(p.description)}</p>
      <div class="price">${ARS.format(p.price)}</div>
      <a class="btn btn-primary buy-btn" href="${whatsappLink(p)}" target="_blank" rel="noopener">
        Confirmar compra
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </article>`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function loadCatalog() {
  const grid = document.getElementById('catalog');
  const status = document.getElementById('catalog-status');
  if (!grid) return;

  if (!PRODUCTS || PRODUCTS.length === 0) {
    status.innerHTML = '<div class="notice">Pronto vas a encontrar nuevos iBooks acá. ✨</div>';
    return;
  }

  status.innerHTML = '';
  grid.innerHTML = PRODUCTS.map(cardHtml).join('');
}

document.addEventListener('DOMContentLoaded', loadCatalog);
