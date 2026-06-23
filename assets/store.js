// store.js · Catálogo de iBooks y flujo de compra (Mercado Pago Checkout Pro)

const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function bookIcon() {
  return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`;
}

function cardHtml(p) {
  const cover = p.cover_image
    ? `<img class="book-cover" src="${p.cover_image}" alt="Portada de ${escapeHtml(p.title)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;book-cover placeholder&quot;>${bookIcon()}</div>'">`
    : `<div class="book-cover placeholder">${bookIcon()}</div>`;

  return `
    <article class="card">
      ${cover}
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description)}</p>
      <div class="price">${ARS.format(p.price)}</div>
      <button class="btn btn-primary buy-btn" data-id="${p.id}">
        Comprar
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
    </article>`;
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

async function loadCatalog() {
  const grid = document.getElementById('catalog');
  const status = document.getElementById('catalog-status');
  if (!grid) return;

  try {
    const res = await fetch('/api/products');
    if (!res.ok) throw new Error('No se pudo cargar el catálogo');
    const { products } = await res.json();

    if (!products || products.length === 0) {
      status.innerHTML = '<div class="notice">Pronto vas a encontrar nuevos iBooks acá. ✨</div>';
      return;
    }

    status.innerHTML = '';
    grid.innerHTML = products.map(cardHtml).join('');
    grid.querySelectorAll('.buy-btn').forEach((btn) => {
      btn.addEventListener('click', () => buy(btn));
    });
  } catch (err) {
    console.error(err);
    status.innerHTML = '<div class="notice error">No pudimos cargar los iBooks. Recargá la página o intentá más tarde.</div>';
  }
}

async function buy(btn) {
  const productId = btn.dataset.id;
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Redirigiendo…';

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId }),
    });
    const data = await res.json();
    if (!res.ok || !data.init_point) {
      throw new Error(data.error || 'No se pudo iniciar el pago');
    }
    window.location.href = data.init_point;
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.innerHTML = original;
    alert('No pudimos iniciar el pago. Por favor intentá nuevamente.');
  }
}

document.addEventListener('DOMContentLoaded', loadCatalog);
