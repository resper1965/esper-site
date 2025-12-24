import Layout from '@/components/layout/Layout';
import { Shield, Eye, Search, FileCheck, Briefcase, Phone, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    icon: Shield,
    title: "Consultoria CISO",
    subtitle: "Chief Information Security Officer as a Service",
    description: "Liderança estratégica em segurança da informação para organizações que precisam de expertise executiva sem o custo de um CISO full-time.",
    benefits: [
      "Definição de estratégia e roadmap de segurança",
      "Gestão de riscos e compliance (LGPD, GDPR, SOC 2)",
      "Board reporting e comunicação executiva",
      "Gestão de crises e resposta a incidentes"
    ],
    gradient: "from-blue-500/30 via-cyan-500/20 to-blue-900/10",
    accentGradient: "from-blue-400 to-cyan-400",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    pattern: "radial-gradient(circle at 20% 80%, rgba(59,130,246,0.15) 0%, transparent 50%)"
  },
  {
    icon: Eye,
    title: "Contraespionagem Corporativa",
    subtitle: "TSCM & Executive Protection",
    description: "Proteção contra vazamento de informações sensíveis, varreduras técnicas e segurança de comunicações para executivos.",
    benefits: [
      "Varredura TSCM (Technical Surveillance Countermeasures)",
      "Proteção de executivos e viagens internacionais",
      "Segurança de comunicações e dispositivos",
      "Análise de ameaças internas"
    ],
    gradient: "from-slate-500/30 via-zinc-500/20 to-slate-900/10",
    accentGradient: "from-slate-400 to-zinc-400",
    color: "text-slate-400",
    bgColor: "bg-slate-500/10",
    pattern: "radial-gradient(circle at 80% 20%, rgba(100,116,139,0.15) 0%, transparent 50%)"
  },
  {
    icon: Search,
    title: "Forense Digital",
    subtitle: "Investigação & Resposta a Incidentes",
    description: "Investigação técnica de incidentes de segurança, análise de malware e coleta de evidências digitais com validade jurídica.",
    benefits: [
      "Investigação de fraudes e vazamentos",
      "Análise de malware e ransomware",
      "Coleta forense com cadeia de custódia",
      "Laudos técnicos para processos judiciais"
    ],
    gradient: "from-amber-500/30 via-orange-500/20 to-amber-900/10",
    accentGradient: "from-amber-400 to-orange-400",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    pattern: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, transparent 50%)"
  },
  {
    icon: FileCheck,
    title: "Compliance & Privacidade",
    subtitle: "LGPD, GDPR, HIPAA, SOC 2",
    description: "Adequação regulatória completa, desde assessment inicial até implementação de controles e manutenção da conformidade.",
    benefits: [
      "Assessment de gap e roadmap de adequação",
      "Implementação de DPO as a Service",
      "Políticas e procedimentos customizados",
      "Treinamento e conscientização"
    ],
    gradient: "from-emerald-500/30 via-teal-500/20 to-emerald-900/10",
    accentGradient: "from-emerald-400 to-teal-400",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    pattern: "radial-gradient(circle at 80% 80%, rgba(16,185,129,0.15) 0%, transparent 50%)"
  },
  {
    icon: Briefcase,
    title: "Advisory Board",
    subtitle: "Conselheiro Estratégico",
    description: "Participação em boards e conselhos consultivos, trazendo perspectiva de segurança para decisões estratégicas de negócio.",
    benefits: [
      "Visão executiva de 34 anos de mercado",
      "Conexões com ecossistema de segurança",
      "Due diligence em M&A tech",
      "Mentoria para executivos de tecnologia"
    ],
    gradient: "from-violet-500/30 via-purple-500/20 to-violet-900/10",
    accentGradient: "from-violet-400 to-purple-400",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    pattern: "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 50%)"
  }
];

export default function Servicos() {
  return (
    <Layout>
      <div className="bg-background">
        {/* Hero Section with animated background */}
        <div className="relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-40 w-80 h-80 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm px-4 py-1.5 text-sm text-muted-foreground mb-6">
                <Sparkles className="w-4 h-4" />
                34 anos de experiência
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-br from-foreground via-foreground to-muted-foreground bg-clip-text">
                Serviços
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
                Transformo complexidade em vantagem competitiva. Expertise em segurança, 
                compliance e proteção executiva para organizações que não podem falhar.
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="group relative flex flex-col rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background pattern */}
                  <div 
                    className="absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: service.pattern }}
                  />
                  
                  {/* Shimmer border effect on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl bg-gradient-to-r ${service.accentGradient} blur-xl -z-10`} />
                  
                  {/* Gradient Header with mesh */}
                  <div className={`relative h-36 flex items-center justify-center bg-gradient-to-br ${service.gradient}`}>
                    {/* Animated mesh pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,currentColor_25%,transparent_25%,transparent_75%,currentColor_75%)] bg-[length:20px_20px] group-hover:animate-pulse" />
                    
                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className={`absolute w-2 h-2 rounded-full ${service.bgColor} top-4 left-1/4 animate-bounce`} style={{ animationDelay: '0s', animationDuration: '3s' }} />
                      <div className={`absolute w-1.5 h-1.5 rounded-full ${service.bgColor} top-8 right-1/3 animate-bounce`} style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
                      <div className={`absolute w-1 h-1 rounded-full ${service.bgColor} bottom-8 left-1/3 animate-bounce`} style={{ animationDelay: '1s', animationDuration: '3.5s' }} />
                    </div>
                    
                    {/* Icon with glassmorphism and glow */}
                    <div className="relative">
                      <div className={`absolute inset-0 rounded-2xl ${service.bgColor} blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-150`} />
                      <div className={`relative rounded-2xl p-5 bg-background/80 backdrop-blur-md border border-border/50 transition-all duration-500 group-hover:scale-110 group-hover:bg-background/90 group-hover:shadow-lg`}>
                        <Icon className={`w-8 h-8 ${service.color} transition-transform duration-500 group-hover:scale-110`} />
                      </div>
                    </div>
                    
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-col flex-1 p-6">
                    <h3 className="text-xl font-semibold group-hover:text-foreground transition-colors">{service.title}</h3>
                    <p className={`text-sm font-medium ${service.color} mt-1`}>{service.subtitle}</p>
                    <p className="mt-3 text-muted-foreground text-sm flex-1">{service.description}</p>
                    
                    {/* Benefits with animated arrows */}
                    <ul className="mt-4 space-y-2">
                      {service.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground group/item">
                          <ArrowRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${service.color} transition-transform duration-300 group-hover/item:translate-x-1`} />
                          <span className="group-hover/item:text-foreground transition-colors">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section with enhanced visuals */}
        <div className="relative border-t border-border overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-background to-muted/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 text-center">
            <h2 className="text-3xl font-bold">Vamos Conversar?</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Cada organização tem desafios únicos. Agende uma conversa inicial para 
              entendermos suas necessidades e explorarmos como posso contribuir.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://calendly.com/ricardoesper"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
              >
                <Calendar className="w-5 h-5 transition-transform group-hover:scale-110" />
                Agendar Reunião
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-background px-8 py-4 text-sm font-semibold transition-all duration-300 hover:bg-muted hover:border-muted-foreground/20"
              >
                <Phone className="w-5 h-5 transition-transform group-hover:scale-110" />
                WhatsApp Direto
              </a>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
              Prefere LinkedIn?{' '}
              <Link 
                href="https://www.linkedin.com/in/ricardoesper" 
                target="_blank"
                className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Conecte-se comigo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

