import { describe, it, expect } from 'vitest';
import { A11yFixer } from '../src/fixer.js';

describe('A11y Fixer', () => {
  describe('fixImgAlt()', () => {
    it('should add empty alt for images without alt', () => {
      const html = '<img src="photo.jpg">';
      const result = A11yFixer.fixImgAlt(html);

      expect(result.fixed).toContain('alt=""');
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('add-alt');
    });

    it('should not modify images that already have alt', () => {
      const html = '<img src="photo.jpg" alt="A photo">';
      const result = A11yFixer.fixImgAlt(html);

      // HTML may be normalized by cheerio but should have same attributes
      expect(result.fixed).toContain('alt="A photo"');
      expect(result.changes).toHaveLength(0);
    });

    it('should handle multiple images', () => {
      const html = '<img src="a.jpg"><img src="b.jpg" alt="B"><img src="c.jpg">';
      const result = A11yFixer.fixImgAlt(html);

      expect(result.changes).toHaveLength(2);
    });

    it('should preserve existing attributes', () => {
      const html = '<img src="photo.jpg" class="image" id="main">';
      const result = A11yFixer.fixImgAlt(html);

      expect(result.fixed).toContain('class="image"');
      expect(result.fixed).toContain('id="main"');
      expect(result.fixed).toContain('alt=""');
    });
  });

  describe('fixFormLabels()', () => {
    it('should add aria-label to inputs without labels', () => {
      const html = '<input type="text" id="name">';
      const result = A11yFixer.fixFormLabels(html);

      expect(result.fixed).toContain('aria-label=');
      expect(result.changes).toHaveLength(1);
    });

    it('should use id for label text if available', () => {
      const html = '<input type="text" id="firstName">';
      const result = A11yFixer.fixFormLabels(html);

      // Should convert camelCase to readable text
      expect(result.fixed).toContain('aria-label="First Name"');
    });

    it('should use placeholder for label if available', () => {
      const html = '<input type="text" placeholder="Enter your email">';
      const result = A11yFixer.fixFormLabels(html);

      expect(result.fixed).toContain('aria-label="Enter your email"');
    });

    it('should not modify inputs with existing labels', () => {
      const html = '<label for="name">Name</label><input type="text" id="name">';
      const result = A11yFixer.fixFormLabels(html);

      expect(result.changes).toHaveLength(0);
    });

    it('should not modify inputs with aria-label', () => {
      const html = '<input type="text" aria-label="Name">';
      const result = A11yFixer.fixFormLabels(html);

      expect(result.changes).toHaveLength(0);
    });

    it('should skip hidden inputs', () => {
      const html = '<input type="hidden" name="token">';
      const result = A11yFixer.fixFormLabels(html);

      expect(result.changes).toHaveLength(0);
    });
  });

  describe('fixHeadingHierarchy()', () => {
    it('should fix skipped heading levels', () => {
      const html = '<h1>Title</h1><h3>Subtitle</h3>';
      const result = A11yFixer.fixHeadingHierarchy(html);

      expect(result.fixed).toContain('<h2>');
      expect(result.changes).toHaveLength(1);
    });

    it('should fix multiple skipped levels', () => {
      const html = '<h1>Title</h1><h4>Deep</h4>';
      const result = A11yFixer.fixHeadingHierarchy(html);

      expect(result.fixed).toContain('<h2>');
      expect(result.changes).toHaveLength(1);
    });

    it('should not modify correct hierarchy', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
      const result = A11yFixer.fixHeadingHierarchy(html);

      expect(result.fixed).toBe(html);
      expect(result.changes).toHaveLength(0);
    });

    it('should preserve heading content', () => {
      const html = '<h1>Title</h1><h3>My Important Section</h3>';
      const result = A11yFixer.fixHeadingHierarchy(html);

      expect(result.fixed).toContain('My Important Section');
    });
  });

  describe('fixHtmlLang()', () => {
    it('should add lang="en" to html without lang', () => {
      const html = '<html><head></head><body>Content</body></html>';
      const result = A11yFixer.fixHtmlLang(html);

      expect(result.fixed).toContain('lang="en"');
      expect(result.changes).toHaveLength(1);
    });

    it('should not modify html with existing lang', () => {
      const html = '<html lang="fr"><head></head><body>Content</body></html>';
      const result = A11yFixer.fixHtmlLang(html);

      // HTML may be normalized by cheerio but should have same lang
      expect(result.fixed).toContain('lang="fr"');
      expect(result.changes).toHaveLength(0);
    });

    it('should fix empty lang attribute', () => {
      const html = '<html lang=""><head></head><body>Content</body></html>';
      const result = A11yFixer.fixHtmlLang(html);

      expect(result.fixed).toContain('lang="en"');
      expect(result.changes).toHaveLength(1);
    });
  });

  describe('fixButtonName()', () => {
    it('should add aria-label to icon buttons', () => {
      const html = '<button><svg></svg></button>';
      const result = A11yFixer.fixButtonName(html);

      expect(result.fixed).toContain('aria-label=');
      expect(result.changes).toHaveLength(1);
    });

    it('should not modify buttons with text', () => {
      const html = '<button>Click me</button>';
      const result = A11yFixer.fixButtonName(html);

      expect(result.changes).toHaveLength(0);
    });

    it('should not modify buttons with aria-label', () => {
      const html = '<button aria-label="Close"></button>';
      const result = A11yFixer.fixButtonName(html);

      expect(result.changes).toHaveLength(0);
    });
  });

  describe('fixAll()', () => {
    it('should apply all fixers', () => {
      const html = `
        <html>
          <body>
            <img src="photo.jpg">
            <h1>Title</h1>
            <h3>Skipped</h3>
            <input type="text" id="email">
            <button></button>
          </body>
        </html>
      `;
      const result = A11yFixer.fixAll(html);

      expect(result.changes.length).toBeGreaterThan(0);
      expect(result.summary).toHaveProperty('totalChanges');
      expect(result.summary).toHaveProperty('byType');
    });

    it('should return list of all changes', () => {
      const html = '<img src="a.jpg"><img src="b.jpg">';
      const result = A11yFixer.fixAll(html);

      expect(result.changes).toHaveLength(2);
      result.changes.forEach(change => {
        expect(change).toHaveProperty('type');
        expect(change).toHaveProperty('description');
        expect(change).toHaveProperty('original');
        expect(change).toHaveProperty('replacement');
      });
    });
  });

  describe('generatePatch()', () => {
    it('should generate diff-style patch', () => {
      const original = '<img src="photo.jpg">';
      const fixed = '<img src="photo.jpg" alt="">';

      const patch = A11yFixer.generatePatch(original, fixed);

      expect(patch).toContain('-');
      expect(patch).toContain('+');
    });
  });
});
