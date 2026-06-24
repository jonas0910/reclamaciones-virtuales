import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a confirmation email to the consumer when a new claim is created.
 */
export async function sendClaimConfirmationEmail(email: string, claimCode: string, name: string) {
  if (!resend) {
    console.log(`[Mail Mock] Sending claim confirmation email to ${email} for claim ${claimCode}`);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Libro de Reclamaciones <noreply@reclamaciones.pe>",
      to: [email],
      subject: `Confirmación de Registro de Reclamación - Código ${claimCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981; margin-top: 0;">¡Reclamo Registrado con Éxito!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Tu hoja de reclamación virtual ha sido recibida y registrada en el sistema de manera oficial.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0; color: #1f2937; border: 1px solid #e5e7eb;">
            ${claimCode}
          </div>
          <p>La empresa cuenta con un plazo legal de quince (15) días hábiles improrrogables para responder oficialmente a tu reclamo o queja.</p>
          <p>Puedes consultar el estado de tu reclamo en cualquier momento utilizando nuestro portal de consulta con el código arriba indicado.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #6b7280; text-align: center;">
            Este es un correo automático. Por favor no respondas directamente a este mensaje.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending confirmation email via Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    return { success: false, error: err };
  }
}

/**
 * Sends a notification email to the consumer when their claim has been answered.
 */
export async function sendClaimAnswerNotification(email: string, claimCode: string, answer: string) {
  if (!resend) {
    console.log(`[Mail Mock] Sending response notification email to ${email} for claim ${claimCode}`);
    return { success: true, mocked: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Libro de Reclamaciones <noreply@reclamaciones.pe>",
      to: [email],
      subject: `Respuesta Oficial a tu Reclamación - Código ${claimCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6; margin-top: 0;">Respuesta Oficial Registrada</h2>
          <p>Se ha emitido y registrado la respuesta oficial a tu hoja de reclamación con código <strong>${claimCode}</strong>.</p>
          <div style="background-color: #f9fafb; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #1f2937;">
            <strong style="color: #374151;">Respuesta del Proveedor:</strong>
            <p style="margin-top: 8px; white-space: pre-wrap; font-style: italic; color: #4b5563;">"${answer}"</p>
          </div>
          <p>Si deseas imprimir la hoja de reclamación completa junto con la respuesta oficial del proveedor, puedes hacerlo a través de nuestro portal de consultas utilizando tu código.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #6b7280; text-align: center;">
            Este es un correo automático. Por favor no respondas directamente a este mensaje.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending answer notification email via Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send answer notification email:", err);
    return { success: false, error: err };
  }
}

/**
 * Sends a verification email to the company's alert email address.
 */
export async function sendAlertEmailVerification(
  email: string,
  token: string,
  companyName: string,
  establishmentName: string
) {
  if (!resend) {
    console.log(`[Mail Mock] Sending email verification to ${email} with token ${token}`);
    return { success: true, mocked: true };
  }

  // Get base URL for verification link
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Libro de Reclamaciones <noreply@reclamaciones.pe>",
      to: [email],
      subject: `Verificación de Email de Alertas - ${companyName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #3b82f6; margin-top: 0;">Verificación de Correo de Alertas</h2>
          <p>Se ha registrado esta dirección de correo electrónico para recibir alertas automáticas en tiempo real de nuevos reclamos registrados en el establecimiento <strong>${establishmentName}</strong> de la empresa <strong>${companyName}</strong>.</p>
          <p>Para activar estas notificaciones y empezar a recibir las alertas, por favor haz clic en el siguiente botón:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Verificar Correo de Alerta
            </a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
          <p style="font-size: 12px; color: #3b82f6; word-break: break-all;">${verifyUrl}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #6b7280; text-align: center;">
            Si tú no solicitaste este registro, puedes ignorar este correo de forma segura.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending verification email via Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send verification email:", err);
    return { success: false, error: err };
  }
}

/**
 * Sends a notification email to a verified company email when a new claim is created.
 */
export async function sendClaimAlertToCompany(
  toEmail: string,
  claimCode: string,
  claimNumeration: string | number,
  consumerName: string,
  assetType: string,
  claimType: string,
  claimText: string,
  companyName: string,
  establishmentName: string
) {
  if (!resend) {
    console.log(`[Mail Mock] Sending company alert email to ${toEmail} for claim ${claimCode}`);
    return { success: true, mocked: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminUrl = `${baseUrl}/dashboard/claims`;

  try {
    const { data, error } = await resend.emails.send({
      from: "Alertas Libro de Reclamaciones <noreply@reclamaciones.pe>",
      to: [toEmail],
      subject: `¡Nuevo Reclamo Registrado! N° ${claimNumeration} - ${establishmentName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #f59e0b; margin-top: 0; display: flex; align-items: center; gap: 8px;">
            ⚠️ Nuevo ${claimType === "queja" ? "Queja" : "Reclamo"} Registrado
          </h2>
          <p>Se ha registrado un nuevo reclamo/queja virtual en <strong>${establishmentName}</strong> (${companyName}).</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #6b7280; width: 140px;">Código Seguimiento:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #111827;">${claimCode}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #6b7280;">N° Correlativo Anual:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #111827;">${claimNumeration}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #6b7280;">Consumidor:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #111827;">${consumerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #6b7280;">Tipo de Bien:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #111827;">${assetType}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #6b7280;">Tipo:</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-transform: uppercase; font-weight: bold; color: #ef4444;">${claimType}</td>
            </tr>
          </table>

          <div style="background-color: #f9fafb; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;">
            <strong style="color: #374151; font-size: 13px;">Detalle de la Reclamación:</strong>
            <p style="margin: 8px 0 0 0; font-size: 13px; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${claimText}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Ver y Responder en Panel
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #6b7280; text-align: center;">
            Este es un correo automático enviado a los contactos autorizados del Libro de Reclamaciones.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending company alert email via Resend:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Failed to send company alert email:", err);
    return { success: false, error: err };
  }
}

