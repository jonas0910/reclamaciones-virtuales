import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimCategoriesRepository } from "@/lib/infrastructure/supabase/claim-categories-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import CategoryForm from "./category-form";
import CategoryList from "./category-list";
import { Toaster } from "sonner";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categoriesRepo = new SupabaseClaimCategoriesRepository(supabase);
  const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);

  const [categories, establishments] = await Promise.all([
    categoriesRepo.getByProfile(user.id),
    establishmentsRepo.listByCompany(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorías de Reclamos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Clasifica las quejas y reclamos internamente por áreas o departamentos de tu negocio.
          </p>
        </div>
        <CategoryForm establishments={establishments} />
      </div>

      {/* Categories List */}
      <CategoryList categories={categories} establishments={establishments} />

      <Toaster position="top-right" />
    </div>
  );
}
