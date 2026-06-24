import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import { SupabaseCatalogsRepository } from "@/lib/infrastructure/supabase/catalogs-repository";
import ClaimForm from "./claim-form";

interface PageProps {
  params: Promise<{
    profile_id: string;
    establishment_slug: string;
  }>;
}

export default async function PublicClaimPage({ params }: PageProps) {
  const { profile_id, establishment_slug } = await params;

  const supabase = await createClient();
  const profilesRepo = new SupabaseProfilesRepository(supabase);
  const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);
  const catalogsRepo = new SupabaseCatalogsRepository(supabase);

  // Load profile & establishment details
  const [profile, establishment, documentTypes, currencyTypes] = await Promise.all([
    profilesRepo.getById(profile_id),
    establishmentsRepo.getBySlug(profile_id, establishment_slug),
    catalogsRepo.getDocumentTypes(),
    catalogsRepo.getCurrencyTypes(),
  ]);

  if (!profile || !establishment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/20 relative py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <ClaimForm 
        profile={profile} 
        establishment={establishment} 
        documentTypes={documentTypes} 
        currencyTypes={currencyTypes} 
      />
    </div>
  );
}
