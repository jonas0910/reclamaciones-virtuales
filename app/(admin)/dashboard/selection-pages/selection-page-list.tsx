"use client";

import React, { useState } from "react";
import { eliminarPaginaSeleccion, editarPaginaSeleccion } from "./actions";
import { SelectionPage } from "@/lib/core/entities/selection-page";
import { Establishment } from "@/lib/core/entities/establishment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2Icon, Loader2Icon, LayersIcon, ExternalLinkIcon, PencilIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import LogoUpload from "@/components/ui/logo-upload";
import { uploadLogo } from "@/lib/supabase/storage";

interface SelectionPageListProps {
  pages: SelectionPage[];
  establishments: Establishment[];
}

export default function SelectionPageList({ pages, establishments }: SelectionPageListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit states
  const [editingPage, setEditingPage] = useState<SelectionPage | null>(null);
  const [editBrandName, setEditBrandName] = useState("");
  const [editCustomLink, setEditCustomLink] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editSelectedIds, setEditSelectedIds] = useState<string[]>([]);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta página de selección?")) return;

    setDeletingId(id);

    try {
      const res = await eliminarPaginaSeleccion(id);
      if (res.success) {
        toast.success("Página eliminada exitosamente.");
      } else {
        toast.error(res.error || "No se pudo eliminar la página.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (page: SelectionPage) => {
    setEditingPage(page);
    setEditBrandName(page.brand_name || "");
    setEditCustomLink(page.custom_link);
    setEditLogoUrl(page.logo_url || "");
    setEditLogoFile(null);
    const ids = (page.establishments || []).map(e => e.id);
    setEditSelectedIds(ids);
    setEditErrors({});
  };

  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (checked) {
      setEditSelectedIds((prev) => [...prev, id]);
    } else {
      setEditSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const newErrors: Record<string, string> = {};
    if (!editBrandName.trim()) {
      newErrors.brandName = "El nombre comercial de la marca es obligatorio.";
    }
    if (!editCustomLink.trim()) {
      newErrors.customLink = "El enlace personalizado es obligatorio.";
    }
    if (editSelectedIds.length === 0) {
      newErrors.establishments = "Debe elegir al menos un local.";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditLoading(true);
    setEditErrors({});

    try {
      let finalLogoUrl = editLogoUrl;
      if (editLogoFile) {
        finalLogoUrl = await uploadLogo(editLogoFile);
      }

      const res = await editarPaginaSeleccion(
        editingPage.id,
        editBrandName,
        editCustomLink,
        finalLogoUrl || null,
        editSelectedIds
      );

      if (res.success) {
        toast.success("Página de selección actualizada exitosamente.");
        setEditingPage(null);
      } else {
        toast.error(res.error || "Ocurrió un error al actualizar la página.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/40 text-center gap-3">
        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <LayersIcon className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-base text-foreground">Sin Páginas de Selección</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Configura una landing page grupal para redirigir a los clientes a diferentes locales o sucursales físicas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border/40 rounded-2xl bg-card/60 backdrop-blur-xl overflow-hidden shadow-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Comercial</TableHead>
            <TableHead>Enlace de Selección</TableHead>
            <TableHead>Locales Vinculados</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-semibold text-foreground flex items-center gap-2">
                <LayersIcon className="size-4 text-muted-foreground" />
                {row.brand_name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">/grupos/{row.custom_link}</span>
                  <Link href={`/grupos/${row.custom_link}`} target="_blank">
                    <Button variant="outline" size="icon" className="size-6 cursor-pointer">
                      <ExternalLinkIcon className="size-3" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(row.establishments || []).map((est) => (
                    <Badge key={est.id} variant="secondary" className="text-[10px]">
                      {est.name}
                    </Badge>
                  ))}
                  {(row.establishments || []).length === 0 && (
                    <span className="text-xs text-muted-foreground">Sin locales asociados</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-slate-100 hover:text-foreground cursor-pointer"
                    onClick={() => handleStartEdit(row)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={() => handleDelete(row.id)}
                    disabled={deletingId === row.id}
                  >
                    {deletingId === row.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <Trash2Icon className="size-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Modal de Edición de Página de Selección */}
      <Dialog open={!!editingPage} onOpenChange={(open) => !open && setEditingPage(null)}>
        <DialogContent className="sm:max-w-[500px] border-border/40 bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Página de Selección</DialogTitle>
            <DialogDescription>
              Modifica el portal grupal de redirección y cambia los locales que deseas asociar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <FieldGroup className="py-4 flex flex-col gap-4">
              <Field data-invalid={!!editErrors.brandName}>
                <FieldLabel htmlFor="edit-brand-name">Nombre Comercial / Grupo</FieldLabel>
                <Input
                  id="edit-brand-name"
                  placeholder="ej. La Nona"
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                />
                {editErrors.brandName && <FieldError>{editErrors.brandName}</FieldError>}
              </Field>

              <Field data-invalid={!!editErrors.customLink}>
                <FieldLabel htmlFor="edit-custom-link">Enlace Personalizado (Slug)</FieldLabel>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground select-none">/grupos/</span>
                  <Input
                    id="edit-custom-link"
                    placeholder="ej. la-nona-restaurantes"
                    value={editCustomLink}
                    onChange={(e) => setEditCustomLink(e.target.value)}
                  />
                </div>
                {editErrors.customLink && <FieldError>{editErrors.customLink}</FieldError>}
              </Field>

              <Field>
                <FieldLabel>Logotipo del Grupo (Opcional)</FieldLabel>
                <LogoUpload
                  value={editLogoUrl}
                  onChange={(url, file) => {
                    setEditLogoUrl(url);
                    setEditLogoFile(file);
                  }}
                  disabled={editLoading}
                  uploading={editLoading && !!editLogoFile}
                />
              </Field>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-xs font-semibold text-foreground">
                  Selecciona los Establecimientos Asociados
                </span>
                {editErrors.establishments && (
                  <span className="text-[11px] font-medium text-destructive">{editErrors.establishments}</span>
                )}
                <div className="grid grid-cols-1 gap-2 border border-border/40 rounded-xl p-3 bg-muted/20 max-h-[160px] overflow-y-auto">
                  {establishments.map((est) => (
                    <div key={est.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`edit-chk-${est.id}`}
                        checked={editSelectedIds.includes(est.id)}
                        onCheckedChange={(checked) => handleCheckboxChange(est.id, !!checked)}
                      />
                      <label
                        htmlFor={`edit-chk-${est.id}`}
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
                onClick={() => setEditingPage(null)}
                disabled={editLoading}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={editLoading} className="font-semibold cursor-pointer">
                {editLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

