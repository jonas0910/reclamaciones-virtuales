import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SupabaseSelectionPagesRepository } from "@/lib/infrastructure/supabase/selection-pages-repository";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreIcon, GlobeIcon, ChevronRightIcon, BuildingIcon } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SelectionPagePortal({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient();
  const selectionRepo = new SupabaseSelectionPagesRepository(supabase);

  const selectionPage = await selectionRepo.getBySlug(slug);

  if (!selectionPage) {
    notFound();
  }

  const { brand_name, logo_url, profile_id, establishments = [] } = selectionPage;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header section with brand info */}
        <div className="flex flex-col items-center text-center gap-4">
          {logo_url ? (
            <div className="size-20 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 p-2 flex items-center justify-center shadow-2xl backdrop-blur-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo_url}
                alt={`Logo de ${brand_name}`}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="size-20 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-center shadow-2xl backdrop-blur-xl text-primary">
              <BuildingIcon className="size-10" />
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              {brand_name || "Libro de Reclamaciones"}
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Portal Oficial de Reclamaciones y Quejas. Por favor, seleccione el establecimiento o canal donde realizó su compra o recibió el servicio.
            </p>
          </div>
        </div>

        {/* Establishments List Card */}
        <Card className="border-slate-800 bg-slate-950/40 backdrop-blur-2xl shadow-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-900/60 bg-slate-900/10">
            <CardTitle className="text-lg text-white">Nuestras Sucursales</CardTitle>
            <CardDescription className="text-slate-400">
              Elija un local de la siguiente lista para iniciar su trámite.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-900/60">
            {establishments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No hay establecimientos asociados a esta página de selección actualmente.
              </div>
            ) : (
              establishments.map((est) => (
                <div
                  key={est.id}
                  className="flex items-center justify-between p-5 hover:bg-slate-900/20 transition-all group"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="size-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                      {est.type_address === "Fisico" ? (
                        <StoreIcon className="size-5" />
                      ) : (
                        <GlobeIcon className="size-5" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white group-hover:text-primary transition-colors truncate">
                          {est.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            est.type_address === "Fisico"
                              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px]"
                              : "border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px]"
                          }
                        >
                          {est.type_address === "Fisico" ? "Local Físico" : "Virtual / Web"}
                        </Badge>
                      </div>
                      <span className="text-slate-400 text-xs truncate">
                        {est.type_address === "Fisico"
                          ? [est.address, est.district, est.province].filter(Boolean).join(", ")
                          : est.web_page || "Canal Online"}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/reclamo-virtual/${profile_id}/${est.custom_link}`}
                    className="shrink-0"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer"
                    >
                      Seleccionar
                      <ChevronRightIcon className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 flex flex-col gap-1">
          <span>Libro de Reclamaciones Virtual regulado por INDECOPI.</span>
          <span>Todos los derechos reservados.</span>
        </div>

      </div>
    </div>
  );
}
