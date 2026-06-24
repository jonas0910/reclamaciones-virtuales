"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloudIcon, Trash2Icon, Loader2Icon, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface LogoUploadProps {
  value: string;
  onChange: (url: string, file: File | null) => void;
  disabled?: boolean;
  uploading?: boolean;
}

export default function LogoUpload({ value, onChange, disabled, uploading = false }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    // Validar tamaño máximo (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen debe pesar menos de 2MB.");
      return;
    }

    // Generar URL local temporal de previsualización
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl, file);
  };

  const handleRemove = () => {
    if (disabled || uploading) return;
    onChange("", null);
    // Limpiar input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerSelect = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 border border-border/40 p-4 rounded-2xl bg-muted/10 backdrop-blur-md w-full">
      {/* Input de tipo file oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Visualización/Preview */}
      <div className="relative size-20 rounded-xl bg-card border border-border/40 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 group">
        {value ? (
          <>
            <img
              src={value}
              alt="Logo Preview"
              className="size-full object-contain p-1"
            />
            {!(disabled || uploading) && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 hover:text-white cursor-pointer"
                  onClick={handleRemove}
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center justify-center">
            <ImageIcon className="size-6 text-muted-foreground/60" />
          </div>
        )}

        {/* Loader en caso de subida */}
        {uploading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
            <Loader2Icon className="size-5 text-primary animate-spin" />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-1.5 items-center sm:items-start text-center sm:text-left flex-1">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerSelect}
            disabled={disabled || uploading}
            className="cursor-pointer font-semibold text-xs flex items-center gap-1.5"
          >
            {uploading ? (
              <>
                <Loader2Icon className="size-3 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <UploadCloudIcon className="size-3.5" />
                {value ? "Cambiar logotipo" : "Subir logotipo"}
              </>
            )}
          </Button>

          {value && !disabled && !uploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer font-semibold text-xs"
            >
              Remover
            </Button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground max-w-xs leading-normal">
          Archivos PNG, JPG o WEBP. Tamaño máximo recomendado: 2MB.
        </p>
      </div>
    </div>
  );
}

