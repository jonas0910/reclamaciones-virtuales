"use client";

import React, { useState } from "react";
import { eliminarAlertaEmail } from "./actions";
import { NotificationEmail } from "@/lib/core/entities/notification-email";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2Icon, Loader2Icon, MailIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

interface AlertListProps {
  emails: NotificationEmail[];
}

export default function AlertList({ emails }: AlertListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta alerta de correo?")) return;

    setDeletingId(id);

    try {
      const res = await eliminarAlertaEmail(id);
      if (res.success) {
        toast.success("Alerta eliminada correctamente.");
      } else {
        toast.error(res.error || "No se pudo eliminar la alerta.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servidor.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/40 text-center gap-3">
        <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <MailIcon className="size-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-base text-foreground">Sin Alertas de Correo</h3>
          <p className="text-xs text-muted-foreground max-w-xs">
            Registra una dirección de correo para recibir notificaciones cuando se presenten nuevos reclamos en tus locales.
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
            <TableHead>Email de Alerta</TableHead>
            <TableHead>Establecimiento Monitoreado</TableHead>
            <TableHead>Estado de Verificación</TableHead>
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-semibold text-foreground flex items-center gap-2">
                <MailIcon className="size-4 text-muted-foreground" />
                {row.email}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {row.establishment?.name || "Cargando..."}
                </Badge>
              </TableCell>
              <TableCell>
                {row.verified ? (
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5 w-fit">
                    <CheckCircle2Icon className="size-3.5" /> Verificado
                  </Badge>
                ) : (
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5 text-xs font-semibold flex items-center gap-1.5 w-fit">
                      <XCircleIcon className="size-3.5" /> Pendiente
                    </Badge>
                    <span className="text-[9px] text-muted-foreground italic">
                      Usa el token en la DB para verificar este email
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
