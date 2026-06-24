import { Resend } from 'resend';
import { requireEnv } from './env';

let resend: Resend | null = null;

function client(): Resend {
  if (!resend) {
    resend = new Resend(requireEnv('RESEND_API_KEY'));
  }
  return resend;
}

interface DeliveryEmailArgs {
  to: string;
  buyerName: string | null;
  productTitle: string;
  downloadUrl: string;
}

/**
 * Email automático de entrega del iBook.
 * Asunto fijo: "Tu iBook ya está disponible".
 * Estética alineada a la paleta de la landing (cream / sage / clay).
 */
export async function sendDeliveryEmail({ to, buyerName, productTitle, downloadUrl }: DeliveryEmailArgs) {
  const from = requireEnv('RESEND_FROM');
  const greeting = buyerName ? `¡Hola, ${buyerName}!` : '¡Hola!';

  const html = `
  <div style="background:#F7F2E9;padding:32px 16px;font-family:'Hanken Grotesk',Arial,Helvetica,sans-serif;color:#2C2A22;">
    <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#FBF8F1;border:1px solid rgba(86,100,69,.16);border-radius:26px;overflow:hidden;">
      <tr><td style="padding:36px 36px 8px;">
        <p style="margin:0;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#566445;font-weight:600;">❋ Francisca Nutrición</p>
        <h1 style="margin:18px 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:26px;color:#2C2A22;">${greeting}</h1>
        <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#6C6657;">
          ¡Gracias por tu compra! Tu iBook <strong style="color:#2C2A22;">${productTitle}</strong> ya está disponible para descargar.
        </p>
      </td></tr>
      <tr><td style="padding:8px 36px 8px;">
        <a href="${downloadUrl}" style="display:inline-block;background:#566445;color:#FBF8F1;text-decoration:none;font-weight:600;font-size:16px;padding:15px 30px;border-radius:999px;">
          Descargar mi iBook
        </a>
      </td></tr>
      <tr><td style="padding:18px 36px 36px;">
        <p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:#6C6657;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
          <a href="${downloadUrl}" style="color:#BE7A52;word-break:break-all;">${downloadUrl}</a>
        </p>
        <p style="margin:24px 0 0;font-size:13px;color:#6C6657;">Con cariño,<br>Francisca · Licenciada en Nutrición</p>
      </td></tr>
    </table>
    <p style="max-width:520px;margin:16px auto 0;text-align:center;font-size:12px;color:#9a9484;">
      © ${new Date().getFullYear()} Francisca Fernandez · Todos los derechos reservados.
    </p>
  </div>`;

  return client().emails.send({
    from,
    to,
    subject: 'Tu iBook ya está disponible',
    html,
  });
}
