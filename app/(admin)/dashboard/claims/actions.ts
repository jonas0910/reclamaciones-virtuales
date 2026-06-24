"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import { revalidatePath } from "next/cache";
import { sendClaimAnswerNotification } from "@/lib/services/mail";

export async function responderReclamo(
  claimId: string,
  respuesta: string,
  notasInternas?: string
) {
  if (!respuesta || respuesta.trim().length === 0) {
    return { success: false, error: "La respuesta no puede estar vacía" };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const claimsRepo = new SupabaseClaimsRepository(supabase);
    const claim = await claimsRepo.getById(claimId);

    if (!claim || claim.profile_id !== user.id) {
      return { success: false, error: "Reclamo no encontrado" };
    }

    if (claim.state === "respondido") {
      return { success: false, error: "Este reclamo ya ha sido respondido y no se puede modificar" };
    }

    await claimsRepo.update(claimId, {
      answer: respuesta,
      internal_notes: notasInternas,
      state: "respondido",
      answer_date: new Date().toISOString(),
    });

    // Send answer notification email asynchronously (fire-and-forget/non-blocking)
    sendClaimAnswerNotification(claim.email, claim.claim_code || "", respuesta)
      .catch((mailErr) => console.error("Failed to send answer email asynchronously:", mailErr));

    revalidatePath(`/dashboard/claims/${claimId}`);
    revalidatePath("/dashboard/claims");

    return { success: true };
  } catch (err: any) {
    console.error("Error responding to claim:", err);
    return { success: false, error: err.message || "Error al registrar la respuesta" };
  }
}
