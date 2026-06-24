"use client";

import React, { useState } from "react";
import { crearPaginaSeleccion } from "./actions";
import { Establishment } from "@/lib/core/entities/establishment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import LogoUpload from "@/components/ui/logo-upload";
import { uploadLogo } from "@/lib/supabase/storage";

interface SelectionPageFormProps {
  establishments: Establishment[];
}

export default function SelectionPageForm({ establishments }: SelectionPageFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!brandName.trim()) {
      newErrors.brandName = "El nombre comercial de la marca es obligatorio.";
    }
    if (!customLink.trim()) {
      newErrors.customLink = "El enlace personalizado es obligatorio.";
    }
    if (selectedIds.length === 0) {
      newErrors.establishments = "Debe elegir al menos un local.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let finalLogoUrl = logoUrl;
      if (logoFile) {
        finalLogoUrl = await uploadLogo(logoFile);
      }

      const res = await crearPaginaSeleccion(
        brandName,
        customLink,
        finalLogoUrl || null,
        selectedIds
      );

      if (res.success) {
        toast.success("Página de selección creada exitosamente.");
        setBrandName("");
        setCustomLink("");
        setLogoUrl("");
        setLogoFile(null);
        setSelectedIds([]);
        setOpen(false);
      } else {
        toast.error(res.error || "Ocurrió un error al crear la página.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer font-semibold" disabled={establishments.length === 0}>
          <PlusIcon className="mr-2 size-4" data-icon="inline-start" /> Nueva Página Selección
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-border/40 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Página de Selección</DialogTitle>
          <DialogDescription>
            Crea un portal donde los clientes pueden elegir a qué local físico o tienda online dirigir su reclamo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4 flex flex-col gap-4">
            <Field data-invalid={!!errors.brandName}>
              <FieldLabel htmlFor="brand-name">Nombre Comercial / Grupo</FieldLabel>
              <Input
                id="brand-name"
                placeholder="ej. La Nona"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
              {errors.brandName && <FieldError>{errors.brandName}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.customLink}>
              <FieldLabel htmlFor="custom-link">Enlace Personalizado (Slug)</FieldLabel>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground select-none">/grupos/</span>
                <Input
                  id="custom-link"
                  placeholder="ej. la-nona-restaurantes"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                />
              </div>
              {errors.customLink && <FieldError>{errors.customLink}</FieldError>}
            </Field>

            <Field>
              <FieldLabel>Logotipo del Grupo (Opcional)</FieldLabel>
              <LogoUpload
                value={logoUrl}
                onChange={(url, file) => {
                  setLogoUrl(url);
                  setLogoFile(file);
                }}
                disabled={loading}
                uploading={loading && !!logoFile}
              />
            </Field>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-semibold text-foreground">
                Selecciona los Establecimientos Asociados
              </span>
              {errors.establishments && (
                <span className="text-[11px] font-medium text-destructive">{errors.establishments}</span>
              )}
              <div className="grid grid-cols-1 gap-2 border border-border/40 rounded-xl p-3 bg-muted/20 max-h-[160px] overflow-y-auto">
                {establishments.map((est) => (
                  <div key={est.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`chk-${est.id}`}
                      checked={selectedIds.includes(est.id)}
                      onCheckedChange={(checked) => handleCheckboxChange(est.id, !!checked)}
                    />
                    <label
                      htmlFor={`chk-${est.id}`}
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground cursor-pointer select-none"
                    >
                      {est.name} ({est.type_address})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="font-semibold cursor-pointer">
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" /> Guardando...
                </>
              ) : (
                "Crear Página"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
