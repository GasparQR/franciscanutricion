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
  price: 8900,                           // en ARS, sin decimales
  original_price: 12000,                 // opcional: muestra precio tachado y "Ahorrás $X"
  featured: true,                        // opcional: destaca la tarjeta con el badge "Más elegido"
  free: true,                            // opcional: badge "Gratis"
  pdf_url: '/assets/ebooks/xxx.pdf',     // opcional: descarga directa en vez de WhatsApp
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

Vercel: sitio estático, sin build (`vercel.json`). La única parte dinámica es
`api/meta-event.js`, que necesita las variables de entorno descritas más abajo.

## Medición para Meta Ads

El sitio está instrumentado con el **Píxel de Meta** y la **API de Conversiones**
(CAPI), deduplicados por `event_id`. La CAPI importa acá porque entre el 15 % y
el 25 % del tráfico bloquea `connect.facebook.net`: al enviarse desde nuestro
propio dominio, esos eventos llegan igual.

### Archivos

```
assets/meta-pixel.js    Píxel + atribución (utm/fbclid) + envío a la CAPI. Va en el <head>.
assets/track-events.js  Engancha los eventos a los CTAs. Va con defer al final del <body>.
api/meta-event.js       Función de Vercel que reenvía el evento a la CAPI.
```

### Eventos que se miden

| Evento | Se dispara cuando |
|---|---|
| `PageView` | carga cualquier página |
| `ViewContent` | se ve el catálogo, y otra vez por cada ebook visible 1 segundo |
| `InitiateCheckout` | clic en «Confirmar compra» (incluye `value` y `currency: ARS`) |
| `Lead` | clic en «Descargar gratis» |
| `Contact` | clic en cualquier botón de WhatsApp (turno, consulta, footer) |
| `CopyAlias` | clic en «Copiar» el alias bancario — señal de compra inminente |
| `ClickEbooks` | clic en «Ver ebooks» / «Descubrir ebooks» desde la home |

Para agregar un evento a un botón nuevo, alcanza con los atributos que lee
`track-events.js`: `data-fn-event`, `data-fn-name`, `data-fn-id`,
`data-fn-value` y `data-fn-custom` (para eventos personalizados). Los links a
`wa.me` sin atributos se miden automáticamente como `Contact`.

Todo evento nuevo tiene que agregarse también a `ALLOWED_EVENTS` en
`api/meta-event.js`, o la CAPI lo rechaza con `400`.

### Configuración

1. En `assets/meta-pixel.js`, reemplazar `REEMPLAZAR_PIXEL_ID` por el ID real
   del píxel. Lo mismo en el `<noscript>` de `index.html`, `tienda.html`,
   `privacidad.html` y `terminos.html`.
2. En `index.html`, reemplazar `REEMPLAZAR_TOKEN_VERIFICACION` por el token de
   verificación de dominio de Meta (o verificar por registro TXT en el DNS y
   borrar esa línea).
3. Cargar en Vercel (Settings → Environment Variables):

| Variable | Production | Preview | Qué es |
|---|---|---|---|
| `META_PIXEL_ID` | ✅ | ✅ | ID del píxel. Es público. |
| `META_CAPI_TOKEN` | ✅ | ✅ | **Secreto.** Nunca commitearlo. |
| `META_ALLOWED_HOSTS` | ✅ | ✅ | `franciscanutricion.com,vercel.app` |
| `META_TEST_EVENT_CODE` | ❌ | ✅ | Solo para probar. Con este código los eventos **no** cuentan para optimización. |

Mientras el Pixel ID sea el placeholder, el píxel no carga y no se envía nada:
el sitio funciona igual. La referencia de origen en los mensajes de WhatsApp sí
funciona desde el primer momento.

### Atribución de los mensajes de WhatsApp

La venta se cierra por WhatsApp, fuera del sitio, así que `Purchase` no se puede
medir automáticamente. Para saber de dónde vino cada mensaje, todos los links de
`wa.me` llevan una referencia al final del texto:

```
Hola! Te mando el comprobante de pago por el Ebook "Planner Semanal" ($26.000).

— ref: web·meta·ebooks-oct·planner-semanal·a1b2c3
```

Es: canal · origen · campaña · producto · identificador anónimo. Ese
identificador es el mismo `external_id` que viajó a Meta.

URL de destino del anuncio, con los parámetros dinámicos de Meta:

```
https://franciscanutricion.com/tienda.html?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

### Nota sobre `/api`

`api/meta-event.js` es **CommonJS** (`require` / `module.exports`). El
`package.json` de la raíz existe solo para fijar eso: **no agregarle
`"type": "module"`** o la función deja de funcionar.

### Probar localmente

```
npx vercel dev          # sitio + /api
python3 -m http.server  # solo el front, sin /api
```
