import { 
    Shield, Eye, Home, Plane, Heart, 
    FileText, Lock, Search, Briefcase, Users, 
    Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface CategoryConfig {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: LucideIcon;
    label: string;
    gradient: string;  // CSS gradient for card header
}

// Mapeamento de categorias em inglês para português
const categoryNameMap: Record<string, string> = {
    "Cybersecurity": "Cibersegurança",
    "Security": "Segurança",
    "Counterespionage": "Contraespionagem",
    "Counter-espionage": "Contraespionagem",
    "Home Automation": "Automação Residencial",
    "Travel": "Viagens",
    "Life": "Vida",
    "Vida": "Vida",
    "Forensics": "Forense Digital",
    "Intelligence": "Inteligência",
    "Compliance": "Compliance",
    "Leadership": "Liderança",
    "General": "Geral",
    "Privacy": "Privacidade",
    "IA": "IA",
    "AI": "IA",
    "Carreira": "Carreira",
    "Career": "Carreira",
};

export const categoryConfig: Record<string, CategoryConfig> = {
    "Cibersegurança": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Shield,
        label: "Cibersegurança",
        gradient: "from-blue-500/20 via-cyan-500/10 to-slate-900/5",
    },
    "Cybersecurity": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Shield,
        label: "Cibersegurança",
        gradient: "from-blue-500/20 via-cyan-500/10 to-slate-900/5",
    },
    "Segurança": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Lock,
        label: "Segurança",
        gradient: "from-blue-500/20 via-cyan-500/10 to-slate-900/5",
    },
    "Security": {
        color: "text-[oklch(0.65_0.18_215)]",
        bgColor: "bg-[oklch(0.65_0.18_215)]/5",
        borderColor: "border-[oklch(0.65_0.18_215)]/30",
        icon: Lock,
        label: "Segurança",
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
    "Counterespionage": {
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
    "Home Automation": {
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
    "Travel": {
        color: "text-[oklch(0.70_0.14_230)]",
        bgColor: "bg-[oklch(0.70_0.14_230)]/5",
        borderColor: "border-[oklch(0.70_0.14_230)]/30",
        icon: Plane,
        label: "Viagens",
        gradient: "from-orange-500/20 via-amber-500/10 to-yellow-900/5",
    },
    "Vida": {
        color: "text-[oklch(0.68_0.15_25)]",
        bgColor: "bg-[oklch(0.68_0.15_25)]/5",
        borderColor: "border-[oklch(0.68_0.15_25)]/30",
        icon: Heart,
        label: "Vida",
        gradient: "from-rose-500/20 via-pink-500/10 to-red-900/5",
    },
    "Life": {
        color: "text-[oklch(0.68_0.15_25)]",
        bgColor: "bg-[oklch(0.68_0.15_25)]/5",
        borderColor: "border-[oklch(0.68_0.15_25)]/30",
        icon: Heart,
        label: "Vida",
        gradient: "from-rose-500/20 via-pink-500/10 to-red-900/5",
    },
    "Privacidade": {
        color: "text-[oklch(0.60_0.15_280)]",
        bgColor: "bg-[oklch(0.60_0.15_280)]/5",
        borderColor: "border-[oklch(0.60_0.15_280)]/30",
        icon: Lock,
        label: "Privacidade",
        gradient: "from-purple-500/20 via-violet-500/10 to-indigo-900/5",
    },
    "Privacy": {
        color: "text-[oklch(0.60_0.15_280)]",
        bgColor: "bg-[oklch(0.60_0.15_280)]/5",
        borderColor: "border-[oklch(0.60_0.15_280)]/30",
        icon: Lock,
        label: "Privacidade",
        gradient: "from-purple-500/20 via-violet-500/10 to-indigo-900/5",
    },
    "IA": {
        color: "text-[oklch(0.70_0.15_200)]",
        bgColor: "bg-[oklch(0.70_0.15_200)]/5",
        borderColor: "border-[oklch(0.70_0.15_200)]/30",
        icon: Zap,
        label: "IA",
        gradient: "from-cyan-500/20 via-blue-500/10 to-indigo-900/5",
    },
    "AI": {
        color: "text-[oklch(0.70_0.15_200)]",
        bgColor: "bg-[oklch(0.70_0.15_200)]/5",
        borderColor: "border-[oklch(0.70_0.15_200)]/30",
        icon: Zap,
        label: "IA",
        gradient: "from-cyan-500/20 via-blue-500/10 to-indigo-900/5",
    },
    "Carreira": {
        color: "text-[oklch(0.65_0.15_85)]",
        bgColor: "bg-[oklch(0.65_0.15_85)]/5",
        borderColor: "border-[oklch(0.65_0.15_85)]/30",
        icon: Briefcase,
        label: "Carreira",
        gradient: "from-amber-500/20 via-yellow-500/10 to-orange-900/5",
    },
    "Career": {
        color: "text-[oklch(0.65_0.15_85)]",
        bgColor: "bg-[oklch(0.65_0.15_85)]/5",
        borderColor: "border-[oklch(0.65_0.15_85)]/30",
        icon: Briefcase,
        label: "Carreira",
        gradient: "from-amber-500/20 via-yellow-500/10 to-orange-900/5",
    },
    "Forense Digital": {
        color: "text-[oklch(0.60_0.12_180)]",
        bgColor: "bg-[oklch(0.60_0.12_180)]/5",
        borderColor: "border-[oklch(0.60_0.12_180)]/30",
        icon: Search,
        label: "Forense Digital",
        gradient: "from-teal-500/20 via-cyan-500/10 to-blue-900/5",
    },
    "Forensics": {
        color: "text-[oklch(0.60_0.12_180)]",
        bgColor: "bg-[oklch(0.60_0.12_180)]/5",
        borderColor: "border-[oklch(0.60_0.12_180)]/30",
        icon: Search,
        label: "Forense Digital",
        gradient: "from-teal-500/20 via-cyan-500/10 to-blue-900/5",
    },
    "Inteligência": {
        color: "text-[oklch(0.62_0.14_250)]",
        bgColor: "bg-[oklch(0.62_0.14_250)]/5",
        borderColor: "border-[oklch(0.62_0.14_250)]/30",
        icon: Eye,
        label: "Inteligência",
        gradient: "from-indigo-500/20 via-purple-500/10 to-violet-900/5",
    },
    "Intelligence": {
        color: "text-[oklch(0.62_0.14_250)]",
        bgColor: "bg-[oklch(0.62_0.14_250)]/5",
        borderColor: "border-[oklch(0.62_0.14_250)]/30",
        icon: Eye,
        label: "Inteligência",
        gradient: "from-indigo-500/20 via-purple-500/10 to-violet-900/5",
    },
    "Compliance": {
        color: "text-[oklch(0.58_0.16_150)]",
        bgColor: "bg-[oklch(0.58_0.16_150)]/5",
        borderColor: "border-[oklch(0.58_0.16_150)]/30",
        icon: FileText,
        label: "Compliance",
        gradient: "from-green-500/20 via-emerald-500/10 to-teal-900/5",
    },
    "Liderança": {
        color: "text-[oklch(0.64_0.14_60)]",
        bgColor: "bg-[oklch(0.64_0.14_60)]/5",
        borderColor: "border-[oklch(0.64_0.14_60)]/30",
        icon: Users,
        label: "Liderança",
        gradient: "from-yellow-500/20 via-amber-500/10 to-orange-900/5",
    },
    "Leadership": {
        color: "text-[oklch(0.64_0.14_60)]",
        bgColor: "bg-[oklch(0.64_0.14_60)]/5",
        borderColor: "border-[oklch(0.64_0.14_60)]/30",
        icon: Users,
        label: "Liderança",
        gradient: "from-yellow-500/20 via-amber-500/10 to-orange-900/5",
    },
    "Geral": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: FileText,
        label: "Geral",
        gradient: "from-gray-500/20 via-slate-500/10 to-zinc-900/5",
    },
    "General": {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: FileText,
        label: "Geral",
        gradient: "from-gray-500/20 via-slate-500/10 to-zinc-900/5",
    },
};

export function getCategoryConfig(tag: string): CategoryConfig {
    // Normalizar o nome da categoria
    const normalizedTag = categoryNameMap[tag] || tag;
    
    return categoryConfig[normalizedTag] || categoryConfig[tag] || {
        color: "text-primary",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/30",
        icon: FileText,
        label: tag,
        gradient: "from-gray-500/20 via-slate-500/10 to-zinc-900/5",
    };
}

