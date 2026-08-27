import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  describe('strips XSS vectors', () => {
    it('removes script tags and their contents', () => {
      const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>');
      expect(out).not.toContain('script');
      expect(out).not.toContain('alert');
      expect(out).toContain('<p>ok</p>');
    });

    it('removes inline event handlers', () => {
      const out = sanitizeHtml('<img src="https://e.com/a.png" onerror="alert(1)">');
      expect(out).not.toContain('onerror');
      expect(out).toContain('src="https://e.com/a.png"');
    });

    it('removes javascript: URLs', () => {
      const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
      expect(out).not.toContain('javascript');
    });

    it('removes data: URLs, which can carry scripts', () => {
      const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
      expect(out).not.toContain('data:');
    });

    it('removes style tags and their contents', () => {
      const out = sanitizeHtml('<style>body{background:url(javascript:alert(1))}</style><p>ok</p>');
      expect(out).not.toContain('style');
      expect(out).not.toContain('javascript');
    });

    it('removes iframes, embeds and form controls', () => {
      const out = sanitizeHtml(
        '<iframe src="https://evil.com"></iframe><object></object><form><input></form>'
      );
      expect(out).not.toMatch(/iframe|object|form|input/);
    });
  });

  describe('keeps legitimate blog markup', () => {
    it('preserves headings, emphasis and lists', () => {
      const html = '<h2>Título</h2><p><strong>a</strong> <em>b</em></p><ul><li>c</li></ul>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('preserves code blocks', () => {
      const html = '<pre><code>const a = 1;</code></pre>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('preserves tables with their layout attributes', () => {
      const html = '<table><tr><th colspan="2" scope="col">h</th></tr></table>';
      expect(sanitizeHtml(html)).toContain('colspan="2"');
      expect(sanitizeHtml(html)).toContain('scope="col"');
    });

    it('preserves https links and images', () => {
      const html = '<a href="https://esper.ws" title="t">x</a>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('preserves mailto links', () => {
      expect(sanitizeHtml('<a href="mailto:a@b.com">x</a>')).toContain('mailto:a@b.com');
    });

    it('preserves accessibility attributes', () => {
      const html = '<span role="note" aria-label="l">x</span>';
      expect(sanitizeHtml(html)).toBe(html);
    });
  });

  describe('hardens links opening in a new tab', () => {
    it('forces rel=noopener noreferrer on target=_blank', () => {
      const out = sanitizeHtml('<a href="https://e.com" target="_blank">x</a>');
      expect(out).toContain('rel="noopener noreferrer"');
    });

    it('overrides an author-supplied rel that omits noopener', () => {
      const out = sanitizeHtml('<a href="https://e.com" target="_blank" rel="author">x</a>');
      expect(out).toContain('rel="noopener noreferrer"');
      expect(out).not.toContain('rel="author"');
    });

    it('leaves same-tab links untouched', () => {
      const html = '<a href="https://e.com">x</a>';
      expect(sanitizeHtml(html)).toBe(html);
    });
  });

  describe('edge cases', () => {
    it('handles empty input', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('escapes bare angle brackets rather than dropping the text', () => {
      expect(sanitizeHtml('a < b')).toContain('a &lt; b');
    });
  });
});
