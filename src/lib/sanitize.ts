import sanitizeHtmlLib from 'sanitize-html';

/**
 * Tags allowed in post content — safe blog markup only.
 *
 * Anything absent is stripped, which covers `script`, `style`, `iframe`,
 * `object`, `embed` and every form element without needing to name them.
 */
const ALLOWED_TAGS = [
  // Structure
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'br', 'hr',
  // Text formatting
  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
  // Links & media
  'a', 'img',
  // Lists
  'ul', 'ol', 'li',
  // Code
  'pre', 'code', 'kbd', 'samp', 'var',
  // Tables
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  // Blockquotes & details
  'blockquote', 'details', 'summary', 'figure', 'figcaption',
  // Semantic
  'article', 'section', 'nav', 'aside', 'header', 'footer', 'main', 'time', 'abbr',
];

/**
 * Attributes allowed on any tag. Event handlers are absent, so `onclick`,
 * `onerror` and friends are dropped rather than blocklisted one by one.
 */
const ALLOWED_ATTRIBUTES = [
  'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
  'class', 'id', 'name', 'loading', 'decoding',
  'colspan', 'rowspan', 'scope', 'headers',
  'datetime', 'open', 'lang', 'dir',
  'aria-label', 'aria-describedby', 'aria-hidden', 'role',
];

/**
 * Sanitizes HTML content to prevent XSS.
 *
 * Uses sanitize-html (htmlparser2 under the hood) rather than DOMPurify.
 * DOMPurify needs a DOM, which on the server meant jsdom — and jsdom@29,
 * whatwg-url@16 and html-encoding-sniffer@6 all `require()` @exodus/bytes,
 * which ships ESM only. Vercel's Node runtime does not support require(ESM),
 * so every blog post route died at module load with ERR_REQUIRE_ESM. This
 * parser needs no DOM at all, which removes the failure mode rather than
 * working around it.
 */
export function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { '*': ALLOWED_ATTRIBUTES },
    // Blocks javascript:, data: and vbscript: URLs in href and src.
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    // Drop the content of disallowed tags too — without this, the text inside
    // a stripped <script> would survive as plain text in the output.
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
    transformTags: {
      // A link opening in a new tab without noopener lets the opened page
      // reach back through window.opener. Enforce it rather than trusting
      // the authored markup.
      a: (tagName, attribs) => {
        if (attribs.target === '_blank') {
          return { tagName, attribs: { ...attribs, rel: 'noopener noreferrer' } };
        }
        return { tagName, attribs };
      },
    },
  });
}
