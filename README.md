# franciscanutricion

Landing de Francisca Nutrición (`index.html`, sitio estático) + **módulo de venta y entrega automática de iBooks**.

El módulo de iBooks NO modifica la landing: son páginas estáticas nuevas que
reutilizan el sistema de diseño de la landing y un conjunto de funciones
serverless (Vercel) que orquestan Mercado Pago, Supabase y Resend.

## Flujo

Usuario → `/tienda.html` → clic en **Comprar** → `POST /api/checkout` →
Mercado Pago Checkout Pro → pago aprobado → `POST /api/webhook` (registra la
venta + envía email) → vuelve a `/gracias.html` (descarga inmediata) y recibe
el email con el enlace de descarga.

## Estructura

```
index.html            Landing actual (NO se toca)
tienda.html           Catálogo de los 3 iBooks
gracias.html          Confirmación + descarga inmediata del PDF
admin.html            Panel de solo consulta (protegido por token)
assets/store.css      Estilos (copia fiel del sistema de diseño de la landing)
assets/store.js       Render del catálogo + flujo de compra
api/products.ts       GET catálogo activo (sin exponer pdf_url)
api/checkout.ts       POST crea preferencia de Mercado Pago
api/webhook.ts        POST notificaciones MP: valida, registra (idempotente), email
api/order.ts          GET estado de la compra (para la página de gracias)
api/download.ts       GET descarga segura por token (URL firmada del bucket privado)
api/admin.ts          GET métricas y compras (Bearer ADMIN_TOKEN)
lib/                  Clientes compartidos (Supabase, Mercado Pago, Resend, env)
supabase/schema.sql   Tablas products y orders + catálogo de ejemplo
```

## Puesta en marcha

### 1. Supabase
1. Ejecutar `supabase/schema.sql` en el SQL Editor (crea `products` y `orders`).
2. Crear un **bucket privado** (ej. `ibooks`) en Storage y subir los PDF.
3. En cada producto, `pdf_url` debe ser el nombre del archivo dentro del bucket
   (ej. `guia-meal-prep.pdf`). También se admite una URL `https://…` completa.
4. Editar los productos de ejemplo con tus títulos, precios y portadas reales.

### 2. Mercado Pago
1. Obtener el **Access Token** de producción (Checkout Pro).
2. (Recomendado) Configurar el webhook hacia `https://TU-DOMINIO/api/webhook` y
   copiar la **clave secreta** en `MP_WEBHOOK_SECRET` para validar la firma.

### 3. Resend
1. Verificar el dominio remitente y crear una API key.
2. Definir `RESEND_FROM` con un remitente verificado.

### 4. Variables de entorno (Vercel → Settings → Environment Variables)
Ver `.env.example`. Resumen:

| Variable | Descripción |
|---|---|
| `SITE_URL` | URL pública del sitio (sin barra final) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Acceso servidor a Supabase |
| `SUPABASE_PDF_BUCKET` | Bucket privado de los PDF |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago |
| `MP_WEBHOOK_SECRET` | Secreto para validar el webhook (opcional) |
| `RESEND_API_KEY` / `RESEND_FROM` | Envío de emails |
| `ADMIN_TOKEN` | Token de acceso al panel `/admin.html` |

### 5. Deploy
Vercel detecta automáticamente las funciones de `/api`. Hacer deploy normal.

## Notas de robustez

- **Idempotencia:** `orders.payment_id` es único; un webrenotificado no duplica
  la venta ni reenvía el email.
- **Verificación real del pago:** el webhook consulta el pago en la API de MP y
  solo procesa los `approved` (no confía en el body recibido).
- **Descarga segura:** cada orden tiene un `download_token` aleatorio; el PDF se
  entrega con URL firmada temporal del bucket privado.
- **Seguridad de datos:** todo el acceso a Supabase es server-side con
  `service_role`; RLS está activado sin políticas públicas.

## Desarrollo

```bash
npm install
npm run typecheck   # valida las funciones TypeScript
```
