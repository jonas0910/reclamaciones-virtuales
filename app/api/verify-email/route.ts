import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseNotificationEmailsRepository } from "@/lib/infrastructure/supabase/notification-emails-repository";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const buildHtmlResponse = (title: string, message: string, success: boolean) => {
    const iconColor = success ? "#10b981" : "#ef4444";
    const iconSvg = success
      ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 48px; height: 48px;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 48px; height: 48px;"><path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Libro de Reclamaciones</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: radial-gradient(circle at top left, #111827, #030712);
            color: #f3f4f6;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }
          .card {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            max-width: 440px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          .icon-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: ${success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
            color: ${iconColor};
            margin-bottom: 24px;
            box-shadow: 0 0 20px ${success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'};
          }
          h1 {
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #ffffff;
            letter-spacing: -0.025em;
          }
          p {
            font-size: 14px;
            line-height: 1.6;
            color: #9ca3af;
            margin: 0 0 32px 0;
          }
          .btn {
            display: inline-block;
            background: ${success ? '#10b981' : '#374151'};
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 12px;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 4px 12px ${success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          }
          .btn:hover {
            transform: translateY(-2px);
            background: ${success ? '#059669' : '#4b5563'};
            box-shadow: 0 6px 20px ${success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon-container">
            ${iconSvg}
          </div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/dashboard/alerts" class="btn">Ir al Panel de Administración</a>
        </div>
      </body>
      </html>
    `;
  };

  if (!token) {
    return new NextResponse(
      buildHtmlResponse(
        "Token Invalido",
        "El enlace de verificación no contiene un token válido o ha expirado.",
        false
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const supabase = await createClient();
    const emailsRepo = new SupabaseNotificationEmailsRepository(supabase);

    const verified = await emailsRepo.verifyToken(token);

    if (verified) {
      return new NextResponse(
        buildHtmlResponse(
          "¡Correo Verificado!",
          "La dirección de correo electrónico ha sido verificada correctamente. A partir de ahora recibirás alertas en tiempo real de nuevos reclamos.",
          true
        ),
        { headers: { "Content-Type": "text/html" } }
      );
    } else {
      return new NextResponse(
        buildHtmlResponse(
          "Verificación Fallida",
          "El token de verificación proporcionado es incorrecto, ya ha sido utilizado o ha expirado.",
          false
        ),
        { headers: { "Content-Type": "text/html" } }
      );
    }
  } catch (error) {
    console.error("Error during email verification Route Handler:", error);
    return new NextResponse(
      buildHtmlResponse(
        "Error del Servidor",
        "Ocurrió un problema inesperado al procesar tu solicitud. Por favor inténtalo de nuevo más tarde.",
        false
      ),
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
