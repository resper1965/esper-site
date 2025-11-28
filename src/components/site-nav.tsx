import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto w-full flex h-14 items-center justify-between px-6">
        <div className="mr-4 flex">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2 font-medium text-lg tracking-tighter"
          >
            <span>Ricardo Esper</span>
          </Link>
        </div>

        <div className="flex flex-1 w-full justify-end">
          <nav className="flex items-center gap-4">
            <Link href="/blog" className="text-sm hover:underline">
              Blog
            </Link>
            <Link href="/sobre" className="text-sm hover:underline">
              Sobre
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

