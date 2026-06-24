"use client";

import React, { useState } from "react";
import { eliminarCategoria, editarCategoria } from "./actions";
import { ClaimCategory } from "@/lib/core/entities/claim-category";
import { Establishment } from "@/lib/core/entities/establishment";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Trash2Icon, Loader2Icon, TagIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

interface CategoryListProps {
  categories: ClaimCategory[];
  establishments: Establishment[];
}

export default function CategoryList({ categories, establishments }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<ClaimCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editEstId, setEditEstId] = useState("all");
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const getEstName = (estId?: string | null) => {
    if (!estId) return "Todos (Global)";
    const est = establishments.find((e) => e.id === estId);
    return est ? est.name : "Establecimiento no encontrado";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return;

    setDeletingId(id);

    try {
      const res = await eliminarCategoria(id);
      if (res.success) {
        toast.success("Categoría eliminada con éxito.");
      } else {
        toast.error(res.error || "No se pudo eliminar la categoría.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStartEdit = (cat: ClaimCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditEstId(cat.establishment_id || "all");
    setEditErrors({});
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    if (!editName.trim()) {
      setEditErrors({ name: "El nombre de la categoría es obligatorio." });
      return;
    }

    setEditLoading(true);
    setEditErrors({});

    try {
      const res = await editarCategoria(
        editingCategory.id,
        editName,
        editEstId === "all" ? null : editEstId
      );

      if (res.success) {
        toast.success("Categoría actualizada con éxito.");
        setEditingCategory(null);
      } else {
        toast.error(res.error || "No se pudo actualizar la categoría.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/40 text-center gap-3">
        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <TagIcon className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-base text-foreground">Sin Categorías</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Aún no has registrado ninguna categoría de reclamo. Utiliza el botón "Nueva Categoría" superior para comenzar.
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
            <TableHead>Nombre</TableHead>
            <TableHead>Establecimiento Asociado</TableHead>
            <TableHead className="w-[120px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-semibold text-foreground flex items-center gap-2">
                <TagIcon className="size-4 text-muted-foreground" />
                {cat.name}
              </TableCell>
              <TableCell>
                <Badge variant={cat.establishment_id ? "outline" : "secondary"} className="text-xs">
                  {getEstName(cat.establishment_id)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-slate-100 hover:text-foreground cursor-pointer"
                    onClick={() => handleStartEdit(cat)}
                  >
                    <PencilIcon className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                  >
                    {deletingId === cat.id ? (
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

      {/* Modal de Edición */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px] border-border/40 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Editar Categoría de Reclamo</DialogTitle>
            <DialogDescription>
              Modifica los detalles de clasificación interna de quejas y reclamos.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit}>
            <FieldGroup className="py-4 flex flex-col gap-4">
              <Field data-invalid={!!editErrors.name}>
                <FieldLabel htmlFor="edit-category-name">Nombre de la Categoría</FieldLabel>
                <Input
                  id="edit-category-name"
                  placeholder="ej. Facturación e Impuestos"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                {editErrors.name && <FieldError>{editErrors.name}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="edit-category-est">Establecimiento Asociado (Opcional)</FieldLabel>
                <Select value={editEstId} onValueChange={setEditEstId}>
                  <SelectTrigger id="edit-category-est">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Establecimientos</SelectItem>
                    {establishments.map((est) => (
                      <SelectItem key={est.id} value={est.id}>
                        {est.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
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

