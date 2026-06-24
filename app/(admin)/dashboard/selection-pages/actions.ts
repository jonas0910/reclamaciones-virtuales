"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseSelectionPagesRepository } from "@/lib/infrastructure/supabase/selection-pages-repository";
import { revalidatePath } from "next/cache";

export async function crearPaginaSeleccion(
  brandName: string,
  customLink: string,
  logoUrl: string | null,
  establishmentIds: string[]
) {
  if (!brandName || brandName.trim().length === 0) {
    return { success: false, error: "El nombre de la marca es obligatorio." };
  }
  if (!customLink || customLink.trim().length === 0) {
    return { success: false, error: "El slug/enlace personalizado es obligatorio." };
  }
  if (!establishmentIds || establishmentIds.length === 0) {
    return { success: false, error: "Debe seleccionar al menos un establecimiento." };
  }

  const slug = customLink.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

  if (slug.length === 0) {
    return { success: false, error: "El enlace personalizado contiene caracteres inválidos." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const selectionRepo = new SupabaseSelectionPagesRepository(supabase);
    
    // Check if slug is already taken
    const existing = await selectionRepo.getBySlug(slug);
    if (existing) {
      return { success: false, error: "El enlace personalizado ya está en uso por otra página." };
    }

    await selectionRepo.create(
      {
        profile_id: user.id,
        brand_name: brandName.trim(),
        custom_link: slug,
        logo_url: logoUrl || null,
        deleted_at: null,
      },
      establishmentIds
    );

    revalidatePath("/dashboard/selection-pages");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating selection page:", err);
    return { success: false, error: err.message || "Error al crear la página de selección." };
  }
}

export async function eliminarPaginaSeleccion(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const selectionRepo = new SupabaseSelectionPagesRepository(supabase);
    const pages = await selectionRepo.getByProfile(user.id);
    const hasItem = pages.some(p => p.id === id);

    if (!hasItem) {
      return { success: false, error: "Página no encontrada." };
    }

    await selectionRepo.delete(id);

    revalidatePath("/dashboard/selection-pages");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting selection page:", err);
    return { success: false, error: err.message || "Error al eliminar la página." };
  }
}

export async function editarPaginaSeleccion(
  id: string,
  brandName: string,
  customLink: string,
  logoUrl: string | null,
  establishmentIds: string[]
) {
  if (!brandName || brandName.trim().length === 0) {
    return { success: false, error: "El nombre de la marca es obligatorio." };
  }
  if (!customLink || customLink.trim().length === 0) {
    return { success: false, error: "El slug/enlace personalizado es obligatorio." };
  }
  if (!establishmentIds || establishmentIds.length === 0) {
    return { success: false, error: "Debe seleccionar al menos un establecimiento." };
  }

  const slug = customLink.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "");

  if (slug.length === 0) {
    return { success: false, error: "El enlace personalizado contiene caracteres inválidos." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const selectionRepo = new SupabaseSelectionPagesRepository(supabase);

    // Verify ownership of selection page
    const pages = await selectionRepo.getByProfile(user.id);
    const pageToUpdate = pages.find(p => p.id === id);
    if (!pageToUpdate) {
      return { success: false, error: "Página no encontrada." };
    }

    // Check if new slug conflicts with another page
    if (pageToUpdate.custom_link !== slug) {
      const existing = await selectionRepo.getBySlug(slug);
      if (existing) {
        return { success: false, error: "El enlace personalizado ya está en uso por otra página." };
      }
    }

    await selectionRepo.update(
      id,
      {
        brand_name: brandName.trim(),
        custom_link: slug,
        logo_url: logoUrl || null,
      },
      establishmentIds
    );

    revalidatePath("/dashboard/selection-pages");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating selection page:", err);
    return { success: false, error: err.message || "Error al actualizar la página de selección." };
  }
}

