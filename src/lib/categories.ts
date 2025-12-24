import { Shield, Eye, Home, Plane, Code, Smartphone, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
    label: string;
    gradient: string;  // CSS gradient for card header
}

export const categoryConfig: Record<string, CategoryConfig> = {
    "Cibersegurança": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Shield,
        label: "Cibersegurança",
        gradient: "from-blue-500/20 via-cyan-500/10 to-slate-900/5",
    },
    "Contraespionagem": {
        color: "text-[oklch(0.55_0.12_210)]",
        bgColor: "bg-[oklch(0.55_0.12_210)]/5",
        borderColor: "border-[oklch(0.55_0.12_210)]/30",
        icon: Eye,
        label: "Contraespionagem",
        gradient: "from-slate-600/25 via-zinc-500/15 to-neutral-900/5",
    },
    "Automação Residencial": {
        color: "text-[oklch(0.78_0.13_225)]",
        bgColor: "bg-[oklch(0.78_0.13_225)]/5",
        borderColor: "border-[oklch(0.78_0.13_225)]/30",
        icon: Home,
        label: "Automação Residencial",
        gradient: "from-emerald-500/20 via-teal-500/10 to-green-900/5",
    },
    "Viagens": {
        color: "text-[oklch(0.70_0.14_230)]",
        bgColor: "bg-[oklch(0.70_0.14_230)]/5",
        borderColor: "border-[oklch(0.70_0.14_230)]/30",
        icon: Plane,
        label: "Viagens",
        gradient: "from-orange-500/20 via-amber-500/10 to-yellow-900/5",
    },
    "UI Frameworks": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: "UI Frameworks",
        gradient: "from-violet-500/20 via-purple-500/10 to-indigo-900/5",
    },
    "React Native": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: "React Native",
        gradient: "from-sky-500/20 via-blue-500/10 to-indigo-900/5",
    },
    "Mobile": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Smartphone,
        label: "Mobile",
        gradient: "from-pink-500/20 via-rose-500/10 to-red-900/5",
    },
    "vida": {
        color: "text-[oklch(0.68_0.15_25)]",
        bgColor: "bg-[oklch(0.68_0.15_25)]/5",
        borderColor: "border-[oklch(0.68_0.15_25)]/30",
        icon: Heart,
        label: "Vida",
        gradient: "from-rose-500/20 via-pink-500/10 to-red-900/5",
    },
};

export function getCategoryConfig(tag: string): CategoryConfig {
    return categoryConfig[tag] || {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: Code,
        label: tag,
        gradient: "from-gray-500/20 via-slate-500/10 to-zinc-900/5",
    };
}

