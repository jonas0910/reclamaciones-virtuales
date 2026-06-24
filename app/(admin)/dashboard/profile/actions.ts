"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: {
  name: string;
  company_name: string;
  company_ruc: string;
  company_address: string;
  company_postal_code?: string;
  company_link?: string;
  company_logo?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No autorizado" };
  }

  if (formData.company_ruc.length !== 11 || !/^\d+$/.test(formData.company_ruc)) {
    return { success: false, error: "El RUC debe tener exactamente 11 dígitos numéricos" };
  }

  try {
    const profilesRepo = new SupabaseProfilesRepository(supabase);
    await profilesRepo.update(user.id, {
      name: formData.name,
      company_name: formData.company_name,
      company_ruc: formData.company_ruc,
      company_address: formData.company_address,
      company_postal_code: formData.company_postal_code || null,
      company_link: formData.company_link || null,
      company_logo: formData.company_logo || null,
    });

    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating profile:", err);
    return { success: false, error: err.message || "Error al actualizar el perfil" };
  }
}
