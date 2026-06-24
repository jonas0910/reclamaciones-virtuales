"use client";

import React, { useState } from "react";
import { deleteEstablishment, updateEstablishment } from "./actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Establishment } from "@/lib/core/entities/establishment";
import { Profile } from "@/lib/core/entities/profile";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { 
  StoreIcon, 
  GlobeIcon, 
  CopyIcon, 
  ExternalLinkIcon, 
  Trash2Icon, 
  Loader2Icon,
  MapPinIcon,
  PencilIcon,
  QrCode as QrCodeIcon,
  Printer as PrinterIcon,
  Download as DownloadIcon
} from "lucide-react";
import { toast } from "sonner";

interface EstablishmentListProps {
  establishments: Establishment[];
  profileId: string;
  profile: Profile | null;
}

export default function EstablishmentList({ establishments, profileId, profile }: EstablishmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // QR States
  const [qrEst, setQrEst] = useState<Establishment | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  
  // Edit State
  const [editingEst, setEditingEst] = useState<Establishment | null>(null);
  const [editName, setEditName] = useState("");
  const [editCustomLink, setEditCustomLink] = useState("");
  const [editTypeAddress, setEditTypeAddress] = useState<"Fisico" | "Virtual">("Fisico");
  const [editCode, setEditCode] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editProvince, setEditProvince] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editZipCode, setEditZipCode] = useState("");
  const [editWebPage, setEditWebPage] = useState("");
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  const handleCopyLink = (slug: string) => {
    const origin = window.location.origin;
    const link = `${origin}/reclamo-virtual/${profileId}/${slug}`;
    navigator.clipboard.writeText(link);
    toast.success("Enlace del libro virtual copiado al portapapeles.");
  };

  const handleOpenQr = async (est: Establishment) => {
    setQrEst(est);
    const origin = window.location.origin;
    const link = `${origin}/reclamo-virtual/${profileId}/${est.custom_link}`;
    try {
      const url = await QRCode.toDataURL(link, { margin: 2, width: 300 });
      setQrCodeUrl(url);
    } catch (err) {
      console.error("Error generating QR code:", err);
      toast.error("Error al generar el código QR.");
    }
  };

  const handleDownloadQr = () => {
    if (!qrEst || !qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `qr-libro-${qrEst.custom_link}.png`;
    a.click();
  };

  const handleDownloadPDF = async (est: Establishment) => {
    setPdfLoading(est.id);
    try {
      const origin = window.location.origin;
      const link = `${origin}/reclamo-virtual/${profileId}/${est.custom_link}`;
      const qrUrl = await QRCode.toDataURL(link, { margin: 1, width: 300 });

      // Importación dinámica de react-pdf y el componente del afiche
      const { pdf } = await import("@react-pdf/renderer");
      const { EstablishmentPDFDocument } = await import("./establishment-qr-pdf");

      const companyName = profile?.company_name || "Proveedor Autorizado";
      const companyRuc = profile?.company_ruc || "N/A";

      const doc = (
        <EstablishmentPDFDocument
          establishment={est}
          qrCodeUrl={qrUrl}
          companyName={companyName}
          companyRuc={companyRuc}
          link={link}
        />
      );

      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `afiche-libro-reclamaciones-${est.custom_link}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
      toast.success("Afiche PDF descargado con éxito.");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Error al generar el afiche PDF.");
    } finally {
      setPdfLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este establecimiento? Se ocultará del sistema.")) {
      return;
    }
    setDeletingId(id);

    try {
      const res = await deleteEstablishment(id);
      if (res.success) {
        toast.success("Establecimiento eliminado correctamente.");
      } else {
        toast.error(res.error || "Ocurrió un error al eliminar el establecimiento.");
      }
    } catch (err) {
      toast.error("Error al procesar la eliminación.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (est: Establishment) => {
    setEditingEst(est);
    setEditName(est.name);
    setEditCustomLink(est.custom_link);
    setEditTypeAddress(est.type_address);
    setEditCode(est.code || "");
    setEditAddress(est.address || "");
    setEditDepartment(est.department || "");
    setEditProvince(est.province || "");
    setEditDistrict(est.district || "");
    setEditZipCode(est.zip_code || "");
    setEditWebPage(est.web_page || "");
    setEditErrors({});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEst) return;

    setEditErrors({});
    const newErrors: Record<string, string> = {};
    if (!editName) newErrors.name = "El nombre es requerido";
    if (!editCustomLink) {
      newErrors.customLink = "El enlace personalizado es requerido";
    } else if (!/^[a-z0-9-]+$/.test(editCustomLink)) {
      newErrors.customLink = "Solo minúsculas, números y guiones (ej. miraflores-digital)";
    }
    
    if (editTypeAddress === "Fisico") {
      if (!editAddress) newErrors.address = "La dirección física es requerida";
    } else {
      if (!editWebPage) newErrors.webPage = "La URL de la página web es requerida";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditLoading(true);

    try {
      const res = await updateEstablishment(editingEst.id, {
        name: editName,
        custom_link: editCustomLink,
        type_address: editTypeAddress,
        code: editCode,
        address: editTypeAddress === "Fisico" ? editAddress : undefined,
        department: editTypeAddress === "Fisico" ? editDepartment : undefined,
        province: editTypeAddress === "Fisico" ? editProvince : undefined,
        district: editTypeAddress === "Fisico" ? editDistrict : undefined,
        zip_code: editTypeAddress === "Fisico" ? editZipCode : undefined,
        web_page: editTypeAddress === "Virtual" ? editWebPage : undefined,
      });

      if (res.success) {
        toast.success("Establecimiento actualizado con éxito.");
        setEditingEst(null);
      } else {
        toast.error(res.error || "Ocurrió un error al actualizar el establecimiento.");
      }
    } catch (err) {
      toast.error("Error al actualizar el establecimiento.");
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  if (establishments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border/40 text-center">
        <StoreIcon className="size-10 text-muted-foreground mb-4 opacity-55" />
        <h4 className="font-semibold text-lg text-foreground">No tienes establecimientos creados</h4>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Crea tu primer establecimiento (físico o virtual) para generar un enlace único de Libro de Reclamaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {establishments.map((est) => {
          const isFisico = est.type_address === "Fisico";
          return (
            <Card key={est.id} className="border-border/40 bg-card/60 backdrop-blur-md flex flex-col justify-between hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isFisico ? (
                        <StoreIcon className="size-4 text-primary shrink-0" />
                      ) : (
                        <GlobeIcon className="size-4 text-sky-500 shrink-0" />
                      )}
                      <CardTitle className="text-base font-bold truncate text-foreground">{est.name}</CardTitle>
                    </div>
                    {est.code && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        Código SUNAT: {est.code}
                      </span>
                    )}
                  </div>

                  <Badge 
                    variant={isFisico ? "default" : "secondary"}
                    className="font-semibold text-[10px] uppercase shrink-0"
                  >
                    {isFisico ? "Físico" : "Virtual"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3 text-xs text-muted-foreground flex flex-col gap-2">
                {isFisico ? (
                  <div className="flex items-start gap-1.5">
                    <MapPinIcon className="size-3.5 shrink-0 mt-0.5 text-primary" />
                    <span>
                      {est.address}
                      {(est.district || est.province || est.department) && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          {est.district}, {est.province} - {est.department}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 truncate">
                    <GlobeIcon className="size-3.5 shrink-0 text-sky-500" />
                    <a 
                      href={est.web_page || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline text-primary truncate"
                    >
                      {est.web_page || "No especificado"}
                    </a>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-3 border-t border-border/20 flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyLink(est.custom_link)}
                    className="h-8 text-xs cursor-pointer border-border/50"
                  >
                    <CopyIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                    Copiar Enlace
                  </Button>
                  <a 
                    href={`/reclamo-virtual/${profileId}/${est.custom_link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer border-border/50">
                      <ExternalLinkIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                      Ver Libro
                  </Button>
                  </a>
                </div>

                <div className="flex gap-1.5">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-foreground border-border/50 cursor-pointer"
                    onClick={() => handleOpenQr(est)}
                    title="Ver Código QR"
                  >
                    <QrCodeIcon className="size-3.5" />
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-foreground border-border/50 cursor-pointer"
                    onClick={() => handleDownloadPDF(est)}
                    disabled={pdfLoading === est.id}
                    title="Descargar Afiche PDF"
                  >
                    {pdfLoading === est.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <PrinterIcon className="size-3.5" />
                    )}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:bg-slate-100 hover:text-foreground border-border/50 cursor-pointer"
                    onClick={() => handleStartEdit(est)}
                    title="Editar Establecimiento"
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-border/50 cursor-pointer"
                    onClick={() => handleDelete(est.id)}
                    disabled={deletingId === est.id}
                    title="Eliminar Establecimiento"
                  >
                    {deletingId === est.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-3.5" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Modal de Edición de Establecimiento */}
      <Dialog open={!!editingEst} onOpenChange={(open) => !open && setEditingEst(null)}>
        <DialogContent className="max-w-xl border-border/40 bg-card/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Editar Establecimiento</DialogTitle>
            <DialogDescription>
              Actualiza la información del local físico o canal virtual.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 py-2">
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field data-invalid={!!editErrors.name}>
                <FieldLabel htmlFor="edit-est-name">Nombre del Local / Canal</FieldLabel>
                <Input
                  id="edit-est-name"
                  placeholder="Sede Miraflores o Tienda E-commerce"
                  value={editName}
                  onChange={(e) => {
                    setEditName(e.target.value);
                    if (!editCustomLink || editCustomLink === editingEst?.custom_link) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setEditCustomLink(slug);
                    }
                  }}
                  disabled={editLoading}
                />
                {editErrors.name && <FieldError>{editErrors.name}</FieldError>}
              </Field>

              <Field data-invalid={!!editErrors.customLink}>
                <FieldLabel htmlFor="edit-est-slug">Enlace Corto (slug)</FieldLabel>
                <Input
                  id="edit-est-slug"
                  placeholder="miraflores-digital"
                  value={editCustomLink}
                  onChange={(e) => setEditCustomLink(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  disabled={editLoading}
                />
                {editErrors.customLink && <FieldError>{editErrors.customLink}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-est-type">Tipo de Establecimiento</FieldLabel>
                <Select
                  value={editTypeAddress}
                  onValueChange={(val: "Fisico" | "Virtual") => setEditTypeAddress(val)}
                  disabled={editLoading}
                >
                  <SelectTrigger id="edit-est-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fisico">Físico (Local comercial)</SelectItem>
                    <SelectItem value="Virtual">Virtual (Web / E-commerce)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-est-code">Código Establecimiento (SUNAT)</FieldLabel>
                <Input
                  id="edit-est-code"
                  placeholder="0001"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  disabled={editLoading}
                />
              </Field>

              {editTypeAddress === "Fisico" ? (
                <>
                  <Field data-invalid={!!editErrors.address} className="sm:col-span-2">
                    <FieldLabel htmlFor="edit-est-address">Dirección Física</FieldLabel>
                    <Input
                      id="edit-est-address"
                      placeholder="Av. Larco 743, Oficina 401"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      disabled={editLoading}
                    />
                    {editErrors.address && <FieldError>{editErrors.address}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-est-dept">Departamento</FieldLabel>
                    <Input
                      id="edit-est-dept"
                      placeholder="Lima"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      disabled={editLoading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-est-prov">Provincia</FieldLabel>
                    <Input
                      id="edit-est-prov"
                      placeholder="Lima"
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      disabled={editLoading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-est-dist">Distrito</FieldLabel>
                    <Input
                      id="edit-est-dist"
                      placeholder="Miraflores"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      disabled={editLoading}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="edit-est-zip">Código Postal</FieldLabel>
                    <Input
                      id="edit-est-zip"
                      placeholder="15074"
                      value={editZipCode}
                      onChange={(e) => setEditZipCode(e.target.value)}
                      disabled={editLoading}
                    />
                  </Field>
                </>
              ) : (
                <Field data-invalid={!!editErrors.webPage} className="sm:col-span-2">
                  <FieldLabel htmlFor="edit-est-web">URL del Sitio Web (E-commerce)</FieldLabel>
                  <Input
                    id="edit-est-web"
                    type="url"
                    placeholder="https://www.tienda.com"
                    value={editWebPage}
                    onChange={(e) => setEditWebPage(e.target.value)}
                    disabled={editLoading}
                  />
                  {editErrors.webPage && <FieldError>{editErrors.webPage}</FieldError>}
                </Field>
              )}
            </FieldGroup>

            <DialogFooter className="mt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingEst(null)} disabled={editLoading} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={editLoading} className="cursor-pointer">
                {editLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar el Código QR */}
      <Dialog open={!!qrEst} onOpenChange={(open) => !open && setQrEst(null)}>
        <DialogContent className="max-w-md border-border/40 bg-card/90 backdrop-blur-xl flex flex-col items-center p-6 text-center">
          <DialogHeader className="w-full">
            <DialogTitle>Código QR del Libro de Reclamaciones</DialogTitle>
            <DialogDescription>
              Escanea o descarga el código QR correspondiente al establecimiento: <strong>{qrEst?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          {qrCodeUrl ? (
            <div className="my-4 border border-border/40 p-4 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <img
                src={qrCodeUrl}
                alt={`Código QR de ${qrEst?.name}`}
                className="size-56 object-contain"
              />
            </div>
          ) : (
            <div className="size-56 my-4 flex items-center justify-center bg-muted rounded-2xl border border-border/40">
              <Loader2Icon className="size-8 text-primary animate-spin" />
            </div>
          )}

          <div className="w-full flex flex-col gap-2.5 mt-2">
            <div className="text-xs text-muted-foreground break-all bg-muted/50 border border-border/40 p-2.5 rounded-xl text-left select-all">
              {qrEst ? `${window.location.origin}/reclamo-virtual/${profileId}/${qrEst.custom_link}` : ""}
            </div>

            <div className="flex gap-2 justify-end w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQrEst(null)}
                className="cursor-pointer font-semibold text-xs animate-in"
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleDownloadQr}
                className="cursor-pointer font-semibold text-xs flex items-center gap-1.5 animate-in"
              >
                <DownloadIcon className="size-3.5" />
                Descargar PNG
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

