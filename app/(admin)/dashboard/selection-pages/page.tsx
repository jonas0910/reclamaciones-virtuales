import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseSelectionPagesRepository } from "@/lib/infrastructure/supabase/selection-pages-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import SelectionPageForm from "./selection-page-form";
import SelectionPageList from "./selection-page-list";
import { Toaster } from "sonner";

export default async function SelectionPagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const selectionRepo = new SupabaseSelectionPagesRepository(supabase);
  const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);

  const [pages, establishments] = await Promise.all([
    selectionRepo.getByProfile(user.id),
    establishmentsRepo.listByCompany(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Páginas de Selección</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configura páginas grupales para que tus clientes puedan elegir el local comercial donde desean registrar su reclamo.
          </p>
        </div>
        <SelectionPageForm establishments={establishments} />
      </div>

      {/* Selection Pages List */}
      <SelectionPageList pages={pages} establishments={establishments} />

      <Toaster position="top-right" />
    </div>
  );
}
