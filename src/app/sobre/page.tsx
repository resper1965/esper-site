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
                Em mais de três décadas dedicadas à segurança da informação, testemunhei a transformação
                completa do cenário de ameaças digitais—desde os primeiros vírus de boot até campanhas de
                ransomware orquestradas por estados-nação. Essa perspectiva temporal me ensinou que segurança
                não é apenas sobre tecnologia, mas sobre pessoas, processos e a sabedoria de antecipar o que
                ainda não foi visto.
              </p>

              <p>
                Como fundador da NESS desde 1991 e CISO da IONIC Health, construí minha carreira na
                intersecção entre tecnologia e governança corporativa. Meu trabalho se estende além das
                fronteiras brasileiras—atuo como consultor internacional em privacidade e compliance,
                navegando os complexos frameworks regulatórios da LGPD, GDPR, HIPAA e SOC 2.
              </p>

              <p>
                Aos 60 anos, pai de duas filhas, compreendo visceralmente que proteger dados corporativos
                é proteger vidas, reputações e legados. Cada política de segurança que desenho, cada
                estratégia de defesa que implemento, carrega essa convicção.
              </p>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Atuação Global
                </h2>
                <ul className="mt-4 space-y-3 text-grey-700">
                  <li>
                    <span className="font-medium text-grey-900">CEO & Founder</span> — NESS
                    <span className="text-grey-500 text-sm ml-2">(São Paulo, desde 1991)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900">CISO & Co-Founder</span> — IONIC Health
                    <span className="text-grey-500 text-sm ml-2">(Healthcare Security)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900">CEO</span> — forense.io, Trustness, Infinity Safe
                    <span className="text-grey-500 text-sm ml-2">(Digital Forensics & Executive Protection)</span>
                  </li>
                  <li>
                    <span className="font-medium text-grey-900">Board Member</span> — Bekaa Trusted Advisors
                  </li>
                  <li>
                    <span className="font-medium text-grey-900">Partner</span> — NESS Law
                    <span className="text-grey-500 text-sm ml-2">(Cybersecurity & Privacy Legal)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Comunidade Internacional
                </h2>
                <p className="mt-4 text-grey-700">
                  Membro ativo das principais organizações globais de segurança: HackerOne (Bug Bounty),
                  OWASP (Application Security), IAPP (Privacy Professionals), ERII (International Affairs),
                  e OAB/SP (Legal Practice).
                </p>
              </div>

              <div>
                <h2 className="mt-12 text-2xl font-semibold text-grey-900">
                  Certificações e Expertise
                </h2>
                <div className="mt-4 space-y-3">
                  <p className="text-grey-700">
                    <span className="font-medium text-grey-900">Certificações:</span> CCISO (Chief Information Security Officer),
                    CEHIv8 (Ethical Hacking), GDPR Compliance, Cybersecurity Awareness
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      Information Security Architecture
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      Digital Forensics & Incident Response
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      International Privacy & Compliance
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      CISO Leadership & Governance
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      Cyber Intelligence & OSINT
                    </span>
                    <span className="inline-flex items-center rounded-full bg-grey-200 px-4 py-2 text-sm font-medium text-grey-800">
                      Executive Protection (TSCM)
                    </span>
                  </div>
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



