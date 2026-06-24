import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SearchIcon, 
  HelpCircleIcon, 
  CheckCircle2Icon, 
  AlertCircleIcon, 
  Building2Icon,
  CalendarIcon,
  ShieldCheckIcon
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    code?: string;
  }>;
}

export default async function ConsultaReclamoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const code = params.code || "";

  let claim = null;
  let searchAttempted = false;
  let errorMsg = "";

  if (code.trim()) {
    searchAttempted = true;
    const supabase = await createClient();
    const claimsRepo = new SupabaseClaimsRepository(supabase);
    try {
      claim = await claimsRepo.getByCode(code.trim().toUpperCase());
      if (!claim) {
        errorMsg = "Código de reclamo no encontrado. Por favor verifique el código e intente nuevamente.";
      }
    } catch (err) {
      console.error(err);
      errorMsg = "Ocurrió un error al buscar el reclamo.";
    }
  }

  return (
    <div className="relative min-h-screen bg-muted/20 py-12 px-4 flex flex-col items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center gap-2">
          <Link href="/">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary hover:scale-105 transition-transform">
              <ShieldCheckIcon className="size-6" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Consulta de Reclamaciones</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ingresa tu código único de seguimiento para verificar el estado de tu reclamo o queja.
          </p>
        </div>

        {/* Search Card */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">Buscar Reclamo</CardTitle>
            <CardDescription>
              El código tiene el formato RECL-YYYYMMDD-XXXX (ej. RECL-20260624-0001)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form method="GET" action="/consulta" className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  name="code"
                  placeholder="RECL-YYYYMMDD-XXXX"
                  defaultValue={code}
                  className="pl-10 uppercase font-mono font-bold tracking-wider"
                />
              </div>
              <Button type="submit" className="font-semibold cursor-pointer shrink-0">
                Consultar Estado
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Query Results */}
        {searchAttempted && (
          <>
            {claim ? (
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-300">
                <CardHeader className="border-b border-border/40 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg font-bold font-mono tracking-wider text-foreground">
                          {claim.claim_code}
                        </CardTitle>
                        <Badge className="capitalize font-semibold text-[9px] uppercase">
                          {claim.claim_type}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <CalendarIcon className="size-3" />
                        Registrado el: {new Date(claim.created_at).toLocaleDateString("es-PE")}
                      </span>
                    </div>

                    <Badge 
                      className={`capitalize font-semibold text-[10px] sm:self-center self-start ${
                        claim.state === "pendiente" 
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                      }`}
                    >
                      {claim.state === "pendiente" ? "En Proceso" : "Respondido"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 flex flex-col gap-6">
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/10">
                      <span className="text-muted-foreground block font-medium">Proveedor</span>
                      <span className="font-semibold text-foreground mt-0.5 flex items-center gap-1">
                        <Building2Icon className="size-3.5 text-primary" />
                        {claim.establishment?.name || "Establecimiento"}
                      </span>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-xl border border-border/10">
                      <span className="text-muted-foreground block font-medium">Bien Contratado</span>
                      <span className="font-semibold text-foreground capitalize mt-0.5">
                        {claim.type_asset}: {claim.description_asset}
                      </span>
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Hechos Reclamados:</span>
                    <div className="text-xs text-foreground bg-muted/30 p-3.5 rounded-lg border border-border/10 whitespace-pre-wrap leading-relaxed">
                      {claim.claim_text}
                    </div>
                  </div>

                  {/* Solutions Section */}
                  {claim.state === "pendiente" ? (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                      <AlertCircleIcon className="size-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-amber-700">En proceso de atención</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          La empresa está evaluando los detalles de tu reclamo. El plazo máximo de respuesta legal es de 15 días hábiles a partir de la fecha de registro. Te enviaremos una notificación cuando se registre la respuesta.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2">
                      <div className="flex gap-2 items-center text-emerald-600">
                        <CheckCircle2Icon className="size-5 shrink-0" />
                        <span className="text-sm font-bold">Respuesta Oficial del Proveedor</span>
                      </div>
                      <div className="text-xs text-foreground bg-card p-3 rounded-lg border border-border/10 whitespace-pre-wrap leading-relaxed">
                        {claim.answer}
                      </div>
                      <span className="text-[10px] text-muted-foreground text-right block mt-1">
                        Respondido el: {claim.answer_date ? new Date(claim.answer_date).toLocaleDateString("es-PE") : ""}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex gap-3 text-destructive animate-in fade-in slide-in-from-bottom-4 duration-300">
                <AlertCircleIcon className="size-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold">Error de búsqueda</span>
                  <p className="text-xs opacity-90 leading-relaxed">{errorMsg}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
