/**
 * Redirects from the WordPress blog that used to live on ricardoesper.com.br.
 *
 * The old site was replaced by this app without any redirects, so every URL
 * Google still has indexed returns 404 — and each one it eventually drops
 * takes its accumulated links with it. These 301s recover that.
 *
 * ── How this list was built ───────────────────────────────────────────────
 * There is no WordPress export in the repo and web.archive.org is not
 * reachable from the build environment, so these URLs were recovered from
 * search results — meaning the list is *verified but incomplete*. A nine-year
 * blog certainly has more.
 *
 * To complete it: Search Console → Indexing → Pages → "Not found (404)" →
 * export, then add the missing paths here. See docs/REDIRECT-MAP.md.
 *
 * ── These are inert until the posts are published ─────────────────────────
 * Verified against the production server: a redirect whose target is a blog
 * post currently lands on a page that returns 200 but renders "não
 * encontrado" — a soft 404 — because the production database has no tables.
 * That is no better than the original 404, and arguably worse, since soft
 * 404s burn crawl budget before being dropped anyway.
 *
 * The category targets DO resolve properly today. The post targets start
 * paying off the moment the content in `.backup/` is published. Shipping the
 * map now costs nothing and means no second pass later — but publishing the
 * content is a prerequisite for the recovery, not a parallel task.
 *
 * ── Why some targets are categories ───────────────────────────────────────
 * Several old posts have no equivalent in the current content. Rather than
 * inventing a match, those point at the closest category, which at least
 * keeps the visitor in the subject they came for. Pointing everything at the
 * homepage would be worse: Google reads a mass redirect to an unrelated page
 * as a soft 404 and discards the signal anyway.
 */

export interface LegacyRedirect {
  /** Path as it exists in Google's index today. */
  from: string;
  /** Where it should land now. */
  to: string;
  /**
   * `exact` — the new page covers the same subject as the old post.
   * `topical` — no equivalent content; lands on the matching category.
   */
  match: 'exact' | 'topical';
}

export const legacyRedirects: LegacyRedirect[] = [
  // ── Posts with a direct successor ───────────────────────────────
  { from: '/2024/01/huaqiangbei-shenzhen', to: '/pt-BR/blog/shenzhen-huaqiangbei-tecnologia', match: 'exact' },
  { from: '/2022/04/repensando-as-rede-ot', to: '/pt-BR/blog/ot-security-ambientes-industriais', match: 'exact' },
  { from: '/2023/01/automacao-residencial', to: '/pt-BR/blog/ia-automacao-residencial-privacidade', match: 'exact' },
  { from: '/2016/04/ransomware', to: '/pt-BR/blog/ransomware-2025-ameaca-evolucao', match: 'exact' },
  { from: '/2017/10/sua-rede-wi-fi-esta-desprotegida', to: '/pt-BR/blog/smart-home-seguranca-iot', match: 'exact' },
  { from: '/2023/02/panoptico-e-privacidade-digital', to: '/pt-BR/blog/ia-privacidade-dados-riscos', match: 'exact' },

  // ── Standalone pages ────────────────────────────────────────────
  { from: '/biografia-de-ricardo-esper', to: '/pt-BR/sobre', match: 'exact' },
  { from: '/seguranca/cybersecurity', to: '/pt-BR/categoria/cybersecurity', match: 'exact' },
  { from: '/seguranca-digital', to: '/pt-BR/blog', match: 'topical' },

  // ── Posts with no successor yet ─────────────────────────────────
  // Worth writing a replacement for: these still carry links and searches.
  { from: '/2025/01/ciberseguranca-na-aviacao', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2025/01/laboratorio-de-ameacas', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2025/01/ciberseguranca-2025', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2020/10/clonagem-de-whatsapp', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2021/11/como-proteger-o-celular-depois-de-roubado', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2022/02/mas-praticas-2', to: '/pt-BR/categoria/cybersecurity', match: 'topical' },
  { from: '/2022/09/sociedade-paulista-de-radiologia', to: '/pt-BR/blog', match: 'topical' },
];
