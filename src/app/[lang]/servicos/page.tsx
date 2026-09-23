import { getDictionary } from '@/i18n/dictionaries';
import { Locale, i18n } from '@/i18n/config';
import { generatePageMetadata, generateProfessionalServiceSchema } from '@/lib/metadata';
import type { Metadata } from 'next';
import { ArrowUpRight, Check, Linkedin, Phone } from 'lucide-react';
import { yearsInSecurity } from '@/lib/site';

const LINKEDIN = 'https://www.linkedin.com/in/ricardoesper';
const WHATSAPP = 'https://wa.me/5511993252971';

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in generateMetadata params:', error);
    lang = 'pt-BR';
  }
  const dict = await getDictionary(lang);

  const keywords = lang === 'pt-BR'
    ? ['Ricardo Esper', 'CISO', 'consultoria', 'cibersegurança', 'forense digital', 'compliance', 'LGPD', 'GDPR', 'TSCM', 'contraespionagem']
    : ['Ricardo Esper', 'CISO', 'consulting', 'cybersecurity', 'digital forensics', 'compliance', 'LGPD', 'GDPR', 'TSCM', 'counterespionage'];

  return generatePageMetadata({
    title: dict.services.title,
    description: lang === 'pt-BR'
      ? `Serviços de consultoria em cibersegurança, CISO as a Service, forense digital, compliance (LGPD, GDPR, HIPAA, SOC 2) e contraespionagem corporativa. Mais de ${yearsInSecurity()} anos de experiência.`
      : `Cybersecurity consulting services, CISO as a Service, digital forensics, compliance (LGPD, GDPR, HIPAA, SOC 2) and corporate counterespionage. Over ${yearsInSecurity()} years of experience.`,
    path: '/servicos',
    lang,
    keywords,
  });
}

/** Os cinco serviços, numerados na ordem em que são apresentados. */
function servicos(lang: Locale) {
  const pt = lang === 'pt-BR';

  return (pt
    ? [
        ['Consultoria CISO', 'Chief Information Security Officer as a Service',
          'Liderança estratégica em segurança da informação para organizações que precisam de expertise executiva sem o custo de um CISO full-time.',
          ['Definição de estratégia e roadmap de segurança', 'Gestão de riscos e compliance (LGPD, GDPR, SOC 2)', 'Board reporting e comunicação executiva', 'Gestão de crises e resposta a incidentes']],
        ['Contraespionagem Corporativa', 'TSCM & Executive Protection',
          'Proteção contra vazamento de informações sensíveis, varreduras técnicas e segurança de comunicações para executivos.',
          ['Varredura TSCM (Technical Surveillance Countermeasures)', 'Proteção de executivos e viagens internacionais', 'Segurança de comunicações e dispositivos', 'Análise de ameaças internas']],
        ['Forense Digital', 'Investigação & Resposta a Incidentes',
          'Investigação técnica de incidentes de segurança, análise de malware e coleta de evidências digitais com validade jurídica.',
          ['Investigação de fraudes e vazamentos', 'Análise de malware e ransomware', 'Coleta forense com cadeia de custódia', 'Laudos técnicos para processos judiciais']],
        ['Compliance & Privacidade', 'LGPD, GDPR, HIPAA, SOC 2',
          'Adequação regulatória completa, desde assessment inicial até implementação de controles e manutenção da conformidade.',
          ['Assessment de gap e roadmap de adequação', 'Implementação de DPO as a Service', 'Políticas e procedimentos customizados', 'Treinamento e conscientização']],
        ['Advisory Board', 'Conselheiro Estratégico',
          'Participação em boards e conselhos consultivos, trazendo perspectiva de segurança para decisões estratégicas de negócio.',
          [`Visão executiva de ${yearsInSecurity()} anos de mercado`, 'Conexões com ecossistema de segurança', 'Due diligence em M&A tech', 'Mentoria para executivos de tecnologia']],
      ]
    : [
        ['CISO Consulting', 'Chief Information Security Officer as a Service',
          'Strategic information security leadership for organizations that need executive expertise without the cost of a full-time CISO.',
          ['Security strategy and roadmap definition', 'Risk management and compliance (LGPD, GDPR, SOC 2)', 'Board reporting and executive communication', 'Crisis management and incident response']],
        ['Corporate Counterespionage', 'TSCM & Executive Protection',
          'Protection against sensitive information leaks, technical sweeps and communication security for executives.',
          ['TSCM sweeps (Technical Surveillance Countermeasures)', 'Executive protection and international travel', 'Communication and device security', 'Internal threat analysis']],
        ['Digital Forensics', 'Investigation & Incident Response',
          'Technical investigation of security incidents, malware analysis and collection of digital evidence with legal validity.',
          ['Fraud and leak investigations', 'Malware and ransomware analysis', 'Forensic collection with chain of custody', 'Technical reports for legal proceedings']],
        ['Compliance & Privacy', 'LGPD, GDPR, HIPAA, SOC 2',
          'Complete regulatory compliance, from initial assessment to control implementation and compliance maintenance.',
          ['Gap assessment and compliance roadmap', 'DPO as a Service implementation', 'Customized policies and procedures', 'Training and awareness']],
        ['Advisory Board', 'Strategic Advisor',
          'Participation in boards and advisory councils, bringing security perspective to strategic business decisions.',
          [`${yearsInSecurity()} years of executive market vision`, 'Connections with security ecosystem', 'Due diligence in tech M&A', 'Mentoring for technology executives']],
      ]
  ).map(([title, sub, desc, benefits], i) => ({
    n: String(i + 1).padStart(2, '0'),
    title: title as string,
    sub: sub as string,
    desc: desc as string,
    benefits: benefits as string[],
  }));
}

export default async function Servicos({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  let lang: Locale = 'pt-BR';
  try {
    const resolvedParams = await params;
    if (resolvedParams && resolvedParams.lang && (resolvedParams.lang === 'pt-BR' || resolvedParams.lang === 'en')) {
      lang = resolvedParams.lang;
    }
  } catch (error) {
    console.error('Error in Servicos params:', error);
    lang = 'pt-BR';
  }
  const pt = lang === 'pt-BR';
  const L = (a: string, b: string) => (pt ? a : b);
  const serviceSchema = generateProfessionalServiceSchema(lang);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <header className="flex flex-col gap-4">
        <h6 style={{ color: 'var(--color-accent)' }}>
          {L(`Serviços · ${yearsInSecurity()} anos de experiência`, `Services · ${yearsInSecurity()} years of experience`)}
        </h6>
        <h1>{L('Serviços', 'Services')}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--color-neutral-300)', maxWidth: 680 }}>
          {L(
            'Transformo complexidade em vantagem competitiva. Expertise em segurança, compliance e proteção executiva para organizações que não podem falhar.',
            'I transform complexity into competitive advantage. Expertise in security, compliance and executive protection for organizations that cannot fail.'
          )}
        </p>
      </header>

      <section className="flex flex-col">
        {servicos(lang).map((s) => (
          <article
            key={s.n}
            className="rule-t grid gap-5"
            style={{ gridTemplateColumns: '40px minmax(0, 1fr)', padding: '32px 0' }}
          >
            <span style={{ fontSize: 14, color: 'var(--color-accent)', fontVariantNumeric: 'tabular-nums' }}>
              {s.n}
            </span>

            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
            >
              <div className="flex flex-col gap-2">
                <span style={{ fontSize: 12, color: 'var(--color-accent-300)' }}>{s.sub}</span>
                <h3>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-neutral-400)' }}>
                  {s.desc}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {s.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5" style={{ fontSize: 14, color: 'var(--color-neutral-200)' }}>
                    <Check size={14} style={{ color: 'var(--color-accent)', flex: 'none', marginTop: 4 }} aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section
        className="flex flex-col gap-5"
        style={{
          padding: '36px 40px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-section)',
        }}
      >
        <h3 style={{ color: 'var(--color-accent-200)' }}>{L('Vamos conversar?', 'Let’s talk?')}</h3>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-accent-200)', maxWidth: 620 }}>
          {L(
            'Cada organização tem desafios únicos. Agende uma conversa inicial para entendermos suas necessidades e explorarmos como posso contribuir.',
            'Every organization has unique challenges. Schedule an initial conversation so we can understand your needs and explore how I can contribute.'
          )}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{ borderColor: 'var(--color-accent-300)', color: 'var(--color-accent-200)' }}
          >
            <Phone size={16} aria-hidden />
            {L('WhatsApp direto', 'Direct WhatsApp')}
          </a>
          <a
            href={LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
            style={{ color: 'var(--color-accent-200)' }}
          >
            <Linkedin size={16} aria-hidden />
            {L('Prefere LinkedIn? Conecte-se comigo', 'Prefer LinkedIn? Connect with me')}
            <ArrowUpRight size={14} aria-hidden />
          </a>
        </div>
      </section>
    </>
  );
}
