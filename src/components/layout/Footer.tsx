import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-grey-200 bg-grey-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-grey-900 mb-4">Ricardo Esper</h3>
            <p className="text-sm text-grey-600">
              Especialista em cibersegurança com mais de três décadas de experiência.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-grey-900 mb-4">Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-grey-600 transition-colors hover:text-grey-900"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-grey-600 transition-colors hover:text-grey-900"
                >
                  Sobre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-grey-900 mb-4">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.linkedin.com/in/ricardoesper"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-grey-600 transition-colors hover:text-grey-900"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-grey-200 pt-8">
          <p className="text-center text-sm text-grey-600">
            © {currentYear} Ricardo Esper. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}


