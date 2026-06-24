"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { SupabaseNotificationEmailsRepository } from "@/lib/infrastructure/supabase/notification-emails-repository";
import { ClaimInsertInput } from "@/lib/core/entities/claim";
import { sendClaimConfirmationEmail, sendClaimAlertToCompany } from "@/lib/services/mail";

export async function registrarReclamo(data: ClaimInsertInput) {
  // Validate basic fields
  if (!data.name || !data.email || !data.phone || !data.document_number || !data.claim_text || !data.request_text) {
    return { success: false, error: "Todos los campos obligatorios deben estar completos" };
  }

  const supabase = await createClient();
  const claimsRepo = new SupabaseClaimsRepository(supabase);

  try {
    const createdClaim = await claimsRepo.create(data);
    
    // Send confirmation email to consumer asynchronously
    sendClaimConfirmationEmail(createdClaim.email, createdClaim.claim_code || "", createdClaim.name)
      .catch((mailErr) => console.error("Failed to send confirmation email asynchronously:", mailErr));

    // Send notifications to verified company alert emails
    (async () => {
      try {
        const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
        const profilesRepo = new SupabaseProfilesRepository(supabase);
        const emailsRepo = new SupabaseNotificationEmailsRepository(supabase);

        const [establishment, profile, alertEmails] = await Promise.all([
          establishmentsRepo.getById(createdClaim.establishment_id),
          profilesRepo.getById(createdClaim.profile_id),
          emailsRepo.getByEstablishment(createdClaim.establishment_id)
        ]);

        const establishmentName = establishment ? establishment.name : "Establecimiento";
        const companyName = profile ? profile.company_name : "Nuestra Empresa";

        const verifiedEmails = alertEmails.filter(e => e.verified);

        for (const alertEmail of verifiedEmails) {
          sendClaimAlertToCompany(
            alertEmail.email,
            createdClaim.claim_code || "",
            createdClaim.numeration || "",
            createdClaim.name,
            createdClaim.type_asset,
            createdClaim.claim_type,
            createdClaim.claim_text,
            companyName,
            establishmentName
          ).catch(err => console.error(`Error sending company alert to ${alertEmail.email}:`, err));
        }
      } catch (alertErr) {
        console.error("Error processing company claim alerts:", alertErr);
      }
    })();

    return { 
      success: true, 
      claimCode: createdClaim.claim_code, 
      claimId: createdClaim.id,
      numeration: createdClaim.numeration
    };
  } catch (err: any) {
    console.error("Error registering public claim:", err);
    return { success: false, error: err.message || "Error al registrar el reclamo. Por favor intente más tarde." };
  }
}
