-- ============================================================
--  Módulo de venta de iBooks · Francisca Nutrición
--  Esquema de base de datos (Supabase / PostgreSQL)
--  Ejecutar una sola vez en el SQL Editor de Supabase.
-- ============================================================

-- Extensión para gen_random_uuid()
create extension if not exists pgcrypto;

-- ─────────────────────────── PRODUCTS ───────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  title       text        not null,
  description text        not null default '',
  price       numeric(10,2) not null check (price >= 0),
  cover_image text,                       -- URL pública de la portada
  pdf_url     text        not null,       -- ruta del PDF dentro del bucket privado (ej: "guia-meal-prep.pdf")
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ──────────────────────────── ORDERS ────────────────────────────
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id),
  buyer_name     text,
  buyer_email    text not null,
  payment_id     text not null,
  payment_status text not null,
  amount         numeric(10,2) not null,
  -- token aleatorio para descargas seguras (no se expone el payment_id)
  download_token uuid not null default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  -- Prevención de registros duplicados: un payment_id => una sola orden
  constraint orders_payment_id_unique unique (payment_id)
);

create index if not exists orders_download_token_idx on public.orders(download_token);
create index if not exists orders_created_at_idx     on public.orders(created_at desc);

-- ─────────────────────────── SEGURIDAD ──────────────────────────
-- El acceso se hace siempre desde las funciones serverless usando la
-- clave service_role, que ignora RLS. Activamos RLS y NO creamos
-- políticas públicas para que el cliente anónimo no pueda leer/escribir.
alter table public.products enable row level security;
alter table public.orders   enable row level security;

-- ─────────────────────── CATÁLOGO DE EJEMPLO ────────────────────
-- Reemplazar precios, textos, portadas y nombres de PDF reales.
insert into public.products (title, description, price, cover_image, pdf_url, active) values
  ('Guía de Meal Prep',         'Organizá tus comidas de la semana en una sola tarde, con listas de compras y recetas base.', 8900.00, '/assets/covers/meal-prep.jpg',   'guia-meal-prep.pdf',   true),
  ('Recetas Reales',            '50 recetas simples, ricas y nutritivas para el día a día, sin ingredientes raros.',          6900.00, '/assets/covers/recetas.jpg',     'recetas-reales.pdf',   true),
  ('Hábitos que Transforman',   'Una guía práctica para construir hábitos saludables sostenibles y mejorar tu relación con la comida.', 7900.00, '/assets/covers/habitos.jpg',     'habitos.pdf',          true)
on conflict do nothing;
