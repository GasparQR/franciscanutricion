// store.js · Catálogo de Ebooks y confirmación de compra por WhatsApp

const WHATSAPP_NUMBER = '5492995129235';

const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function bookIcon() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`;
}

function showPlaceholderCover(imgEl) {
  const div = document.createElement('div');
  div.className = 'book-cover placeholder';
  div.innerHTML = bookIcon();
  imgEl.replaceWith(div);
}

function whatsappLink(p) {
  const message = p.free
    ? `Hola! Quiero mi ebook gratis "${p.title}".`
    : `Hola! Te mando el comprobante de pago por el Ebook "${p.title}" (${ARS.format(p.price)}).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function cardHtml(p) {
  const cover = p.cover_image
    ? `<img class="book-cover" src="${p.cover_image}" alt="Portada de ${escapeHtml(p.title)}" loading="lazy" onerror="showPlaceholderCover(this)">`
    : `<div class="book-cover placeholder">${bookIcon()}</div>`;

  const subtitle = p.subtitle
    ? `<p class="muted" style="margin:-.3rem 0 .6rem;font-size:.92rem">${escapeHtml(p.subtitle)}</p>`
    : '';

  const priceBlock = p.free
    ? `<div class="price-block"><span class="free-badge">✨ Gratis</span></div>`
    : p.original_price
    ? `<div class="price-block">
        <span class="launch-badge">🚀 Precio de lanzamiento</span>
        <div class="price-row">
          <span class="price-old">${ARS.format(p.original_price)}</span>
          <span class="price">${ARS.format(p.price)}</span>
        </div>
      </div>`
    : `<div class="price">${ARS.format(p.price)}</div>`;

  const buyLabel = p.free ? 'Quiero mi ebook gratis' : 'Confirmar compra';

  return `
    <article class="card">
      ${cover}
      <h3>${escapeHtml(p.title)}</h3>
      ${subtitle}
      <p>${escapeHtml(p.description)}</p>
      ${priceBlock}
      <a class="btn btn-primary buy-btn" href="${whatsappLink(p)}" target="_blank" rel="noopener">
        ${buyLabel}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
    </article>`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function setupCarousel() {
  const track = document.getElementById('catalog');
  const prev = document.getElementById('catalogPrev');
  const next = document.getElementById('catalogNext');
  if (!track || !prev || !next) return;

  const step = () => {
    const card = track.querySelector('.card');
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card ? card.getBoundingClientRect().width + gap : 0;
  };
  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    prev.disabled = track.scrollLeft <= 0;
    next.disabled = track.scrollLeft >= max;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();
}

function loadCatalog() {
  const grid = document.getElementById('catalog');
  const status = document.getElementById('catalog-status');
  if (!grid) return;

  if (!PRODUCTS || PRODUCTS.length === 0) {
    status.innerHTML = '<div class="notice">Pronto vas a encontrar nuevos Ebooks acá. ✨</div>';
    return;
  }

  status.innerHTML = '';
  grid.innerHTML = PRODUCTS.map(cardHtml).join('');
  setupCarousel();
}

function setupAliasCopy() {
  const btn = document.getElementById('copyAliasBtn');
  const aliasEl = document.getElementById('aliasValue');
  if (!btn || !aliasEl) return;

  btn.addEventListener('click', async () => {
    const alias = aliasEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(alias);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = alias;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    const original = btn.textContent;
    btn.textContent = '✓ Copiado';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  setupAliasCopy();
});
