import Link from "next/link";
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
    <header className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto w-full flex h-16 items-center justify-between px-6">
        <div className="mr-4 flex">
          <Link
            href={`/${lang}`}
            className="mr-6 flex items-center space-x-2 font-bold text-xl tracking-tight transition-colors hover:opacity-80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt="Ricardo Esper"
              className="h-8 w-auto"
            />
            <span className="sr-only">Ricardo Esper</span>
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
          </nav>
        </div>
      </div>
    </header>
  );
}

