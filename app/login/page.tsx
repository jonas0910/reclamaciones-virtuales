"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { ShieldCheckIcon, Loader2Icon } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Simple validation
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "El correo electrónico es requerido";
    if (!password) newErrors.password = "La contraseña es requerida";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      } else {
        toast.success("Sesión iniciada con éxito. Redirigiendo...");
        router.refresh();
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado al iniciar sesión.");
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

      <Card className="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="flex flex-col items-center text-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Libro de Reclamaciones</CardTitle>
          <CardDescription>Accede al panel de control de tu empresa</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  disabled={loading}
                />
                {errors.email && <FieldError>{errors.email}</FieldError>}
              </Field>

              <Field data-invalid={!!errors.password}>
                <div className="flex items-center justify-between w-full">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
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
                  Iniciando sesión...
                </>
              ) : (
                "Ingresar al Dashboard"
              )}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
      
      <Toaster position="top-right" />
    </div>
  );
}
