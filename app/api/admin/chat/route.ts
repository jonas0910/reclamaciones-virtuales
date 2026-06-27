import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------
// Implementación de Herramientas de Base de Datos
// ---------------------------------------------------------

async function getClaimsSummary(profileId: string, state?: string, establishmentName?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("claims")
    .select("id, state, claim_type, establishments!inner(name)", { count: "exact" })
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (state) {
    query = query.eq("state", state);
  }
  if (establishmentName) {
    query = query.ilike("establishments.name", `%${establishmentName}%`);
  }

  const { data, count, error } = await query;
  if (error) return { error: error.message };

  const total = count || 0;
  const complaints = data?.filter((c: any) => c.claim_type === "queja").length || 0;
  const claimsCount = data?.filter((c: any) => c.claim_type === "reclamo").length || 0;
  
  return {
    total,
    quejas: complaints,
    reclamos: claimsCount,
    state_filter: state || "todos",
    establishment_filter: establishmentName || "todos"
  };
}

async function getLatestClaims(profileId: string, limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claims")
    .select(`
      id,
      claim_code,
      name,
      claim_type,
      state,
      created_at,
      establishments(name)
    `)
    .eq("profile_id", profileId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 10));

  if (error) return { error: error.message };
  return {
    claims: data?.map((c: any) => ({
      codigo: c.claim_code,
      cliente: c.name,
      tipo: c.claim_type,
      estado: c.state,
      fecha: c.created_at,
      sede: c.establishments?.name
    })) || []
  };
}

async function getClaimDetail(profileId: string, claimCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claims")
    .select(`
      id,
      claim_code,
      name,
      document_number,
      email,
      phone,
      type_asset,
      description_asset,
      claim_type,
      claim_text,
      request_text,
      state,
      answer,
      answer_date,
      created_at,
      establishments(name, type_address)
    `)
    .eq("profile_id", profileId)
    .eq("claim_code", claimCode)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: `No se encontró ningún reclamo con el código "${claimCode}".` };
  
  const est: any = data.establishments;
  return {
    codigo: data.claim_code,
    cliente: data.name,
    documento: data.document_number,
    email: data.email,
    telefono: data.phone,
    bien_contratado: data.type_asset,
    descripcion_bien: data.description_asset,
    tipo: data.claim_type,
    detalle: data.claim_text,
    pedido_cliente: data.request_text,
    estado: data.state,
    respuesta: data.answer,
    fecha_respuesta: data.answer_date,
    fecha_creacion: data.created_at,
    sede: est?.name,
    tipo_sede: est?.type_address
  };
}

async function getEstablishments(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("establishments")
    .select("id, name, custom_link, type_address, code, address, department, province, district, web_page")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (error) return { error: error.message };
  return { establishments: data || [] };
}

async function getCategories(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("claim_categories")
    .select("id, name, establishments(name)")
    .eq("profile_id", profileId)
    .is("deleted_at", null);

  if (error) return { error: error.message };
  return {
    categories: data?.map((cat: any) => ({
      id: cat.id,
      nombre: cat.name,
      sede: cat.establishments?.name || "General"
    })) || []
  };
}

// ---------------------------------------------------------
// Route Handler
// ---------------------------------------------------------

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Llave de Gemini API no configurada" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Gemini requiere que el historial comience siempre con un mensaje del usuario ('user').
    // Si el primer mensaje del historial es un saludo del modelo/asistente, lo filtramos.
    const firstUserIdx = messages.findIndex((msg: any) => msg.role === "user");
    const historyMessages = firstUserIdx !== -1 ? messages.slice(firstUserIdx, -1) : [];

    const chatHistory = historyMessages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1].content;

    // Iniciar chat con historial usando el nuevo SDK @google/genai
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: chatHistory,
      config: {
        systemInstruction: `Eres "ClaimsAI", un asistente experto en auditoría y consulta de reclamaciones de la empresa.
Solo puedes responder preguntas sobre reclamos, sedes, alertas y categorías utilizando las herramientas provistas.
Nunca reveles información o IDs internos técnicos a menos que sea el código de reclamo solicitado.
Si el usuario te pregunta por temas no relacionados a su empresa, rehusate amablemente e indícale que tu función es asistir únicamente en la administración del Libro de Reclamaciones.
Responde de forma concisa, profesional y en español.`,
        tools: [
          {
            functionDeclarations: [
              {
                name: "get_claims_summary",
                description: "Obtiene un resumen de cantidad de reclamos de la empresa, opcionalmente filtrado por estado (pendiente, respondido) o por nombre del establecimiento (sede).",
                parametersJsonSchema: {
                  type: "object",
                  properties: {
                    state: {
                      type: "string",
                      description: "Estado del reclamo: 'pendiente' o 'respondido'",
                    },
                    establishment_name: {
                      type: "string",
                      description: "Nombre o palabra clave del establecimiento/sede (ej. 'Miraflores', 'San Isidro')",
                    },
                  },
                },
              },
              {
                name: "get_latest_claims",
                description: "Obtiene una lista resumida de los reclamos más recientes (código, nombre del cliente, tipo, estado, fecha de creación).",
                parametersJsonSchema: {
                  type: "object",
                  properties: {
                    limit: {
                      type: "number",
                      description: "Cantidad máxima de reclamos a retornar (por defecto 5, máximo 10)",
                    },
                  },
                },
              },
              {
                name: "get_claim_detail",
                description: "Obtiene el detalle completo de un reclamo por su código de reclamo (ej. '2026-X8Y7Z6W4').",
                parametersJsonSchema: {
                  type: "object",
                  properties: {
                    claim_code: {
                      type: "string",
                      description: "El código único del reclamo, formato YYYY-RANDOM (ej. '2026-B3X9PL7K')",
                    },
                  },
                  required: ["claim_code"],
                },
              },
              {
                name: "get_establishments",
                description: "Obtiene la lista de todos los establecimientos registrados de la empresa (nombre, dirección, tipo, código).",
                parametersJsonSchema: {
                  type: "object",
                  properties: {},
                },
              },
              {
                name: "get_categories",
                description: "Obtiene las categorías de reclamos configuradas por la empresa.",
                parametersJsonSchema: {
                  type: "object",
                  properties: {},
                },
              },
            ],
          },
        ],
      },
    });

    let result = await chat.sendMessage({ message: lastMessage });
    let functionCalls = result.functionCalls;

    let safetyCounter = 0;
    while (functionCalls && functionCalls.length > 0 && safetyCounter < 5) {
      safetyCounter++;
      const toolResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let functionResult: any;

        try {
          if (name === "get_claims_summary") {
            functionResult = await getClaimsSummary(user.id, (args as any).state, (args as any).establishment_name);
          } else if (name === "get_latest_claims") {
            functionResult = await getLatestClaims(user.id, (args as any).limit);
          } else if (name === "get_claim_detail") {
            functionResult = await getClaimDetail(user.id, (args as any).claim_code);
          } else if (name === "get_establishments") {
            functionResult = await getEstablishments(user.id);
          } else if (name === "get_categories") {
            functionResult = await getCategories(user.id);
          } else {
            functionResult = { error: `Herramienta ${name} no encontrada.` };
          }
        } catch (err: any) {
          functionResult = { error: err.message };
        }

        toolResponses.push({
          functionResponse: {
            name,
            response: functionResult
          }
        });
      }

      // Enviar las respuestas de las funciones y esperar el análisis del modelo
      result = await chat.sendMessage({ message: toolResponses });
      functionCalls = result.functionCalls;
    }

    return NextResponse.json({ content: result.text });
  } catch (error: any) {
    console.error("Error en API de Chat:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
