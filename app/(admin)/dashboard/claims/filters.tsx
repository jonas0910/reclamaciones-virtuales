"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroup, Field } from "@/components/ui/field";
import { SearchIcon } from "lucide-react";

export default function ClaimsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const searchVal = searchParams.get("search") || "";
  const stateVal = searchParams.get("state") || "all";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full items-center bg-card p-4 rounded-xl border border-border/40 mb-6">
      <div className="w-full sm:flex-1 relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por código, nombre o documento..."
          className="pl-10 w-full"
          defaultValue={searchVal}
          onChange={(e) => {
            const val = e.target.value;
            // Debounce or update on input change
            const timer = setTimeout(() => {
              updateFilters("search", val);
            }, 400);
            return () => clearTimeout(timer);
          }}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          defaultValue={stateVal}
          onValueChange={(val) => updateFilters("state", val)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="respondido">Respondidos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
