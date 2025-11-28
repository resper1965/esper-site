'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-grey-200 bg-grey-50/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="text-xl font-semibold text-grey-900 transition-colors hover:text-grey-700"
        >
          Ricardo Esper
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          <Link 
            href="/" 
            className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
          >
            Início
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
          >
            Blog
          </Link>
          <Link 
            href="/sobre" 
            className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
          >
            Sobre
          </Link>
          <a
            href="https://www.linkedin.com/in/ricardoesper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
          >
            LinkedIn
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-grey-700 hover:text-grey-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-grey-200 bg-grey-50">
          <div className="flex flex-col px-4 py-4 space-y-4">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
            >
              Início
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
            >
              Blog
            </Link>
            <Link
              href="/sobre"
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
            >
              Sobre
            </Link>
            <a
              href="https://www.linkedin.com/in/ricardoesper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-grey-700 transition-colors hover:text-grey-900"
            >
              LinkedIn
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

