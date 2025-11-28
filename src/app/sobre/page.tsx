import Layout from '@/components/layout/Layout';

export default function Sobre() {
  return (
    <Layout>
      <div className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-grey-900 sm:text-5xl">
              Sobre
            </h1>

            <div className="mt-8 space-y-6 text-lg leading-relaxed text-grey-700">
              <p>
                Aos 60 anos, com 34 anos à frente da NESS e como pai de duas filhas, 
                compreendo que segurança digital é sobre proteger o que mais importa.
              </p>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Posições Atuais
                </h2>
                <ul className="mt-4 space-y-2 text-grey-700">
                  <li>• CEO & Founder - NESS (desde 1991)</li>
                  <li>• CISO & Co-Founder - IONIC Health</li>
                  <li>• CEO - forense.io, Trustness, Infinity Safe</li>
                  <li>• Member - HackerOne, OWASP, IAPP</li>
                </ul>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Certificações
                </h2>
                <p className="mt-4 text-grey-700">
                  CCISO, CEHIv8, GDPR, Cybersecurity Awareness
                </p>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Especialidades
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-sm font-medium text-grey-800">
                    Information Security
                  </span>
                  <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-sm font-medium text-grey-800">
                    Cyber Intelligence
                  </span>
                  <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-sm font-medium text-grey-800">
                    Computer Forensics
                  </span>
                  <span className="inline-flex items-center rounded-full bg-grey-200 px-3 py-1 text-sm font-medium text-grey-800">
                    CISO Leadership
                  </span>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-grey-200">
                <h2 className="text-2xl font-semibold text-grey-900">
                  Contato
                </h2>
                <p className="mt-4 text-grey-700">
                  Conecte-se comigo no{' '}
                  <a
                    href="https://www.linkedin.com/in/ricardoesper"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-grey-900 underline transition-colors hover:text-grey-700"
                  >
                    LinkedIn
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


