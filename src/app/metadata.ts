import { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadataKeywords = [
    "Blog",
    "Cibersegurança",
    "Ricardo Esper",
    "Segurança Digital",
    "Contraespionagem",
    "Cybersecurity",
    "Next.js Blog",
    "Segurança da Informação",
    "Tutoriais",
    "MDX Blog",
    "Blog Moderno",
    "Tecnologia",
    "Home Automation",
    "Viagens",
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

