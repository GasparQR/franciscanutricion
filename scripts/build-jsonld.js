// build-jsonld.js · Genera los datos estructurados (JSON-LD) a partir de PRODUCTS.
//
// Por qué existe: el catálogo se renderiza con JavaScript, así que un rastreador
// que no ejecuta JS —el de Meta, entre otros— ve un <div id="catalog"> vacío y
// no encuentra ni productos ni precios. El JSON-LD le da esos datos en el HTML.
//
// Correr después de tocar assets/products.js:
//
//   npm run jsonld
//
// Reescribe el bloque entre los marcadores jsonld:auto de cada página.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://www.franciscanutricion.com';

const OPEN = '<!-- jsonld:auto -->';
const CLOSE = '<!-- /jsonld:auto -->';

function loadProducts() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/products.js'), 'utf8');
  return new Function(src + '\nreturn PRODUCTS;')();
}

function offer(p) {
  return {
    '@type': 'Offer',
    price: String(p.price),
    priceCurrency: 'ARS',
    availability: 'https://schema.org/InStock',
    url: `${BASE}/tienda.html`,
    seller: { '@id': `${BASE}/#negocio` },
  };
}

function product(p) {
  const out = {
    '@type': 'Product',
    '@id': `${BASE}/tienda.html#${p.id}`,
    name: p.title,
    description: p.subtitle ? `${p.subtitle}. ${p.description}` : p.description,
    category: 'Ebook de nutrición',
    brand: { '@type': 'Brand', name: 'Francisca Nutrición' },
    offers: offer(p),
  };
  if (p.cover_image) out.image = BASE + p.cover_image;
  return out;
}

function negocio() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${BASE}/#negocio`,
    name: 'Francisca Nutrición',
    description:
      'Consultas nutricionales y ebooks descargables para organizar la alimentación diaria, sin dietas extremas.',
    url: `${BASE}/`,
    image: `${BASE}/assets/img/og-home.jpg`,
    logo: `${BASE}/assets/img/logo-mark.png`,
    telephone: '+5492995129235',
    email: 'franfernandez325@gmail.com',
    priceRange: '$$',
    areaServed: { '@type': 'Country', name: 'Argentina' },
    availableLanguage: 'es',
    sameAs: [
      'https://www.instagram.com/_franciscanutricion',
      'https://tiktok.com/@_franciscanutricion',
      'https://maps.app.goo.gl/YYCVfWqLnMUPvNqJ7',
    ],
    founder: {
      '@type': 'Person',
      name: 'Francisca Fernandez',
      jobTitle: 'Licenciada en Nutrición',
      identifier: 'MP 5295',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Ebooks',
      url: `${BASE}/tienda.html`,
      itemListElement: loadProducts().map(function (p, i) {
        return {
          '@type': 'Offer',
          position: i + 1,
          itemOffered: { '@type': 'Product', name: p.title, url: `${BASE}/tienda.html#${p.id}` },
          price: String(p.price),
          priceCurrency: 'ARS',
        };
      }),
    },
  };
}

function catalogo() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ebooks de Francisca Nutrición',
    url: `${BASE}/tienda.html`,
    numberOfItems: loadProducts().length,
    itemListElement: loadProducts().map(function (p, i) {
      return { '@type': 'ListItem', position: i + 1, item: product(p) };
    }),
  };
}

function write(file, data) {
  const target = path.join(ROOT, file);
  const html = fs.readFileSync(target, 'utf8');

  const start = html.indexOf(OPEN);
  const end = html.indexOf(CLOSE);
  if (start === -1 || end === -1) {
    throw new Error(`${file}: faltan los marcadores ${OPEN} / ${CLOSE}`);
  }

  const block =
    OPEN +
    '\n<script type="application/ld+json">\n' +
    JSON.stringify(data, null, 2) +
    '\n</script>\n';

  fs.writeFileSync(target, html.slice(0, start) + block + html.slice(end), 'utf8');
  console.log(`✓ ${file}`);
}

write('index.html', negocio());
write('tienda.html', catalogo());
