import { describe, it, expect } from 'vitest';
import { WCAGRules, RuleSeverity, WCAGLevel } from '../src/wcag-rules.js';

describe('WCAG Rules', () => {
  describe('Rule Definition Structure', () => {
    it('should have all required rule properties', () => {
      const rules = WCAGRules.getAllRules();
      expect(rules.length).toBeGreaterThan(0);

      rules.forEach(rule => {
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('name');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('wcagLevel');
        expect(rule).toHaveProperty('wcagCriteria');
        expect(rule).toHaveProperty('severity');
        expect(rule).toHaveProperty('check');
        expect(typeof rule.check).toBe('function');
      });
    });

    it('should have valid WCAG levels', () => {
      const rules = WCAGRules.getAllRules();
      const validLevels = [WCAGLevel.A, WCAGLevel.AA, WCAGLevel.AAA];

      rules.forEach(rule => {
        expect(validLevels).toContain(rule.wcagLevel);
      });
    });

    it('should have valid severity levels', () => {
      const rules = WCAGRules.getAllRules();
      const validSeverities = [RuleSeverity.ERROR, RuleSeverity.WARNING, RuleSeverity.INFO];

      rules.forEach(rule => {
        expect(validSeverities).toContain(rule.severity);
      });
    });
  });

  describe('Image Alt Text Rule (1.1.1)', () => {
    it('should detect missing alt attribute on img', () => {
      const html = '<img src="photo.jpg">';
      const issues = WCAGRules.runRule('img-alt', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].ruleId).toBe('img-alt');
      expect(issues[0].severity).toBe(RuleSeverity.ERROR);
    });

    it('should pass for img with alt text', () => {
      const html = '<img src="photo.jpg" alt="A photo">';
      const issues = WCAGRules.runRule('img-alt', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for img with empty alt (decorative)', () => {
      const html = '<img src="decoration.jpg" alt="">';
      const issues = WCAGRules.runRule('img-alt', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for img with role="presentation"', () => {
      const html = '<img src="decoration.jpg" role="presentation">';
      const issues = WCAGRules.runRule('img-alt', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Form Label Rule (1.3.1)', () => {
    it('should detect input without label', () => {
      const html = '<input type="text" id="name">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].ruleId).toBe('form-label');
    });

    it('should pass for input with associated label', () => {
      const html = '<label for="name">Name</label><input type="text" id="name">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for input with aria-label', () => {
      const html = '<input type="text" aria-label="Name">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for input with aria-labelledby', () => {
      const html = '<span id="nameLabel">Name</span><input type="text" aria-labelledby="nameLabel">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for hidden inputs', () => {
      const html = '<input type="hidden" name="token">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for submit/button inputs', () => {
      const html = '<input type="submit" value="Send"><input type="button" value="Click">';
      const issues = WCAGRules.runRule('form-label', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Heading Hierarchy Rule (1.3.1)', () => {
    it('should detect skipped heading levels', () => {
      const html = '<h1>Title</h1><h3>Subtitle</h3>';
      const issues = WCAGRules.runRule('heading-order', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('skipped');
    });

    it('should pass for proper heading order', () => {
      const html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
      const issues = WCAGRules.runRule('heading-order', html);

      expect(issues).toHaveLength(0);
    });

    it('should allow multiple h1s (different context)', () => {
      const html = '<h1>Title</h1><h2>Section</h2><h1>Another Title</h1>';
      const issues = WCAGRules.runRule('heading-order', html);

      // Going back to h1 is allowed
      expect(issues).toHaveLength(0);
    });
  });

  describe('Language Attribute Rule (3.1.1)', () => {
    it('should detect missing lang attribute', () => {
      const html = '<html><head></head><body>Content</body></html>';
      const issues = WCAGRules.runRule('html-lang', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].ruleId).toBe('html-lang');
    });

    it('should pass for html with lang attribute', () => {
      const html = '<html lang="en"><head></head><body>Content</body></html>';
      const issues = WCAGRules.runRule('html-lang', html);

      expect(issues).toHaveLength(0);
    });

    it('should detect invalid lang attribute', () => {
      const html = '<html lang=""><head></head><body>Content</body></html>';
      const issues = WCAGRules.runRule('html-lang', html);

      expect(issues).toHaveLength(1);
    });
  });

  describe('Button Text Rule (4.1.2)', () => {
    it('should detect button without accessible name', () => {
      const html = '<button></button>';
      const issues = WCAGRules.runRule('button-name', html);

      expect(issues).toHaveLength(1);
    });

    it('should pass for button with text', () => {
      const html = '<button>Click me</button>';
      const issues = WCAGRules.runRule('button-name', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for button with aria-label', () => {
      const html = '<button aria-label="Close"></button>';
      const issues = WCAGRules.runRule('button-name', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Link Text Rule (2.4.4)', () => {
    it('should detect link without accessible name', () => {
      const html = '<a href="/page"></a>';
      const issues = WCAGRules.runRule('link-name', html);

      expect(issues).toHaveLength(1);
    });

    it('should detect link with only generic text', () => {
      const html = '<a href="/page">click here</a>';
      const issues = WCAGRules.runRule('link-name', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe(RuleSeverity.WARNING);
    });

    it('should pass for link with descriptive text', () => {
      const html = '<a href="/page">View our products</a>';
      const issues = WCAGRules.runRule('link-name', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('ARIA Validity Rules (4.1.2)', () => {
    it('should detect invalid ARIA roles', () => {
      const html = '<div role="invalid-role">Content</div>';
      const issues = WCAGRules.runRule('aria-valid-role', html);

      expect(issues).toHaveLength(1);
    });

    it('should pass for valid ARIA roles', () => {
      const html = '<div role="button">Content</div>';
      const issues = WCAGRules.runRule('aria-valid-role', html);

      expect(issues).toHaveLength(0);
    });

    it('should detect aria-hidden on focusable elements', () => {
      const html = '<button aria-hidden="true">Hidden Button</button>';
      const issues = WCAGRules.runRule('aria-hidden-focus', html);

      expect(issues).toHaveLength(1);
    });
  });

  describe('Focus Management Rules (2.4.7)', () => {
    it('should detect tabindex > 0', () => {
      const html = '<button tabindex="5">Button</button>';
      const issues = WCAGRules.runRule('tabindex-positive', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe(RuleSeverity.WARNING);
    });

    it('should pass for tabindex="0"', () => {
      const html = '<div tabindex="0">Focusable div</div>';
      const issues = WCAGRules.runRule('tabindex-positive', html);

      expect(issues).toHaveLength(0);
    });

    it('should pass for tabindex="-1"', () => {
      const html = '<div tabindex="-1">Programmatically focusable</div>';
      const issues = WCAGRules.runRule('tabindex-positive', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Semantic HTML Rules', () => {
    it('should suggest using semantic elements', () => {
      const html = '<div onclick="submit()">Submit</div>';
      const issues = WCAGRules.runRule('semantic-button', html);

      expect(issues).toHaveLength(1);
      expect(issues[0].suggestion).toContain('button');
    });

    it('should detect missing landmark regions', () => {
      const html = '<div>Content without landmarks</div>';
      const issues = WCAGRules.runRule('landmark-regions', html);

      expect(issues.length).toBeGreaterThan(0);
    });

    it('should pass for content with proper landmarks', () => {
      const html = '<header><nav>Nav</nav></header><main>Content</main><footer>Footer</footer>';
      const issues = WCAGRules.runRule('landmark-regions', html);

      expect(issues).toHaveLength(0);
    });
  });

  describe('Rule Filtering', () => {
    it('should filter rules by WCAG level', () => {
      const levelARules = WCAGRules.getRulesByLevel(WCAGLevel.A);
      const levelAARules = WCAGRules.getRulesByLevel(WCAGLevel.AA);

      expect(levelARules.length).toBeGreaterThan(0);
      expect(levelAARules.length).toBeGreaterThan(0);

      levelARules.forEach(rule => {
        expect(rule.wcagLevel).toBe(WCAGLevel.A);
      });
    });

    it('should get rule by ID', () => {
      const rule = WCAGRules.getRule('img-alt');

      expect(rule).toBeDefined();
      expect(rule.id).toBe('img-alt');
    });
  });
});
