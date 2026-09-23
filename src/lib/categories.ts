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


/**
 * O nome da categoria no idioma da página.
 *
 * O mapa acima só traduz do inglês para o português, porque o resto do
 * arquivo existe para escolher ícone e cor — e para isso basta chegar a uma
 * chave canônica. O card e o cabeçalho do post precisam do contrário
 * também: um post em inglês não pode dizer "Cibersegurança".
 */
const nomePorIdioma: Record<string, { 'pt-BR': string; en: string }> = {
    "Cibersegurança": { 'pt-BR': 'Segurança da Informação', en: 'Information Security' },
    "Segurança": { 'pt-BR': 'Segurança da Informação', en: 'Information Security' },
    "Contraespionagem": { 'pt-BR': 'Contraespionagem', en: 'Counter-espionage' },
    "Automação Residencial": { 'pt-BR': 'Automação Residencial', en: 'Home Automation' },
    "Viagens": { 'pt-BR': 'Viagens', en: 'Travel' },
    "Vida": { 'pt-BR': 'Vida', en: 'Life' },
    "Privacidade": { 'pt-BR': 'Privacidade', en: 'Privacy' },
    "IA": { 'pt-BR': 'Inteligência Artificial', en: 'Artificial Intelligence' },
    "Carreira": { 'pt-BR': 'Carreira', en: 'Career' },
    "Forense Digital": { 'pt-BR': 'Forense Digital', en: 'Digital Forensics' },
    "Inteligência": { 'pt-BR': 'Inteligência', en: 'Intelligence' },
    "Compliance": { 'pt-BR': 'Compliance', en: 'Compliance' },
    "Liderança": { 'pt-BR': 'Governança', en: 'Governance' },
    "Geral": { 'pt-BR': 'Geral', en: 'General' },
};

export function categoryLabel(tag: string, lang: 'pt-BR' | 'en' = 'pt-BR'): string {
    const canonica = categoryNameMap[tag] || tag;
    return nomePorIdioma[canonica]?.[lang] ?? tag;
}

/**
 * Slug de rota ↔ nome da categoria.
 *
 * Morava dentro de `app/[lang]/categoria/[category]/page.tsx`, onde só a
 * própria rota o enxergava — e por isso o rodapé linkava
 * `/categoria/automation`, slug que nunca existiu, dando 404 em toda página
 * do site. Aqui a rota e quem monta o link leem a mesma tabela.
 */
export const categoryRoutes: Record<string, { pt: string; en: string }> = {
    cybersecurity: { pt: 'Cibersegurança', en: 'Cybersecurity' },
    counterespionage: { pt: 'Contraespionagem', en: 'Counterespionage' },
    privacy: { pt: 'Privacidade', en: 'Privacy' },
    forensics: { pt: 'Forense Digital', en: 'Digital Forensics' },
    intelligence: { pt: 'Inteligência', en: 'Intelligence' },
    compliance: { pt: 'Compliance', en: 'Compliance' },
    leadership: { pt: 'Liderança', en: 'Leadership' },
    homeautomation: { pt: 'Automação Residencial', en: 'Home Automation' },
    general: { pt: 'Geral', en: 'General' },
    vida: { pt: 'Vida', en: 'Life' },
    travel: { pt: 'Viagens', en: 'Travel' },
};

/**
 * O slug de rota de uma categoria, ou `undefined` quando ela não tem página.
 *
 * Aceita o nome como está gravado no post — em qualquer dos dois idiomas —
 * porque é isso que o `category` do D1 traz.
 */
export function categorySlug(tag: string): string | undefined {
    const canonica = categoryNameMap[tag] || tag;
    return Object.keys(categoryRoutes).find(
        (slug) =>
            categoryRoutes[slug].pt === canonica ||
            categoryRoutes[slug].en === canonica ||
            categoryRoutes[slug].en === tag ||
            categoryRoutes[slug].pt === tag
    );
}
