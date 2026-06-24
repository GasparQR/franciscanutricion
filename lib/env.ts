// Lectura centralizada y validación de variables de entorno del servidor.

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

/** URL pública del sitio, sin barra final. */
export function siteUrl(): string {
  const fromEnv = process.env.SITE_URL;
  // Vercel expone VERCEL_URL (sin protocolo) en cada deploy.
  const fallback = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
  return (fromEnv || fallback).replace(/\/+$/, '');
}
