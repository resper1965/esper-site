/**
 * Palestras e aulas — fonte única.
 *
 * Isto existe por um motivo específico: quase tudo que o site afirma sobre o
 * Ricardo é autodeclaração. Certificações, anos de experiência, empresas
 * fundadas — tudo verdade, tudo dito por ele mesmo. Um convite de terceiro
 * é de outra natureza: uma instituição colocou o nome dele num programa, com
 * data e assunto. Isso um buscador e um modelo tratam como sinal, não como
 * afirmação.
 *
 * Regra de entrada: só o que existe. Um evento anunciado publicamente pela
 * organização, com data. Nada de "já palestrei em vários lugares" — isso é
 * autodeclaração outra vez, com aparência de prova.
 */

export interface Talk {
  /** Identificador estável, usado no `@id` do schema Event. */
  id: string;
  title: { 'pt-BR': string; en: string };
  /** Programa, curso ou trilha em que a aula se insere, quando houver. */
  program?: { 'pt-BR': string; en: string };
  /** Quem convidou — a parte que dá o valor de terceiro. */
  host: { name: string; url?: string };
  /**
   * ISO 8601. Duas precisões são aceitas de propósito:
   *
   *   "2026-09-10T19:00:00-03:00" — data e hora, com offset explícito
   *   "2024"                      — só o ano
   *
   * A segunda existe para eventos passados cuja data exata não está
   * documentada em lugar nenhum público. Ano é ISO 8601 válido e é
   * verdade; uma data completa inventada seria mais bonita e falsa.
   */
  startDate: string;
  /**
   * Online ou presencial. Opcional porque nem todo material divulgado diz —
   * e adivinhar erra tanto para um lado quanto para o outro. Ausente, o
   * schema simplesmente omite `eventAttendanceMode` em vez de afirmar.
   */
  mode?: 'online' | 'presencial';
  location?: string;
  /**
   * Página pública de inscrição — o endereço que a organização divulgou.
   * Vira `url` do Event: é por onde alguém confirma que o evento existe.
   */
  registrationUrl?: string;
  /**
   * Endereço da sala, quando conhecido. Separado da inscrição de propósito:
   * apontar a página institucional como se fosse o local do evento diz ao
   * consumidor de dados estruturados algo que não é verdade.
   */
  accessUrl?: string;
  /** O que a aula cobre — vira `description` no schema. */
  summary: { 'pt-BR': string; en: string };
  /**
   * Papel, quando não é "quem dá a aula" — painelista, mediador, convidado.
   * Ausente significa aula ou palestra dele.
   */
  role?: { 'pt-BR': string; en: string };
  /** Post do blog que desenvolve o tema, quando existir. */
  relatedPostSlug?: string;
}

export const talks: Talk[] = [
  {
    id: 'ibdee-cco-2026',
    title: {
      'pt-BR': 'Novas tecnologias aplicadas à prevenção, detecção de fraudes e investigações',
      en: 'New technologies applied to fraud prevention, detection and investigations',
    },
    program: {
      'pt-BR': 'Curso de Formação de CCO',
      en: 'Chief Compliance Officer certification course',
    },
    host: {
      name: 'Instituto Brasileiro de Direito e Ética Empresarial (IBDEE)',
      url: 'https://ibdee.org.br',
    },
    startDate: '2026-09-10T19:00:00-03:00',
    mode: 'online',
    // O card do IBDEE traz "inscrições em ibdee.org.br" — é o que eles
    // divulgaram, então é o que declaramos. Sem `accessUrl`: o link da sala
    // não é público, e inventar um seria pior que omitir.
    registrationUrl: 'https://ibdee.org.br',
    summary: {
      'pt-BR':
        'O que já se usa hoje para apurar fraude, o que a inteligência artificial entrega — e o que ela quebra — e as primeiras 48 horas de uma investigação interna.',
      en: 'What is already used to investigate fraud, what artificial intelligence delivers — and what it breaks — and the first 48 hours of an internal investigation.',
    },
    relatedPostSlug: 'ninguem-escreve-propina',
  },
  {
    id: 'microsoft-reactor-cybersecurity-night-2024',
    title: {
      'pt-BR': 'Cybersecurity Night 2024 — painel',
      en: 'Cybersecurity Night 2024 — panel',
    },
    host: {
      name: 'Microsoft Reactor',
      url: 'https://developer.microsoft.com/pt-br/reactor/events/23170/',
    },
    // Só o ano: a página do evento renderiza a data por JavaScript e ela não
    // aparece no HTML. O ano está no título, é verdade e é verificável.
    startDate: '2024',
    mode: 'online',
    registrationUrl: 'https://developer.microsoft.com/pt-br/reactor/events/23170/',
    role: {
      'pt-BR': 'Painelista, ao lado de três Microsoft MVPs',
      en: 'Panelist, alongside three Microsoft MVPs',
    },
    summary: {
      'pt-BR':
        'Painel sobre ameaças, incidentes no mundo real, boas práticas e soluções recomendadas em cibersegurança.',
      en: 'A panel on threats, real-world incidents, good practice and recommended solutions in cybersecurity.',
    },
  },
  {
    id: 'ibdee-congresso-2024-fraudes-do-futuro',
    title: {
      'pt-BR': 'Fraudes do mundo de digitalização e reputação: o que será preciso fazer para prevenir e tratar?',
      en: 'Fraud in a digitalised, reputation-driven world: what will it take to prevent and address it?',
    },
    program: {
      'pt-BR': '2º Congresso IBDEE de Compliance e Ética Empresarial — painel Fraudes do Futuro',
      en: '2nd IBDEE Congress on Compliance and Business Ethics — Fraud of the Future panel',
    },
    host: {
      name: 'Instituto Brasileiro de Direito e Ética Empresarial (IBDEE)',
      url: 'https://ibdee.org.br',
    },
    // Data completa, do próprio material de divulgação.
    startDate: '2024-04-18',
    // O card não informa o formato. Sem `mode`, o schema omite o campo em
    // vez de chutar entre presencial e online.
    role: {
      'pt-BR': 'Palestrante, ao lado da RD Saúde e da Polícia Civil de São Paulo',
      en: 'Speaker, alongside RD Saúde and the São Paulo Civil Police',
    },
    summary: {
      'pt-BR':
        'Painel sobre as fraudes que a digitalização torna possíveis e o que a reputação tem a ver com prevenção e resposta.',
      en: 'A panel on the frauds that digitalisation makes possible, and what reputation has to do with prevention and response.',
    },
    relatedPostSlug: 'ninguem-escreve-propina',
  },
  {
    id: 'spr-get-seguranca-2022',
    title: {
      'pt-BR': 'Segurança da Informação',
      en: 'Information Security',
    },
    program: {
      'pt-BR': 'GET — Grupo de Estudos de Tecnologia e Informática em Radiologia da SPR',
      en: 'GET — Technology and Informatics in Radiology study group, SPR',
    },
    host: {
      name: 'Sociedade Paulista de Radiologia (SPR)',
      url: 'https://spr.org.br',
    },
    // O card traz "13/09 · 20h" sem ano. O ano vem do link de transmissão
    // que ele mesmo estampa — bit.ly/Get-13-09-22 —, cujo slug codifica
    // 13-09-22. É inferência, mas de um dado impresso na própria peça, e
    // fica registrada aqui em vez de passar por leitura direta.
    startDate: '2022-09-13T20:00:00-03:00',
    mode: 'online',
    registrationUrl: 'https://bit.ly/Get-13-09-22',
    role: {
      'pt-BR': 'Convidado',
      en: 'Guest speaker',
    },
    summary: {
      'pt-BR':
        'Segurança da informação para um grupo de estudos de tecnologia em radiologia — dado clínico, que é o de regime mais estrito.',
      en: 'Information security for a radiology technology study group — clinical data, the most tightly regulated kind.',
    },
  },
  {
    id: 'miguel-silva-yamashita-2022',
    title: {
      'pt-BR': 'Ataque cibernético e cibersegurança: análise no campo jurídico e tecnológico',
      en: 'Cyber attack and cybersecurity: a legal and technological analysis',
    },
    host: {
      name: 'Miguel Silva & Yamashita Advogados',
    },
    startDate: '2022-05-11T09:30:00-03:00',
    mode: 'online',
    role: {
      'pt-BR': 'Palestrante convidado',
      en: 'Guest speaker',
    },
    summary: {
      'pt-BR':
        'Abordagem prática sobre as fragilidades do mundo virtual na vida das empresas e as providências para prevenir contingências.',
      en: 'A practical look at the vulnerabilities the virtual world creates for companies, and what to do to prevent them.',
    },
  },
];

/** Verdadeiro quando só temos o ano. */
export function isYearOnly(startDate: string): boolean {
  return /^\d{4}$/.test(startDate);
}

/**
 * Verdadeiro quando temos o dia mas não a hora — `2024-04-18`.
 *
 * Precisa de tratamento próprio porque `new Date('2024-04-18')` é meia-noite
 * UTC, e meia-noite UTC em São Paulo é 21:00 do dia anterior. Formatar isso
 * com fuso mostraria a palestra do IBDEE um dia antes da data confirmada no
 * card do evento — e ainda inventaria um horário que ninguém nos deu.
 */
export function isDateOnly(startDate: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(startDate);
}

/**
 * O instante usado para comparar com "agora".
 *
 * Uma data sem hora vale o dia inteiro: só deixa de ser futura quando o dia
 * acaba em São Paulo, que é o fuso em que estas palestras acontecem.
 */
export function talkInstant(startDate: string): Date {
  return new Date(isDateOnly(startDate) ? `${startDate}T23:59:59-03:00` : startDate);
}

/** Mais recente primeiro. Comparar strings ISO ordena certo em ambos os casos. */
export function talksByDate(): Talk[] {
  return [...talks].sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Ainda por acontecer, na ordem em que acontecem. */
export function upcomingTalks(now: Date = new Date()): Talk[] {
  // Um registro só com o ano nunca conta como "em breve": ele existe
  // justamente porque a data exata se perdeu, o que significa que já passou.
  return talks
    .filter((t) => !isYearOnly(t.startDate) && talkInstant(t.startDate) >= now)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

/** Já aconteceram, mais recente primeiro. */
export function pastTalks(now: Date = new Date()): Talk[] {
  return talks
    .filter((t) => isYearOnly(t.startDate) || talkInstant(t.startDate) < now)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
}
