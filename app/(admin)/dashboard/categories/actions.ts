"use server";

import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimCategoriesRepository } from "@/lib/infrastructure/supabase/claim-categories-repository";
import { revalidatePath } from "next/cache";

export async function crearCategoria(name: string, establishmentId?: string | null) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "El nombre de la categoría es requerido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const categoriesRepo = new SupabaseClaimCategoriesRepository(supabase);
    await categoriesRepo.create({
      profile_id: user.id,
      establishment_id: establishmentId || null,
      name: name.trim(),
      deleted_at: null,
    });

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating category:", err);
    return { success: false, error: err.message || "Error al crear la categoría." };
  }
}

export async function eliminarCategoria(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const categoriesRepo = new SupabaseClaimCategoriesRepository(supabase);
    const category = await categoriesRepo.getById(id);

    if (!category || category.profile_id !== user.id) {
      return { success: false, error: "Categoría no encontrada." };
    }

    await categoriesRepo.delete(id);

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting category:", err);
    return { success: false, error: err.message || "Error al eliminar la categoría." };
  }
}

export async function editarCategoria(id: string, name: string, establishmentId?: string | null) {
  if (!name || name.trim().length === 0) {
    return { success: false, error: "El nombre de la categoría es requerido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autorizado" };
  }

  try {
    const categoriesRepo = new SupabaseClaimCategoriesRepository(supabase);
    const category = await categoriesRepo.getById(id);

    if (!category || category.profile_id !== user.id) {
      return { success: false, error: "Categoría no encontrada." };
    }

    await categoriesRepo.update(id, {
      establishment_id: establishmentId || null,
      name: name.trim(),
    });

    revalidatePath("/dashboard/categories");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating category:", err);
    return { success: false, error: err.message || "Error al actualizar la categoría." };
  }
}

