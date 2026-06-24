import React from "react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import ResponseForm from "./response-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, CalendarIcon, FileTextIcon, UserIcon, ShieldAlertIcon, CheckCircle2Icon } from "lucide-react";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ClaimDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const claimsRepo = new SupabaseClaimsRepository(supabase);
  const claim = await claimsRepo.getById(id);

  if (!claim || claim.profile_id !== user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Back to list and Status summary header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/claims">
            <Button variant="outline" size="icon" className="size-8 cursor-pointer">
              <ArrowLeftIcon className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-mono">
                {claim.claim_code}
              </h2>
              <Badge className="capitalize font-semibold text-[10px]">
                N° {claim.numeration}
              </Badge>
              <Badge 
                className={`capitalize font-semibold text-[10px] ${
                  claim.state === "pendiente" 
                    ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20" 
                    : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                }`}
              >
                {claim.state}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <CalendarIcon className="size-3" />
              Registrado el: {new Date(claim.created_at).toLocaleString("es-PE")}
            </p>
          </div>
        </div>
        
        {claim.state === "respondido" && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-3 py-1.5 rounded-lg text-xs font-medium">
            <CheckCircle2Icon className="size-4 shrink-0" />
            Respondido el {claim.answer_date ? new Date(claim.answer_date).toLocaleDateString("es-PE") : ""}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Detail & Action */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Claim Detail Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <FileTextIcon className="size-4 text-primary" />
                Detalle del Reclamo / Queja
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground block">Tipo de Trámite</span>
                  <span className="text-sm font-semibold capitalize text-foreground">{claim.claim_type}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Establecimiento</span>
                  <span className="text-sm font-semibold text-foreground">{claim.establishment?.name}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">Detalle y Hechos Reclamados</span>
                <div className="text-sm text-foreground bg-muted/40 p-4 rounded-lg whitespace-pre-wrap border border-border/20">
                  {claim.claim_text}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted-foreground block mb-1">Pedido Concreto del Consumidor</span>
                <div className="text-sm text-foreground bg-muted/40 p-4 rounded-lg whitespace-pre-wrap border border-border/20">
                  {claim.request_text}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answer Area */}
          {claim.state === "pendiente" ? (
            <ResponseForm claimId={claim.id} />
          ) : (
            <Card className="border-border/40 bg-card/60 backdrop-blur-md">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-500">
                  <CheckCircle2Icon className="size-4" />
                  Respuesta Oficial de la Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 p-6">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Detalle de la Respuesta</span>
                  <div className="text-sm text-foreground bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-lg whitespace-pre-wrap">
                    {claim.answer}
                  </div>
                </div>

                {claim.internal_notes && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Notas Internas</span>
                    <div className="text-sm text-muted-foreground bg-muted/40 p-4 rounded-lg whitespace-pre-wrap border border-border/20">
                      {claim.internal_notes}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Claimant & Asset Info */}
        <div className="flex flex-col gap-6">
          {/* Claimant Info Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserIcon className="size-4 text-primary" />
                Datos del Reclamante
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Nombre Completo</span>
                <span className="text-sm font-medium text-foreground">{claim.name}</span>
              </div>
              
              {claim.under_age && (
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 flex items-start gap-2">
                  <ShieldAlertIcon className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Menor de Edad</span>
                    <span className="text-xs text-muted-foreground">Tutor: {claim.parent_name}</span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Documento de Identidad</span>
                <span className="text-sm font-medium text-foreground">
                  {claim.document_type?.abbreviation}: {claim.document_number}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Correo Electrónico</span>
                <span className="text-sm font-medium text-foreground break-all">{claim.email}</span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Teléfono / Celular</span>
                <span className="text-sm font-medium text-foreground">{claim.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Asset Info Card */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-md">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileTextIcon className="size-4 text-primary" />
                Bien Contratado
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Tipo de Bien</span>
                <span className="text-sm font-medium text-foreground capitalize">{claim.type_asset}</span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Monto Reclamado</span>
                <span className="text-sm font-bold text-foreground">
                  {claim.currency_type?.symbol} {claim.claim_amount?.toFixed(2) || "0.00"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Descripción del Bien</span>
                <span className="text-xs text-muted-foreground leading-relaxed">{claim.description_asset}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
