import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseProfilesRepository } from "@/lib/infrastructure/supabase/profiles-repository";
import { 
  FileTextIcon, 
  StoreIcon, 
  UserIcon, 
  LogOutIcon, 
  MenuIcon,
  Building2Icon,
  TagIcon,
  MailIcon,
  LayersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profilesRepo = new SupabaseProfilesRepository(supabase);
  const profile = await profilesRepo.getById(user.id);

  if (!profile) {
    // If auth user exists but profile trigger failed or is not created yet, signout
    redirect("/logout");
  }

  const navLinks = [
    {
      href: "/dashboard/claims",
      label: "Reclamos",
      icon: FileTextIcon,
    },
    {
      href: "/dashboard/establishments",
      label: "Establecimientos",
      icon: StoreIcon,
    },
    {
      href: "/dashboard/categories",
      label: "Categorías",
      icon: TagIcon,
    },
    {
      href: "/dashboard/selection-pages",
      label: "Páginas Selección",
      icon: LayersIcon,
    },
    {
      href: "/dashboard/alerts",
      label: "Alertas Correo",
      icon: MailIcon,
    },
    {
      href: "/dashboard/profile",
      label: "Perfil Empresa",
      icon: UserIcon,
    },
  ];

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border/40 bg-card">
        {/* Sidebar Header */}
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/40">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2Icon className="size-5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm leading-none truncate text-foreground">
              {profile.company_name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate mt-0.5">
              RUC: {profile.company_ruc}
            </span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 mb-3 overflow-hidden">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold uppercase">
              {profile.name.substring(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-foreground truncate">{profile.name}</span>
              <span className="text-[9px] text-muted-foreground truncate uppercase">{profile.role}</span>
            </div>
          </div>
          <a href="/logout" className="w-full">
            <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border/50 cursor-pointer">
              <LogOutIcon className="mr-2 size-4" data-icon="inline-start" />
              Cerrar Sesión
            </Button>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Mobile & Desktop Bar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border/40 bg-card">
          <div className="flex items-center gap-4">
            <MobileSidebar profile={profile} />
            <h1 className="font-semibold text-lg text-foreground md:block hidden">
              Libro de Reclamaciones Virtual
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Administración de Reclamos
            </span>
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </header>

        {/* Dashboard Pages Scrollable Container */}
        <main className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
