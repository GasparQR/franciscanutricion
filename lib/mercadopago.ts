import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { requireEnv } from './env';

let config: MercadoPagoConfig | null = null;

function mpConfig(): MercadoPagoConfig {
  if (!config) {
    config = new MercadoPagoConfig({
      accessToken: requireEnv('MP_ACCESS_TOKEN'),
      options: { timeout: 8000 },
    });
  }
  return config;
}

export function preferenceClient(): Preference {
  return new Preference(mpConfig());
}

export function paymentClient(): Payment {
  return new Payment(mpConfig());
}
