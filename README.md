# franciscanutricion

Landing de Francisca Nutrición (`index.html`, sitio estático) + **catálogo de
Ebooks con compra manual** (`tienda.html`).

Sitio 100% estático, sin backend, sin base de datos y sin dependencias de Node.

## Flujo

Usuario → `/tienda.html` → ve el catálogo y el alias bancario para transferir →
transfiere por alias → clic en **Confirmar compra** → se abre WhatsApp con un
mensaje prellenado (título e importe del Ebook) → la persona manda el
comprobante de pago por ese chat → el admin verifica el pago y entrega el
Ebook manualmente por WhatsApp (o el medio que prefiera).

No hay pago online, ni email automático, ni descarga automática: todo el
proceso después de tocar "Confirmar compra" se resuelve a mano por WhatsApp.

## Estructura

```
index.html            Landing (con un CTA "Descubrir ebooks" que lleva a /tienda.html)
tienda.html            Catálogo de Ebooks
assets/store.css       Estilos (mismo sistema de diseño que la landing)
assets/products.js     Lista de Ebooks: título, descripción, precio, portada
assets/store.js        Render del catálogo + botón "Confirmar compra" (WhatsApp)
```

## Editar el catálogo

Abrí `assets/products.js` y modificá el array `PRODUCTS`. Cada Ebook es:

```js
{
  id: 'slug-unico',
  title: 'Título del Ebook',
  description: 'Descripción corta.',
  price: 8900,                          // en ARS, sin decimales
  cover_image: '/assets/covers/xxx.jpg', // opcional: si falta o no carga, se muestra un ícono
}
```

Agregar, editar o dar de baja un Ebook es editar este archivo y volver a
hacer deploy. No requiere base de datos ni backend.

## Editar el alias bancario

En `tienda.html`, buscar el comentario `<!-- EDITAR: alias real -->` y
reemplazar `ALIAS.EJEMPLO` (y el titular) por los datos reales de la cuenta.

## Editar el número de WhatsApp

En `assets/store.js`, la constante `WHATSAPP_NUMBER` (formato internacional,
sin `+` ni espacios, ej. `5492995129235`).

## Deploy

Vercel: sitio estático, sin build (`vercel.json`). No hace falta `npm install`
ni variables de entorno.
