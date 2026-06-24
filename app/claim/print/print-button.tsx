"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";

export default function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} size="sm" className="cursor-pointer font-semibold print:hidden">
      <PrinterIcon className="mr-2 size-4" data-icon="inline-start" /> Imprimir / Guardar PDF
    </Button>
  );
}
