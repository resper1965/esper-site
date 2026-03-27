import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe blog markup (headings, links, code blocks, etc.)
 * while stripping scripts, iframes, event handlers, and other attack vectors.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
      'class', 'id', 'name', 'loading', 'decoding',
      'colspan', 'rowspan', 'scope', 'headers',
      'datetime', 'open', 'lang', 'dir',
      'aria-label', 'aria-describedby', 'aria-hidden', 'role',
    ],
    // Force safe link attributes
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select', 'button'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
  });
}
