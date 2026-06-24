"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseNotificationEmailsRepository } from "@/lib/infrastructure/supabase/notification-emails-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { sendAlertEmailVerification } from "@/lib/services/mail";
import { revalidatePath } from "next/cache";

export async function crearAlertaEmail(email: string, establishmentId: string) {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return { success: false, error: "Ingrese un correo electrónico válido." };
  }
  if (!establishmentId) {
    return { success: false, error: "El establecimiento es requerido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const emailsRepo = new SupabaseNotificationEmailsRepository(supabase);
    const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
    const profilesRepo = new SupabaseProfilesRepository(supabase);

    const [establishment, profile] = await Promise.all([
      establishmentsRepo.getById(establishmentId),
      profilesRepo.getById(user.id),
    ]);

    const establishmentName = establishment ? establishment.name : "Establecimiento";
    const companyName = profile ? profile.company_name : "Nuestra Empresa";

    const newEmail = await emailsRepo.create({
      profile_id: user.id,
      establishment_id: establishmentId,
      email: email.trim().toLowerCase(),
      deleted_at: null,
    });

    if (newEmail && newEmail.verification_token) {
      await sendAlertEmailVerification(
        newEmail.email,
        newEmail.verification_token,
        companyName,
        establishmentName
      );
    }

    revalidatePath("/dashboard/alerts");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating notification email:", err);
    return { success: false, error: err.message || "Error al registrar el correo." };
  }
}

export async function eliminarAlertaEmail(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const emailsRepo = new SupabaseNotificationEmailsRepository(supabase);
    // Find item
    const emails = await emailsRepo.getByProfile(user.id);
    const hasItem = emails.some(e => e.id === id);

    if (!hasItem) {
      return { success: false, error: "Registro no encontrado." };
    }

    await emailsRepo.delete(id);

    revalidatePath("/dashboard/alerts");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting notification email:", err);
    return { success: false, error: err.message || "Error al eliminar el correo." };
  }
}
