"use client";

import React, { useState } from "react";
import { registrarReclamo } from "../../actions";
import { Profile } from "@/lib/core/entities/profile";
import { Establishment } from "@/lib/core/entities/establishment";
import { DocumentType, CurrencyType } from "@/lib/core/entities/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  UserIcon, 
  ShoppingBagIcon, 
  FileTextIcon, 
  ArrowLeftIcon, 
  ArrowRightIcon, 
  CheckCircle2Icon, 
  Loader2Icon,
  ShieldAlertIcon,
  PrinterIcon
} from "lucide-react";
import { toast, Toaster } from "sonner";

interface ClaimFormProps {
  profile: Profile;
  establishment: Establishment;
  documentTypes: DocumentType[];
  currencyTypes: CurrencyType[];
}

export default function ClaimForm({ profile, establishment, documentTypes, currencyTypes }: ClaimFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ code: string; numeration: number } | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [underAge, setUnderAge] = useState(false);
  const [parentName, setParentName] = useState("");
  const [documentTypeId, setDocumentTypeId] = useState(documentTypes[0]?.id.toString() || "");
  const [documentNumber, setDocumentNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [typeAsset, setTypeAsset] = useState<"Producto" | "Servicio">("Producto");
  const [descriptionAsset, setDescriptionAsset] = useState("");
  const [currencyTypeId, setCurrencyTypeId] = useState(currencyTypes[0]?.id.toString() || "");
  const [claimAmount, setClaimAmount] = useState("");

  const [claimType, setClaimType] = useState<"queja" | "reclamo">("reclamo");
  const [claimText, setClaimText] = useState("");
  const [requestText, setRequestText] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!name.trim()) newErrors.name = "Los nombres y apellidos son requeridos";
      if (underAge && !parentName.trim()) newErrors.parentName = "El nombre del padre o tutor es requerido";
      if (!documentTypeId) newErrors.documentTypeId = "El tipo de documento es requerido";
      if (!documentNumber.trim()) newErrors.documentNumber = "El número de documento es requerido";
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Ingrese un correo electrónico válido";
      if (!phone.trim()) newErrors.phone = "El teléfono/celular es requerido";
    }

    if (stepNumber === 2) {
      if (!descriptionAsset.trim()) newErrors.descriptionAsset = "La descripción del bien es requerida";
    }

    if (stepNumber === 3) {
      if (!claimText.trim()) newErrors.claimText = "El detalle del reclamo es requerido";
      if (!requestText.trim()) newErrors.requestText = "El pedido o solicitud del reclamo es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const res = await registrarReclamo({
        profile_id: profile.id,
        establishment_id: establishment.id,
        name,
        under_age: underAge,
        parent_name: underAge ? parentName : null,
        document_type_id: Number(documentTypeId),
        document_number: documentNumber,
        email,
        phone,
        type_asset: typeAsset,
        description_asset: descriptionAsset,
        currency_type_id: claimAmount ? Number(currencyTypeId) : null,
        claim_amount: claimAmount ? Number(claimAmount) : null,
        claim_type: claimType,
        claim_text: claimText,
        request_text: requestText,
        deleted_at: null,
      });

      if (res.success && res.claimCode) {
        setSuccessData({
          code: res.claimCode,
          numeration: res.numeration || 0,
        });
        toast.success("Reclamo registrado con éxito.");
      } else {
        toast.error(res.error || "Ocurrió un error al registrar el reclamo.");
      }
    } catch (err) {
      toast.error("Error de conexión al servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Success Step Display
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 print:p-0">
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-transparent">
          <CardHeader className="text-center flex flex-col items-center gap-3 bg-primary/5 p-8 print:bg-transparent">
            <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center print:hidden">
              <CheckCircle2Icon className="size-10" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              ¡Reclamo Registrado con Éxito!
            </CardTitle>
            <CardDescription className="text-sm max-w-md mx-auto">
              Tu hoja de reclamación virtual ha sido procesada de acuerdo a las leyes de protección al consumidor de INDECOPI.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8 flex flex-col gap-6 font-mono text-sm">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-2xl border border-border/20 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Código de Seguimiento</span>
              <span className="text-2xl font-bold text-foreground mt-1 tracking-wider">{successData.code}</span>
              <span className="text-[10px] text-muted-foreground mt-2">
                Guarda este código para consultar el estado de tu reclamo posteriormente.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-border/20 py-4 text-xs text-muted-foreground">
              <div>
                <span>Proveedor:</span>
                <span className="block font-semibold text-foreground mt-0.5">{profile.company_name}</span>
                <span className="block text-[10px]">RUC: {profile.company_ruc}</span>
              </div>
              <div>
                <span>Establecimiento:</span>
                <span className="block font-semibold text-foreground mt-0.5">{establishment.name}</span>
                <span className="block text-[10px] capitalize">Tipo: {establishment.type_address}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              <p><strong>Nota legal importante:</strong></p>
              <p className="mt-1">
                La empresa cuenta con un plazo máximo improrrogable de quince (15) días hábiles para dar respuesta oficial a su hoja de reclamación.
              </p>
              <p className="mt-2 font-semibold">
                Una copia de este registro ha sido enviada al correo electrónico proporcionado ({email}).
              </p>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 p-6 flex flex-col sm:flex-row gap-3 justify-center print:hidden border-t border-border/20">
            <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto cursor-pointer border-border/50">
              <PrinterIcon className="mr-2 size-4" data-icon="inline-start" /> Imprimir Comprobante
            </Button>
            <a href="/consulta" className="w-full sm:w-auto">
              <Button className="w-full cursor-pointer font-semibold">
                Consultar Estado
              </Button>
            </a>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Company Header Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-lg mb-6 overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {profile.company_logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={profile.company_logo} 
              alt="Logo Empresa" 
              className="size-16 object-contain rounded-xl bg-muted p-1 border border-border/20" 
            />
          ) : (
            <div className="size-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileTextIcon className="size-8" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-foreground truncate">{profile.company_name}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">RUC: {profile.company_ruc}</p>
            <p className="text-[10px] text-primary/80 font-medium mt-1 font-mono uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full inline-block">
              Libro de Reclamaciones Virtual - {establishment.name}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Wizard Steps Indicator */}
      <div className="flex items-center justify-between px-6 mb-8 relative">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-border/40 -z-10" />
        {[1, 2, 3].map((num) => (
          <div 
            key={num}
            className={`size-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
              step >= num 
                ? "bg-primary border-primary text-primary-foreground shadow-md" 
                : "bg-background border-border/50 text-muted-foreground"
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Main Wizard Form Card */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="border-b border-border/40">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            {step === 1 && <UserIcon className="size-5 text-primary" />}
            {step === 2 && <ShoppingBagIcon className="size-5 text-primary" />}
            {step === 3 && <FileTextIcon className="size-5 text-primary" />}
            {step === 1 && "1. Identificación del Consumidor Reclamante"}
            {step === 2 && "2. Identificación del Bien Contratado"}
            {step === 3 && "3. Detalle de la Reclamación y Pedido"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Ingresa tus datos personales de contacto para poder notificarte la respuesta."}
            {step === 2 && "Describe el producto o servicio que adquiriste de nuestra empresa."}
            {step === 3 && "Detalla detalladamente el inconveniente y lo que solicitas como solución."}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {/* STEP 1: CONSUMER INFO */}
          {step === 1 && (
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.name} className="sm:col-span-2">
                <FieldLabel htmlFor="claimant-name">Nombres y Apellidos Completos</FieldLabel>
                <Input 
                  id="claimant-name" 
                  placeholder="Juan Pérez García" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>

              <Field className="sm:col-span-2 flex items-center gap-2 space-y-0 p-3 bg-muted/40 rounded-lg border border-border/20">
                <Checkbox 
                  id="claimant-underage" 
                  checked={underAge} 
                  onCheckedChange={(checked) => setUnderAge(!!checked)} 
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="claimant-underage" className="text-xs font-semibold text-foreground cursor-pointer flex items-center gap-1.5">
                    Soy menor de edad
                  </label>
                  <p className="text-[10px] text-muted-foreground">
                    En caso de ser menor de edad, debes ingresar los datos del padre, madre o tutor legal.
                  </p>
                </div>
              </Field>

              {underAge && (
                <Field data-invalid={!!errors.parentName} className="sm:col-span-2">
                  <FieldLabel htmlFor="claimant-parent">Nombres del Padre/Madre o Tutor Apoderado</FieldLabel>
                  <Input 
                    id="claimant-parent" 
                    placeholder="María García López (Tutor Apoderado)" 
                    value={parentName} 
                    onChange={(e) => setParentName(e.target.value)} 
                  />
                  {errors.parentName && <FieldError>{errors.parentName}</FieldError>}
                </Field>
              )}

              <Field data-invalid={!!errors.documentTypeId}>
                <FieldLabel htmlFor="claimant-doctype">Tipo de Documento</FieldLabel>
                <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
                  <SelectTrigger id="claimant-doctype">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((dt) => (
                      <SelectItem key={dt.id} value={dt.id.toString()}>
                        {dt.name} ({dt.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.documentTypeId && <FieldError>{errors.documentTypeId}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.documentNumber}>
                <FieldLabel htmlFor="claimant-docnum">Número de Documento</FieldLabel>
                <Input 
                  id="claimant-docnum" 
                  placeholder="45678901" 
                  value={documentNumber} 
                  onChange={(e) => setDocumentNumber(e.target.value)} 
                />
                {errors.documentNumber && <FieldError>{errors.documentNumber}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="claimant-email">Correo Electrónico (Notificación)</FieldLabel>
                <Input 
                  id="claimant-email" 
                  type="email" 
                  placeholder="juan.perez@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="claimant-phone">Teléfono / Celular</FieldLabel>
                <Input 
                  id="claimant-phone" 
                  placeholder="987654321" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                />
                {errors.phone && <FieldError>{errors.phone}</FieldError>}
              </Field>
            </FieldGroup>
          )}

          {/* STEP 2: ASSET INFO */}
          {step === 2 && (
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Tipo de Bien Contratado</FieldLabel>
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant={typeAsset === "Producto" ? "default" : "outline"}
                    className="flex-1 cursor-pointer font-semibold"
                    onClick={() => setTypeAsset("Producto")}
                  >
                    Producto
                  </Button>
                  <Button 
                    type="button"
                    variant={typeAsset === "Servicio" ? "default" : "outline"}
                    className="flex-1 cursor-pointer font-semibold"
                    onClick={() => setTypeAsset("Servicio")}
                  >
                    Servicio
                  </Button>
                </div>
              </Field>

              <Field data-invalid={!!errors.descriptionAsset}>
                <FieldLabel htmlFor="asset-desc">Descripción del Producto o Servicio Adquirido</FieldLabel>
                <Textarea 
                  id="asset-desc" 
                  placeholder="Describe la marca, modelo, código de compra, contrato o características del bien adquirido..."
                  rows={4}
                  value={descriptionAsset}
                  onChange={(e) => setDescriptionAsset(e.target.value)}
                />
                {errors.descriptionAsset && <FieldError>{errors.descriptionAsset}</FieldError>}
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="asset-currency">Moneda (Opcional)</FieldLabel>
                  <Select value={currencyTypeId} onValueChange={setCurrencyTypeId}>
                    <SelectTrigger id="asset-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id.toString()}>
                          {ct.name} ({ct.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="asset-amount">Monto Reclamado (Opcional)</FieldLabel>
                  <Input 
                    id="asset-amount" 
                    type="number" 
                    step="0.01" 
                    placeholder="150.00" 
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          )}

          {/* STEP 3: CLAIM DETAILS */}
          {step === 3 && (
            <FieldGroup className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Tipo de Trámite</FieldLabel>
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant={claimType === "reclamo" ? "default" : "outline"}
                    className="flex-1 cursor-pointer font-semibold"
                    onClick={() => setClaimType("reclamo")}
                  >
                    Reclamo (Disconformidad relacionada al bien)
                  </Button>
                  <Button 
                    type="button"
                    variant={claimType === "queja" ? "default" : "outline"}
                    className="flex-1 cursor-pointer font-semibold"
                    onClick={() => setClaimType("queja")}
                  >
                    Queja (Malestar sobre la atención al cliente)
                  </Button>
                </div>
              </Field>

              <Field data-invalid={!!errors.claimText}>
                <FieldLabel htmlFor="claim-text">Detalle y Hechos Reclamados</FieldLabel>
                <Textarea 
                  id="claim-text" 
                  placeholder="Detalla de forma cronológica los hechos ocurridos..."
                  rows={5}
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                />
                {errors.claimText && <FieldError>{errors.claimText}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.requestText}>
                <FieldLabel htmlFor="claim-req">Pedido Concreto del Consumidor</FieldLabel>
                <Textarea 
                  id="claim-req" 
                  placeholder="Escribe qué solución, compensación o respuesta esperas obtener..."
                  rows={4}
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                />
                {errors.requestText && <FieldError>{errors.requestText}</FieldError>}
              </Field>
            </FieldGroup>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/40 p-6 flex justify-between gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleBack} 
            disabled={step === 1 || loading}
            className="cursor-pointer"
          >
            <ArrowLeftIcon className="mr-2 size-4" data-icon="inline-start" />
            Atrás
          </Button>

          {step < 3 ? (
            <Button type="button" onClick={handleNext} className="font-semibold cursor-pointer">
              Siguiente
              <ArrowRightIcon className="ml-2 size-4" data-icon="inline-end" />
            </Button>
          ) : (
            <Button 
              type="button" 
              onClick={handleSubmit} 
              disabled={loading}
              className="font-semibold cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" />
                  Registrando Reclamo...
                </>
              ) : (
                "Registrar Reclamo Oficial"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Toaster position="top-right" />
    </div>
  );
}
