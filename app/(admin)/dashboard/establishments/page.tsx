import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import EstablishmentForm from "./establishment-form";
import EstablishmentList from "./establishment-list";

export default async function EstablishmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
  const establishments = await establishmentsRepo.listByCompany(user.id);

  const profilesRepo = new SupabaseProfilesRepository(supabase);
  const profile = await profilesRepo.getById(user.id);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header with Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Establecimientos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus sucursales físicas o tiendas virtuales y obtén sus enlaces de Libro de Reclamaciones.
          </p>
        </div>
        <div>
          <EstablishmentForm />
        </div>
      </div>

      {/* List of Establishments */}
      <EstablishmentList establishments={establishments} profileId={user.id} profile={profile} />
    </div>
  );
}
