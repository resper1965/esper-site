import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Locale } from "@/i18n/config";

interface SiteNavProps {
  lang: Locale;
  dict: {
    nav: {
      home: string;
      about: string;
      blog: string;
    };
  };
}

export function SiteNav({ lang, dict }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-6">
        <div className="mr-4 flex">
          <Link
            href={`/${lang}`}
            className="mr-6 flex items-center space-x-2 font-bold text-xl tracking-tight transition-colors hover:opacity-80"
          >
            <span>Ricardo <span className="text-primary">Esper</span></span>
          </Link>
        </div>

        <div className="flex flex-1 w-full justify-end">
          <nav className="flex items-center gap-6">
            <Link
              href={`/${lang}`}
              className="text-sm font-medium transition-colors duration-150 hover:text-primary"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${lang}/sobre`}
              className="text-sm font-medium transition-colors duration-150 hover:text-primary"
            >
              {dict.nav.about}
            </Link>
            <LanguageSwitcher currentLocale={lang} />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

