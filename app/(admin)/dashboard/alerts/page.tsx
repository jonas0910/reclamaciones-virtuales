import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseNotificationEmailsRepository } from "@/lib/infrastructure/supabase/notification-emails-repository";
import { SupabaseEstablishmentsRepository } from "@/lib/infrastructure/supabase/establishments-repository";
import AlertForm from "./alert-form";
import AlertList from "./alert-list";
import { Toaster } from "sonner";

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const emailsRepo = new SupabaseNotificationEmailsRepository(supabase);
  const establishmentsRepo = new SupabaseEstablishmentsRepository(supabase);

  const [emails, establishments] = await Promise.all([
    emailsRepo.getByProfile(user.id),
    establishmentsRepo.listByCompany(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Alertas de Correo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona las cuentas de correo donde se notificarán los reclamos o quejas registrados.
          </p>
        </div>
        <AlertForm establishments={establishments} />
      </div>

      {/* Alert Emails List */}
      <AlertList emails={emails} />

      <Toaster position="top-right" />
    </div>
  );
}
