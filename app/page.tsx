import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheckIcon, 
  ArrowRightIcon, 
  FileTextIcon, 
  CheckCircle2Icon, 
  Building2Icon,
  SearchIcon
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-between overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute -top-40 -left-40 size-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 size-80 rounded-full bg-primary/10 blur-3xl" />

      {/* Header / Navbar */}
      <header className="flex h-20 items-center justify-between px-6 md:px-12 border-b border-border/20 backdrop-blur-md bg-background/30 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheckIcon className="size-5" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Reclamaciones Virtual</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/consulta">
            <Button variant="ghost" className="text-sm font-semibold cursor-pointer">
              Consultar Estado
            </Button>
          </Link>
          <Link href="/login">
            <Button className="font-semibold cursor-pointer">
              Portal Empresas
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto gap-8 relative">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
          <CheckCircle2Icon className="size-3.5" /> Cumple con la Normativa INDECOPI
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-3xl">
          El Libro de Reclamaciones <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">Digital</span> para tu Empresa
        </h1>
        
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
          Centraliza, gestiona y responde quejas y reclamos de manera 100% legal, automatizada y en segundos. Ideal para locales físicos y tiendas e-commerce.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link href="/register" className="flex-1">
            <Button className="w-full h-12 text-base font-semibold cursor-pointer shadow-lg hover:shadow-primary/20">
              Registrar mi Empresa <ArrowRightIcon className="ml-2 size-4" data-icon="inline-end" />
            </Button>
          </Link>
          <Link href="/consulta" className="flex-1">
            <Button variant="outline" className="w-full h-12 text-base font-semibold cursor-pointer border-border/60 hover:bg-muted/40">
              <SearchIcon className="mr-2 size-4" data-icon="inline-start" /> Consultar Reclamo
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2Icon className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Multi-Establecimiento</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Crea libros virtuales únicos para cada una de tus tiendas físicas o e-commerce y adminístralos en un solo lugar.
            </p>
          </div>

          <div className="p-6 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileTextIcon className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Numeración Anual</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Genera códigos consecutivos automáticos por año y por local comercial de manera concurrente e infalsificable.
            </p>
          </div>

          <div className="p-6 bg-card/40 border border-border/40 rounded-2xl backdrop-blur-md flex flex-col gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheckIcon className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Alineado a INDECOPI</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mapea datos de menores de edad, bienes contratados y mantiene un flujo de respuesta cerrado de 15 días hábiles.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-primary" />
          <span>&copy; {new Date().getFullYear()} Reclamaciones Virtual. Todos los derechos reservados.</span>
        </div>
        <div className="flex gap-4">
          <Link href="/consulta" className="hover:underline">Consultar Reclamo</Link>
          <Link href="/login" className="hover:underline">Portal Empresa</Link>
        </div>
      </footer>
    </div>
  );
}
