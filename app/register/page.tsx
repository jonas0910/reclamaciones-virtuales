"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Building2Icon, Loader2Icon } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [ruc, setRuc] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validations
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "El nombre de contacto es requerido";
    if (!ruc) {
      newErrors.ruc = "El RUC es requerido";
    } else if (ruc.length !== 11 || !/^\d+$/.test(ruc)) {
      newErrors.ruc = "El RUC debe tener 11 dígitos numéricos";
    }
    if (!companyName) newErrors.companyName = "La Razón Social es requerida";
    if (!companyAddress) newErrors.companyAddress = "La dirección fiscal es requerida";
    if (!email) newErrors.email = "El correo electrónico es requerido";
    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_ruc: ruc,
            company_name: companyName,
            company_address: companyAddress,
          },
        },
      });

      if (error) {
        toast.error(error.message || "Error al registrar la cuenta.");
      } else {
        toast.success("Cuenta creada exitosamente. Redirigiendo al dashboard...");
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado al registrar la cuenta.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute -top-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      <Card className="w-full max-w-lg border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="flex flex-col items-center text-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Building2Icon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Registro de Empresa</CardTitle>
          <CardDescription>Crea un perfil para gestionar el Libro de Reclamaciones de tu negocio</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister}>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field data-invalid={!!errors.name} className="md:col-span-2">
                <FieldLabel htmlFor="name">Nombre de Administrador / Contacto</FieldLabel>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
                {errors.name && <FieldError>{errors.name}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.ruc}>
                <FieldLabel htmlFor="ruc">RUC de la Empresa (11 dígitos)</FieldLabel>
                <Input
                  id="ruc"
                  placeholder="20123456789"
                  maxLength={11}
                  value={ruc}
                  onChange={(e) => setRuc(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
                {errors.ruc && <FieldError>{errors.ruc}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.companyName}>
                <FieldLabel htmlFor="companyName">Razón Social</FieldLabel>
                <Input
                  id="companyName"
                  placeholder="Mi Empresa S.A.C."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
                {errors.companyName && <FieldError>{errors.companyName}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.companyAddress} className="md:col-span-2">
                <FieldLabel htmlFor="companyAddress">Dirección Fiscal de la Empresa</FieldLabel>
                <Input
                  id="companyAddress"
                  placeholder="Av. Larco 123, Miraflores, Lima"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  disabled={loading}
                />
                {errors.companyAddress && <FieldError>{errors.companyAddress}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Correo Electrónico de Usuario</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Contraseña (Mínimo 6 caracteres)</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                {errors.password && <FieldError>{errors.password}</FieldError>}
              </Field>
            </FieldGroup>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full font-semibold cursor-pointer" disabled={loading}>
              {loading ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" data-icon="inline-start" />
                  Creando cuenta...
                </>
              ) : (
                "Registrar Empresa"
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster position="top-right" />
    </div>
  );
}
