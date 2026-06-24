"use client";

import React, { useState } from "react";
import { updateProfile } from "./actions";
import { Profile } from "@/lib/core/entities/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2Icon, SaveIcon, Building2Icon } from "lucide-react";
import { toast } from "sonner";
import LogoUpload from "@/components/ui/logo-upload";
import { uploadLogo } from "@/lib/supabase/storage";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(profile.name || "");
  const [companyName, setCompanyName] = useState(profile.company_name || "");
  const [companyRuc, setCompanyRuc] = useState(profile.company_ruc || "");
  const [companyAddress, setCompanyAddress] = useState(profile.company_address || "");
  const [companyPostalCode, setCompanyPostalCode] = useState(profile.company_postal_code || "");
  const [companyLink, setCompanyLink] = useState(profile.company_link || "");
  const [companyLogo, setCompanyLogo] = useState(profile.company_logo || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validations
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "El nombre del administrador es requerido";
    if (!companyName) newErrors.companyName = "La Razón Social es requerida";
    if (!companyRuc) {
      newErrors.companyRuc = "El RUC es requerido";
    } else if (companyRuc.length !== 11 || !/^\d+$/.test(companyRuc)) {
      newErrors.companyRuc = "El RUC debe tener exactamente 11 dígitos numéricos";
    }
    if (!companyAddress) newErrors.companyAddress = "La dirección fiscal es requerida";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      let finalLogoUrl = companyLogo;
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
        setCompanyLogo(finalLogoUrl);
        setLogoFile(null);
      }

      const res = await updateProfile({
        name,
        company_name: companyName,
        company_ruc: companyRuc,
        company_address: companyAddress,
        company_postal_code: companyPostalCode,
        company_link: companyLink,
        company_logo: finalLogoUrl,
      });

      if (res.success) {
        toast.success("Perfil de la empresa actualizado correctamente.");
      } else {
        toast.error(res.error || "Ocurrió un error al actualizar el perfil.");
      }
    } catch (err) {
      toast.error("Error al guardar cambios.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-md max-w-3xl">
      <CardHeader className="flex flex-row items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Building2Icon className="size-5" />
        </div>
        <div>
          <CardTitle className="text-lg font-bold">Datos Generales de la Empresa</CardTitle>
          <CardDescription>Esta información aparecerá en las cabeceras de tus Libros de Reclamaciones.</CardDescription>
        </div>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 flex flex-col gap-6">
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.name} className="sm:col-span-2">
              <FieldLabel htmlFor="profile-name">Nombre de Contacto / Administrador</FieldLabel>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.companyName}>
              <FieldLabel htmlFor="profile-comp-name">Razón Social</FieldLabel>
              <Input
                id="profile-comp-name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
              />
              {errors.companyName && <FieldError>{errors.companyName}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.companyRuc}>
              <FieldLabel htmlFor="profile-ruc">RUC (11 dígitos)</FieldLabel>
              <Input
                id="profile-ruc"
                maxLength={11}
                value={companyRuc}
                onChange={(e) => setCompanyRuc(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
              />
              {errors.companyRuc && <FieldError>{errors.companyRuc}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.companyAddress} className="sm:col-span-2">
              <FieldLabel htmlFor="profile-address">Dirección Fiscal</FieldLabel>
              <Input
                id="profile-address"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                disabled={loading}
              />
              {errors.companyAddress && <FieldError>{errors.companyAddress}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-postal">Código Postal</FieldLabel>
              <Input
                id="profile-postal"
                value={companyPostalCode}
                onChange={(e) => setCompanyPostalCode(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="profile-link">Sitio Web Oficial</FieldLabel>
              <Input
                id="profile-link"
                placeholder="https://www.empresa.com"
                value={companyLink}
                onChange={(e) => setCompanyLink(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Logotipo de la Empresa</FieldLabel>
              <LogoUpload
                value={companyLogo}
                onChange={(url, file) => {
                  setCompanyLogo(url);
                  setLogoFile(file);
                }}
                disabled={loading}
                uploading={loading && !!logoFile}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 border-t border-border/20 pt-4 mt-2">
            <Button type="submit" disabled={loading} className="font-semibold cursor-pointer">
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" />
                  Guardando...
                </>
              ) : (
                <>
                  <SaveIcon className="mr-2 size-4" data-icon="inline-start" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
