"use client";

import React, { useState } from "react";
import { crearCategoria } from "./actions";
import { Establishment } from "@/lib/core/entities/establishment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
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

interface CategoryFormProps {
  establishments: Establishment[];
}

export default function CategoryForm({ establishments }: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [establishmentId, setEstablishmentId] = useState("all");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrors({ name: "El nombre de la categoría es obligatorio." });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const estId = establishmentId === "all" ? null : establishmentId;
      const res = await crearCategoria(name, estId);

      if (res.success) {
        toast.success("Categoría registrada correctamente.");
        setName("");
        setEstablishmentId("all");
        setOpen(false);
      } else {
        toast.error(res.error || "Ocurrió un error al registrar la categoría.");
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
        <Button className="cursor-pointer font-semibold">
          <PlusIcon className="mr-2 size-4" data-icon="inline-start" /> Nueva Categoría
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Nueva Categoría de Reclamo</DialogTitle>
          <DialogDescription>
            Clasifica las quejas y reclamos internamente (ej. "Atención al Cliente", "Delivery", "Facturación").
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4 flex flex-col gap-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="category-name">Nombre de la Categoría</FieldLabel>
              <Input
                id="category-name"
                placeholder="ej. Facturación e Impuestos"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="category-est">Establecimiento Asociado (Opcional)</FieldLabel>
              <Select value={establishmentId} onValueChange={setEstablishmentId}>
                <SelectTrigger id="category-est">
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
                "Guardar Categoría"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
