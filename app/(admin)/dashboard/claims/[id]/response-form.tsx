"use client";

import React, { useState } from "react";
import { responderReclamo } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";

interface ResponseFormProps {
  claimId: string;
}

export default function ResponseForm({ claimId }: ResponseFormProps) {
  const [answer, setAnswer] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("La respuesta es obligatoria.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await responderReclamo(claimId, answer, internalNotes);
      if (res.success) {
        toast.success("Respuesta guardada y enviada correctamente.");
      } else {
        toast.error(res.error || "Ocurrió un error al enviar la respuesta.");
      }
    } catch (err) {
      toast.error("Error al procesar la respuesta.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6 p-6 bg-card rounded-xl border border-border/40">
      <h3 className="font-semibold text-lg text-foreground">Responder al Reclamo</h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Al enviar esta respuesta, se cambiará el estado a &quot;respondido&quot; y se enviará una notificación al cliente. Esta acción es definitiva.
      </p>
      
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="answer">Respuesta Oficial (Será enviada al cliente)</FieldLabel>
          <Textarea
            id="answer"
            placeholder="Escribe la respuesta formal y oficial de la empresa..."
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={loading}
          />
          {error && <FieldError>{error}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="internalNotes">Notas Internas (Solo visible para la empresa)</FieldLabel>
          <Textarea
            id="internalNotes"
            placeholder="Anotaciones internas sobre el caso..."
            rows={3}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            disabled={loading}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" disabled={loading} className="cursor-pointer">
          {loading ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" />
              Guardando...
            </>
          ) : (
            <>
              <SendIcon className="mr-2 size-4" data-icon="inline-start" />
              Enviar Respuesta Oficial
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
