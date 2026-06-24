import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profilesRepo = new SupabaseProfilesRepository(supabase);
  const profile = await profilesRepo.getById(user.id);

  if (!profile) {
    redirect("/logout");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configuración de Perfil</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza la información fiscal y comercial de tu empresa.
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm profile={profile} />
    </div>
  );
}
