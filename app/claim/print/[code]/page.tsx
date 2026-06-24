import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { PrinterIcon } from "lucide-react";
import PrintButton from "../print-button";

interface PageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function PrintClaimPage({ params }: PageProps) {
  const { code } = await params;

  const supabase = await createClient();
  const claimsRepo = new SupabaseClaimsRepository(supabase);
  const claim = await claimsRepo.getByCode(code);

  if (!claim) {
    notFound();
  }

  const profilesRepo = new SupabaseProfilesRepository(supabase);
  const profile = await profilesRepo.getById(claim.profile_id);

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-black p-6 md:p-12 max-w-4xl mx-auto font-mono text-sm leading-relaxed relative flex flex-col justify-between">
      
      {/* Print Trigger Header (Hidden when printing) */}
      <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl mb-8 print:hidden border border-border/40">
        <div className="flex items-center gap-2">
          <PrinterIcon className="size-5 text-primary" />
          <span className="font-semibold text-xs text-foreground">Vista de Impresión Oficial</span>
        </div>
        <PrintButton />
      </div>

      <div className="flex flex-col gap-6 border-2 border-black p-6 rounded-none">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-black pb-4">
          <div className="flex flex-col">
            <h1 className="font-bold text-lg uppercase tracking-tight">Libro de Reclamaciones</h1>
            <span className="text-xs uppercase mt-0.5">Hoja de Reclamación Virtual</span>
            <span className="text-[10px] text-gray-500 mt-2 font-semibold">Conforme al D.S. N° 011-2011-PCM</span>
          </div>

          <div className="flex flex-col items-start sm:items-end text-left sm:text-right">
            <span className="font-bold text-base font-mono">N° {claim.claim_code}</span>
            <span className="text-xs font-semibold mt-1">N° Correlativo: {claim.numeration}</span>
            <span className="text-[10px] mt-1 text-gray-500">
              Fecha de Registro: {new Date(claim.created_at).toLocaleString("es-PE")}
            </span >
          </div>
        </div>

        {/* Proveedor Info */}
        <div className="border-b-2 border-black pb-4 flex flex-col gap-2">
          <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 self-start">
            1. Identificación del Proveedor
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-1">
            <div>
              <span className="font-bold block">Razón Social / Nombre:</span>
              <span>{profile.company_name}</span>
            </div>
            <div>
              <span className="font-bold block">RUC:</span>
              <span>{profile.company_ruc}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-bold block">Dirección Fiscal:</span>
              <span>{profile.company_address}</span>
            </div>
          </div>
        </div>

        {/* Consumidor Info */}
        <div className="border-b-2 border-black pb-4 flex flex-col gap-2">
          <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 self-start">
            2. Identificación del Consumidor Reclamante
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-1">
            <div className="sm:col-span-2">
              <span className="font-bold block">Nombre Completo:</span>
              <span>{claim.name}</span>
            </div>
            {claim.under_age && (
              <div className="sm:col-span-2 bg-gray-100 p-2 border border-black">
                <span className="font-bold block">Tutor / Apoderado Legal (Menor de edad):</span>
                <span>{claim.parent_name}</span>
              </div>
            )}
            <div>
              <span className="font-bold block">Documento de Identidad:</span>
              <span>{claim.document_type?.name} ({claim.document_number})</span>
            </div>
            <div>
              <span className="font-bold block">Teléfono / Celular:</span>
              <span>{claim.phone}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-bold block">Correo Electrónico:</span>
              <span>{claim.email}</span>
            </div>
          </div>
        </div>

        {/* Bien Contratado */}
        <div className="border-b-2 border-black pb-4 flex flex-col gap-2">
          <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 self-start">
            3. Identificación del Bien Contratado
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-1">
            <div>
              <span className="font-bold block">Tipo de Bien:</span>
              <span className="capitalize">{claim.type_asset}</span>
            </div>
            <div>
              <span className="font-bold block">Monto Reclamado:</span>
              <span>
                {claim.claim_amount 
                  ? `${claim.currency_type?.symbol} ${claim.claim_amount.toFixed(2)}` 
                  : "No especificado"}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="font-bold block">Descripción o Identificación del Bien:</span>
              <span className="block mt-1 bg-gray-50 p-2 border border-gray-200">{claim.description_asset}</span>
            </div>
          </div>
        </div>

        {/* Reclamación Info */}
        <div className="border-b-2 border-black pb-4 flex flex-col gap-2">
          <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 self-start">
            4. Detalle de la Reclamación y Pedido del Consumidor
          </span>
          <div className="grid grid-cols-1 gap-3 text-xs mt-1">
            <div>
              <span className="font-bold block">Tipo de Trámite:</span>
              <span className="capitalize font-semibold">{claim.claim_type}</span>
            </div>
            <div>
              <span className="font-bold block">Detalle de la Queja o Reclamo:</span>
              <div className="bg-gray-50 p-3 border border-gray-200 whitespace-pre-wrap leading-relaxed mt-1">
                {claim.claim_text}
              </div>
            </div>
            <div>
              <span className="font-bold block">Pedido Concreto:</span>
              <div className="bg-gray-50 p-3 border border-gray-200 whitespace-pre-wrap leading-relaxed mt-1">
                {claim.request_text}
              </div>
            </div>
          </div>
        </div>

        {/* Respuesta de la Empresa */}
        <div className="pb-2 flex flex-col gap-2">
          <span className="font-bold text-xs uppercase bg-black text-white px-2 py-0.5 self-start">
            5. Acciones y Respuestas Adoptadas por el Proveedor
          </span>
          <div className="text-xs mt-1">
            {claim.state === "respondido" ? (
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-bold block">Detalle de la Respuesta Oficial:</span>
                  <div className="bg-gray-50 p-3 border border-gray-200 whitespace-pre-wrap leading-relaxed mt-1">
                    {claim.answer}
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Fecha de Respuesta: {claim.answer_date ? new Date(claim.answer_date).toLocaleString("es-PE") : ""}
                </span>
              </div>
            ) : (
              <div className="border border-dashed border-gray-400 p-6 text-center text-gray-400 font-semibold italic">
                Reclamo en proceso de atención. La empresa tiene hasta 15 días hábiles para emitir respuesta oficial.
              </div>
            )}
          </div>
        </div>

        {/* Firmas y Declaraciones */}
        <div className="grid grid-cols-2 gap-8 border-t-2 border-black pt-12 mt-4 text-xs text-center">
          <div className="flex flex-col items-center">
            <div className="w-48 border-t border-black" />
            <span className="mt-1 font-semibold">Firma del Consumidor</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-48 border-t border-black" />
            <span className="mt-1 font-semibold">Firma del Proveedor</span>
          </div>
        </div>
      </div>

      <div className="text-[9px] text-gray-500 mt-6 leading-normal text-center">
        * Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) y el Reglamento del Libro de Reclamaciones.<br />
        * El proveedor debe responder el reclamo en un plazo máximo de quince (15) días hábiles improrrogables.
      </div>
    </div>
  );
}
