"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileTextIcon, 
  StoreIcon, 
  UserIcon, 
  LogOutIcon, 
  MenuIcon,
  XIcon,
  Building2Icon,
  TagIcon,
  MailIcon,
  LayersIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Profile {
  company_name: string | null;
  company_ruc: string | null;
  name: string;
  role: string;
}

export function MobileSidebar({ profile }: { profile: Profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
    <>
      {/* Trigger Button */}
      <Button 
        variant="outline" 
        size="icon" 
        className="md:hidden cursor-pointer"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menú"
      >
        <MenuIcon className="size-5" />
      </Button>

      {/* Mobile Drawer Overlay & Content */}
      <div 
        className={`fixed inset-0 z-50 md:hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop (Dark overlay with fade) */}
        <div 
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar Container with slide transition */}
        <aside 
          className={`absolute top-0 left-0 bottom-0 flex w-72 flex-col border-r border-border/40 bg-card shadow-xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-border/40">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2Icon className="size-5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="font-semibold text-sm leading-none truncate text-foreground">
                  {profile.company_name || "Mi Empresa"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate mt-0.5">
                  RUC: {profile.company_ruc || "-"}
                </span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 cursor-pointer rounded-lg hover:bg-muted"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 flex flex-col gap-1 overflow-y-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/40 bg-card/50">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 mb-3 overflow-hidden">
              <div className="size-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold uppercase">
                {profile.name.substring(0, 2)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate">{profile.name}</span>
                <span className="text-[9px] text-muted-foreground truncate uppercase">{profile.role}</span>
              </div>
            </div>
            <a href="/logout" className="w-full">
              <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 border-border/50 cursor-pointer">
                <LogOutIcon className="mr-2 size-4" />
                Cerrar Sesión
              </Button>
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
