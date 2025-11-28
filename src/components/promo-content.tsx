import React from "react";
import { cn } from "@/lib/utils";

interface PromoContentProps {
  variant?: "desktop" | "mobile";
  className?: string;
}

export function PromoContent({
  variant = "desktop",
  className,
}: PromoContentProps) {
  if (variant === "mobile") {
    return (
      <div className={cn("border-t border-border bg-muted/20 p-3", className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">RE</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground/90 truncate">
              Ricardo Esper
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Especialista em Cibersegurança
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("border border-border rounded-lg p-4 bg-card", className)}
    >
      <div className="flex flex-col gap-4">
        <div className="w-full h-40 rounded-md bg-primary/5 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary">RE</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold tracking-tighter">
            Ricardo Esper
          </h3>
          <p className="text-sm text-muted-foreground">
            Especialista em cibersegurança com mais de três décadas de experiência.
          </p>
        </div>
      </div>
    </div>
  );
}

