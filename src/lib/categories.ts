import { Shield, Eye, Home, Plane, Code, Smartphone, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
    label: string;
}

export const categoryConfig: Record<string, CategoryConfig> = {
    "Cibersegurança": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Shield,
        label: "Cibersegurança",
    },
    "Contraespionagem": {
        color: "text-[oklch(0.55_0.12_210)]",
        bgColor: "bg-[oklch(0.55_0.12_210)]/5",
        borderColor: "border-[oklch(0.55_0.12_210)]/30",
        icon: Eye,
        label: "Contraespionagem",
    },
    "Automação Residencial": {
        color: "text-[oklch(0.78_0.13_225)]",
        bgColor: "bg-[oklch(0.78_0.13_225)]/5",
        borderColor: "border-[oklch(0.78_0.13_225)]/30",
        icon: Home,
        label: "Automação Residencial",
    },
    "Viagens": {
        color: "text-[oklch(0.70_0.14_230)]",
        bgColor: "bg-[oklch(0.70_0.14_230)]/5",
        borderColor: "border-[oklch(0.70_0.14_230)]/30",
        icon: Plane,
        label: "Viagens",
    },
    "UI Frameworks": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: "UI Frameworks",
    },
    "React Native": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: "React Native",
    },
    "Mobile": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Smartphone,
        label: "Mobile",
    },
    "Vida": {
        color: "text-[oklch(0.65_0.15_15)]",
        bgColor: "bg-[oklch(0.65_0.15_15)]/5",
        borderColor: "border-[oklch(0.65_0.15_15)]/30",
        icon: Heart,
        label: "Vida",
    },
};

export function getCategoryConfig(tag: string): CategoryConfig {
    return categoryConfig[tag] || {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: tag,
    };
}
