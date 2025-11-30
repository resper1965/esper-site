import Link from "next/link";
import { Linkedin, Twitter, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Ricardo Esper</h3>
            <p className="text-sm text-muted-foreground">
              Especialista em cibersegurança com mais de três décadas de experiência.
            </p>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Links</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Início
              </Link>
              <Link
                href="/blog"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/sobre"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Sobre
              </Link>
            </nav>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="font-semibold mb-4 text-lg">Redes Sociais</h3>
            <div className="flex gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Ricardo Esper. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

