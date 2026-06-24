import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Server-side validation
    const requiredFields = [
      "profile_id", 
      "establishment_id", 
      "name", 
      "document_type_id", 
      "document_number", 
      "email", 
      "phone", 
      "claim_text", 
      "request_text"
    ];

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' es requerido.` },
          { status: 400 }
        );
      }
    }

    const supabase = await createClient();
    const claimsRepo = new SupabaseClaimsRepository(supabase);

    const created = await claimsRepo.create({
      profile_id: body.profile_id,
      establishment_id: body.establishment_id,
      name: body.name,
      under_age: !!body.under_age,
      parent_name: body.parent_name || null,
      document_type_id: Number(body.document_type_id),
      document_number: body.document_number,
      email: body.email,
      phone: body.phone,
      type_asset: body.type_asset || "Producto",
      description_asset: body.description_asset,
      currency_type_id: body.currency_type_id ? Number(body.currency_type_id) : null,
      claim_amount: body.claim_amount ? Number(body.claim_amount) : null,
      claim_type: body.claim_type || "reclamo",
      claim_text: body.claim_text,
      request_text: body.request_text,
      deleted_at: null,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Reclamo registrado exitosamente en el Libro de Reclamaciones",
        data: {
          id: created.id,
          claim_code: created.claim_code,
          numeration: created.numeration,
          state: created.state,
          created_at: created.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Error in public API claims POST:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
