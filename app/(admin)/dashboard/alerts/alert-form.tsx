"use client";

import React, { useState } from "react";
import { crearAlertaEmail } from "./actions";
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
import { PlusIcon, Loader2Icon, MailIcon } from "lucide-react";
import { toast } from "sonner";

interface AlertFormProps {
  establishments: Establishment[];
}

export default function AlertForm({ establishments }: AlertFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [establishmentId, setEstablishmentId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Ingrese un correo electrónico válido.";
    }
    if (!establishmentId) {
      newErrors.establishmentId = "Seleccione un establecimiento.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await crearAlertaEmail(email, establishmentId);

      if (res.success) {
        toast.success("Correo de alerta registrado. Se requiere verificación.");
        setEmail("");
        setEstablishmentId("");
        setOpen(false);
      } else {
        toast.error(res.error || "Ocurrió un error al registrar el correo.");
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
          <PlusIcon className="mr-2 size-4" data-icon="inline-start" /> Nueva Alerta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Registrar Email de Alerta</DialogTitle>
          <DialogDescription>
            Recibe avisos automáticos en tiempo real cuando un consumidor registre un reclamo en un establecimiento específico.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="py-4 flex flex-col gap-4">
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="alert-email">Correo Electrónico de Alerta</FieldLabel>
              <Input
                id="alert-email"
                type="email"
                placeholder="alertas@miempresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <FieldError>{errors.email}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.establishmentId}>
              <FieldLabel htmlFor="alert-est">Establecimiento a Monitorear</FieldLabel>
              <Select value={establishmentId} onValueChange={setEstablishmentId}>
                <SelectTrigger id="alert-est">
                  <SelectValue placeholder="Seleccionar establecimiento..." />
                </SelectTrigger>
                <SelectContent>
                  {establishments.map((est) => (
                    <SelectItem key={est.id} value={est.id}>
                      {est.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.establishmentId && <FieldError>{errors.establishmentId}</FieldError>}
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
                "Guardar Alerta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
