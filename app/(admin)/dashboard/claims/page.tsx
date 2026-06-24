import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SupabaseClaimsRepository } from "@/lib/infrastructure/supabase/claims-repository";
import ClaimsFilters from "./filters";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  FileTextIcon, 
  ClockIcon, 
  CheckCircle2Icon, 
  ArrowLeftIcon, 
  ArrowRightIcon,
  EyeIcon
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    state?: string;
    search?: string;
  }>;
}

export default async function ClaimsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = Number(params.page || "1");
  const limit = 8;
  const state = params.state || undefined;
  const search = params.search || undefined;

  const claimsRepo = new SupabaseClaimsRepository(supabase);
  const { data: claims, count } = await claimsRepo.listByCompany(user.id, {
    page,
    limit,
    state,
    search,
  });

  // Fetch quick stats
  const { count: totalCount } = await supabase
    .from("claims")
    .select("*", { head: true, count: "exact" })
    .eq("profile_id", user.id)
    .is("deleted_at", null);

  const { count: pendingCount } = await supabase
    .from("claims")
    .select("*", { head: true, count: "exact" })
    .eq("profile_id", user.id)
    .eq("state", "pendiente")
    .is("deleted_at", null);

  const { count: solvedCount } = await supabase
    .from("claims")
    .select("*", { head: true, count: "exact" })
    .eq("profile_id", user.id)
    .eq("state", "respondido")
    .is("deleted_at", null);

  const totalPages = Math.ceil(count / limit) || 1;

  // Build pagination links
  const getPaginationUrl = (pageNumber: number) => {
    const queryParams = new URLSearchParams();
    if (params.state) queryParams.set("state", params.state);
    if (params.search) queryParams.set("search", params.search);
    queryParams.set("page", pageNumber.toString());
    return `/dashboard/claims?${queryParams.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Reclamos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualiza, filtra y responde a los reclamos y quejas de tus clientes.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileTextIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Reclamos</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalCount || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendientes</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{pendingCount || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/60 backdrop-blur-md">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Respondidos</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{solvedCount || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <ClaimsFilters />

      {/* Claims Table */}
      <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider w-[120px]">Código</TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Cliente</TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Establecimiento</TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider w-[120px]">Estado</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                  No se encontraron reclamos registrados.
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => (
                <TableRow key={claim.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium text-xs text-foreground font-mono">
                    {claim.claim_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{claim.name}</span>
                      <span className="text-xs text-muted-foreground">{claim.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={claim.claim_type === "reclamo" ? "default" : "secondary"}
                      className="capitalize font-semibold text-[10px]"
                    >
                      {claim.claim_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {claim.establishment?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(claim.created_at).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`capitalize font-semibold text-[10px] ${
                        claim.state === "pendiente" 
                          ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/10 border-amber-500/20" 
                          : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20"
                      }`}
                    >
                      {claim.state}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/claims/${claim.id}`}>
                      <Button variant="outline" size="icon" className="size-8 cursor-pointer">
                        <EyeIcon className="size-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-muted-foreground">
            Página {page} de {totalPages} ({count} resultados)
          </span>
          <div className="flex gap-2">
            <Link href={getPaginationUrl(Math.max(1, page - 1))} className={page === 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" className="cursor-pointer" disabled={page === 1}>
                <ArrowLeftIcon className="mr-1 size-4" /> Anterior
              </Button>
            </Link>
            <Link href={getPaginationUrl(Math.min(totalPages, page + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" className="cursor-pointer" disabled={page === totalPages}>
                Siguiente <ArrowRightIcon className="ml-1 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
