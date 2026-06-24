"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import { revalidatePath } from "next/cache";

export async function createEstablishment(formData: {
  name: string;
  custom_link: string;
  type_address: "Fisico" | "Virtual";
  code?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  zip_code?: string;
  web_page?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No autorizado" };
  }

  // Validate slug format (alphanumeric and dashes)
  if (!/^[a-z0-9-]+$/.test(formData.custom_link)) {
    return { success: false, error: "El enlace personalizado debe ser en minúsculas y contener solo números, letras y guiones (ej. lima-norte)" };
  }

  try {
    const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
    await establishmentsRepo.create({
      profile_id: user.id,
      name: formData.name,
      custom_link: formData.custom_link,
      type_address: formData.type_address,
      code: formData.code || null,
      address: formData.address || null,
      department: formData.department || null,
      province: formData.province || null,
      district: formData.district || null,
      zip_code: formData.zip_code || null,
      web_page: formData.web_page || null,
      deleted_at: null,
    });

    revalidatePath("/dashboard/establishments");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating establishment:", err);
    return { success: false, error: err.message || "Error al crear el establecimiento" };
  }
}

export async function deleteEstablishment(id: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
    const establishment = await establishmentsRepo.getById(id);
    
    if (!establishment || establishment.profile_id !== user.id) {
      return { success: false, error: "Establecimiento no encontrado o no autorizado" };
    }

    await establishmentsRepo.delete(id);
    revalidatePath("/dashboard/establishments");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting establishment:", err);
    return { success: false, error: err.message || "Error al eliminar el establecimiento" };
  }
}

export async function updateEstablishment(id: string, formData: {
  name: string;
  custom_link: string;
  type_address: "Fisico" | "Virtual";
  code?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  zip_code?: string;
  web_page?: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "No autorizado" };
  }

  // Validate slug format (alphanumeric and dashes)
  if (!/^[a-z0-9-]+$/.test(formData.custom_link)) {
    return { success: false, error: "El enlace personalizado debe ser en minúsculas y contener solo números, letras y guiones (ej. lima-norte)" };
  }

  try {
    const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
    const establishment = await establishmentsRepo.getById(id);

    if (!establishment || establishment.profile_id !== user.id) {
      return { success: false, error: "Establecimiento no encontrado o no autorizado" };
    }

    await establishmentsRepo.update(id, {
      name: formData.name,
      custom_link: formData.custom_link,
      type_address: formData.type_address,
      code: formData.code || null,
      address: formData.address || null,
      department: formData.department || null,
      province: formData.province || null,
      district: formData.district || null,
      zip_code: formData.zip_code || null,
      web_page: formData.web_page || null,
    });

    revalidatePath("/dashboard/establishments");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating establishment:", err);
    return { success: false, error: err.message || "Error al actualizar el establecimiento" };
  }
}

