"use client";

import React, { useState } from "react";
import { createEstablishment } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export default function EstablishmentForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [typeAddress, setTypeAddress] = useState<"Fisico" | "Virtual">("Fisico");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [department, setDepartment] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [webPage, setWebPage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validations
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "El nombre es requerido";
    if (!customLink) {
      newErrors.customLink = "El enlace personalizado es requerido";
    } else if (!/^[a-z0-9-]+$/.test(customLink)) {
      newErrors.customLink = "Solo minúsculas, números y guiones (ej. miraflores-digital)";
    }
    
    if (typeAddress === "Fisico") {
      if (!address) newErrors.address = "La dirección física es requerida";
    } else {
      if (!webPage) newErrors.webPage = "La URL de la página web es requerida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await createEstablishment({
        name,
        custom_link: customLink,
        type_address: typeAddress,
        code,
        address: typeAddress === "Fisico" ? address : undefined,
        department: typeAddress === "Fisico" ? department : undefined,
        province: typeAddress === "Fisico" ? province : undefined,
        district: typeAddress === "Fisico" ? district : undefined,
        zip_code: typeAddress === "Fisico" ? zipCode : undefined,
        web_page: typeAddress === "Virtual" ? webPage : undefined,
      });

      if (res.success) {
        toast.success("Establecimiento registrado con éxito.");
        setOpen(false);
        // Reset form
        setName("");
        setCustomLink("");
        setCode("");
        setAddress("");
        setDepartment("");
        setProvince("");
        setDistrict("");
        setZipCode("");
        setWebPage("");
      } else {
        toast.error(res.error || "Ocurrió un error al registrar el establecimiento.");
      }
    } catch (err) {
      toast.error("Error al registrar el establecimiento.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-semibold cursor-pointer">
          <PlusIcon className="mr-2 size-4" data-icon="inline-start" />
          Agregar Establecimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl border-border/40 bg-card/90 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Nuevo Establecimiento</DialogTitle>
          <DialogDescription>
            Registra una sucursal física o canal virtual para personalizar sus libros de reclamación.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="est-name">Nombre del Local / Canal</FieldLabel>
              <Input
                id="est-name"
                placeholder="Sede Miraflores o Tienda E-commerce"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  // Auto slugify name if slug is empty or matches name
                  const slug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                  setCustomLink(slug);
                }}
                disabled={loading}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.customLink}>
              <FieldLabel htmlFor="est-slug">Enlace Corto (slug)</FieldLabel>
              <Input
                id="est-slug"
                placeholder="miraflores-digital"
                value={customLink}
                onChange={(e) => setCustomLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                disabled={loading}
              />
              {errors.customLink && <FieldError>{errors.customLink}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="est-type">Tipo de Establecimiento</FieldLabel>
              <Select
                value={typeAddress}
                onValueChange={(val: "Fisico" | "Virtual") => setTypeAddress(val)}
                disabled={loading}
              >
                <SelectTrigger id="est-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fisico">Físico (Local comercial)</SelectItem>
                  <SelectItem value="Virtual">Virtual (Web / E-commerce)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="est-code">Código Establecimiento (SUNAT)</FieldLabel>
              <Input
                id="est-code"
                placeholder="0001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={loading}
              />
            </Field>

            {typeAddress === "Fisico" ? (
              <>
                <Field data-invalid={!!errors.address} className="sm:col-span-2">
                  <FieldLabel htmlFor="est-address">Dirección Física</FieldLabel>
                  <Input
                    id="est-address"
                    placeholder="Av. Larco 743, Oficina 401"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={loading}
                  />
                  {errors.address && <FieldError>{errors.address}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="est-dept">Departamento</FieldLabel>
                  <Input
                    id="est-dept"
                    placeholder="Lima"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="est-prov">Provincia</FieldLabel>
                  <Input
                    id="est-prov"
                    placeholder="Lima"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="est-dist">Distrito</FieldLabel>
                  <Input
                    id="est-dist"
                    placeholder="Miraflores"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={loading}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="est-zip">Código Postal</FieldLabel>
                  <Input
                    id="est-zip"
                    placeholder="15074"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    disabled={loading}
                  />
                </Field>
              </>
            ) : (
              <Field data-invalid={!!errors.webPage} className="sm:col-span-2">
                <FieldLabel htmlFor="est-web">URL del Sitio Web (E-commerce)</FieldLabel>
                <Input
                  id="est-web"
                  type="url"
                  placeholder="https://www.tienda.com"
                  value={webPage}
                  onChange={(e) => setWebPage(e.target.value)}
                  disabled={loading}
                />
                {errors.webPage && <FieldError>{errors.webPage}</FieldError>}
              </Field>
            )}
          </FieldGroup>

          <DialogFooter className="mt-4 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="cursor-pointer">
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" />
                  Guardando...
                </>
              ) : (
                "Guardar Establecimiento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
