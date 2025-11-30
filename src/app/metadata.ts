import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadataKeywords = [
    // Marca pessoal e cargo
    "Ricardo Esper",
    "CISO",
    "Chief Information Security Officer",
    "Cybersecurity Expert",

    // Tópicos principais
    "Cibersegurança",
    "Segurança da Informação",
    "Cybersecurity",
    "Information Security",
    "Segurança Digital",
    "Contraespionagem Digital",

    // Tecnologias e frameworks atuais
    "Zero Trust Architecture",
    "Zero Trust",
    "Ransomware Protection",
    "LGPD Compliance",
    "GDPR",
    "Threat Intelligence",
    "Digital Forensics",
    "Forense Digital",
    "OSINT",
    "Open Source Intelligence",
    "Supply Chain Security",
    "Cloud Security",
    "AI Security",
    "IA e Segurança",
    "Deepfakes",

    // Áreas de expertise
    "Security Leadership",
    "Enterprise Security",
    "C-level Security",
    "SecOps",
    "Security Operations",
    "Incident Response",
    "Security Consulting",
    "Consultoria em Segurança",

    // Certificações e padrões
    "NIST Cybersecurity Framework",
    "ISO 27001",
    "SOC 2",
    "PCI DSS",

    // Indústrias
    "Healthcare Security",
    "IONIC Health",
    "Segurança em Saúde",

    // Brasil específico
    "Cibersegurança Brasil",
    "NESS Brasil",
    "Segurança da Informação SP",

    // Long-tail keywords
    "como proteger empresa ransomware",
    "melhores práticas cibersegurança",
    "implementar zero trust",
    "compliance LGPD passo a passo",
]

export const metadata: Metadata = {
    title: siteConfig.name,
    description: siteConfig.description,
    keywords: metadataKeywords,
    authors: [
        {
            name: "Ricardo Esper",
            url: siteConfig.url,
        },
    ],
    creator: "Ricardo Esper",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.name,
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

