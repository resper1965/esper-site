import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Locale } from "@/i18n/config";

interface FooterProps {
  lang: Locale;
}

export default function Footer({ lang }: FooterProps) {
  const dict = {
    about: {
      title: lang === 'pt-BR' ? 'Sobre' : 'About',
      description: lang === 'pt-BR' 
        ? 'Especialista em cibersegurança com mais de três décadas de experiência.'
        : 'Cybersecurity expert with over three decades of experience.',
    },
    links: {
      title: lang === 'pt-BR' ? 'Links' : 'Links',
      home: lang === 'pt-BR' ? 'Início' : 'Home',
      blog: lang === 'pt-BR' ? 'Blog' : 'Blog',
      about: lang === 'pt-BR' ? 'Sobre' : 'About',
    },
    social: {
      title: lang === 'pt-BR' ? 'Redes Sociais' : 'Social Media',
    },
    copyright: lang === 'pt-BR' 
      ? 'Todos os direitos reservados.'
      : 'All rights reserved.',
  };

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Ricardo Esper</h3>
            <p className="text-sm text-muted-foreground">
              {dict.about.description}
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">{dict.links.title}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={`/${lang}`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {dict.links.home}
              </Link>
              <Link
                href={`/${lang}/blog`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {dict.links.blog}
              </Link>
              <Link
                href={`/${lang}/sobre`}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {dict.links.about}
              </Link>
            </nav>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">{dict.social.title}</h3>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/ricardoesper"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ricardo Esper. {dict.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

