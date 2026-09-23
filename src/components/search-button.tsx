"use client";

import { Search } from "lucide-react";
import { openPalette } from "@/components/command-palette";

/**
 * Abre a busca ⌘K de dentro de uma página servidor — o 404 é o caso.
 * Existe só para o `onClick`: tudo o mais da paleta mora nela mesma.
 */
export function SearchButton({ label, className = "btn btn-primary" }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={openPalette} className={className}>
      <Search size={16} aria-hidden />
      {label}
    </button>
  );
}
