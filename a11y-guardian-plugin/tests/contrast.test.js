import { describe, it, expect } from 'vitest';
import { ContrastChecker, parseColor, getContrastRatio, meetsWCAG } from '../src/contrast.js';

describe('Contrast Checker', () => {
  describe('parseColor()', () => {
    it('should parse hex colors', () => {
      const color = parseColor('#ff0000');
      expect(color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse 3-char hex colors', () => {
      const color = parseColor('#f00');
      expect(color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgb colors', () => {
      const color = parseColor('rgb(255, 0, 0)');
      expect(color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse rgba colors', () => {
      const color = parseColor('rgba(255, 0, 0, 0.5)');
      expect(color).toEqual({ r: 255, g: 0, b: 0, a: 0.5 });
    });

    it('should parse named colors', () => {
      const color = parseColor('red');
      expect(color).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should parse white', () => {
      const color = parseColor('white');
      expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should parse black', () => {
      const color = parseColor('black');
      expect(color).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hsl colors', () => {
      const color = parseColor('hsl(0, 100%, 50%)');
      expect(color.r).toBe(255);
      expect(color.g).toBe(0);
      expect(color.b).toBe(0);
    });
  });

  describe('getContrastRatio()', () => {
    it('should return 21 for black on white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 21 for white on black', () => {
      const ratio = getContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 1);
    });

    it('should return 1 for same colors', () => {
      const ratio = getContrastRatio('#ff0000', '#ff0000');
      expect(ratio).toBeCloseTo(1, 1);
    });

    it('should calculate contrast for common color pairs', () => {
      // Dark gray on white - should be good contrast
      const ratio1 = getContrastRatio('#333333', '#ffffff');
      expect(ratio1).toBeGreaterThan(7);

      // Light gray on white - should be poor contrast
      const ratio2 = getContrastRatio('#cccccc', '#ffffff');
      expect(ratio2).toBeLessThan(3);
    });
  });

  describe('meetsWCAG()', () => {
    it('should pass AA for normal text with 4.5:1 ratio', () => {
      const result = meetsWCAG('#595959', '#ffffff', 'AA', false);
      expect(result.passes).toBe(true);
    });

    it('should pass AA for large text with 3:1 ratio', () => {
      const result = meetsWCAG('#767676', '#ffffff', 'AA', true);
      expect(result.passes).toBe(true);
    });

    it('should fail AA for normal text below 4.5:1', () => {
      const result = meetsWCAG('#888888', '#ffffff', 'AA', false);
      expect(result.passes).toBe(false);
    });

    it('should pass AAA for normal text with 7:1 ratio', () => {
      const result = meetsWCAG('#333333', '#ffffff', 'AAA', false);
      expect(result.passes).toBe(true);
    });

    it('should fail AAA for normal text below 7:1', () => {
      const result = meetsWCAG('#666666', '#ffffff', 'AAA', false);
      expect(result.passes).toBe(false);
    });

    it('should include the actual ratio in result', () => {
      const result = meetsWCAG('#000000', '#ffffff', 'AA', false);
      expect(result.ratio).toBeCloseTo(21, 1);
    });

    it('should include required ratio in result', () => {
      const result = meetsWCAG('#000000', '#ffffff', 'AA', false);
      expect(result.requiredRatio).toBe(4.5);
    });
  });

  describe('ContrastChecker', () => {
    describe('checkCSS()', () => {
      it('should find contrast issues in CSS', () => {
        const css = `
          .text {
            color: #cccccc;
            background-color: #ffffff;
          }
        `;
        const issues = ContrastChecker.checkCSS(css);

        expect(issues.length).toBeGreaterThan(0);
        expect(issues[0].selector).toBe('.text');
      });

      it('should pass for good contrast', () => {
        const css = `
          .text {
            color: #333333;
            background-color: #ffffff;
          }
        `;
        const issues = ContrastChecker.checkCSS(css);

        expect(issues).toHaveLength(0);
      });

      it('should handle multiple selectors', () => {
        const css = `
          .good {
            color: #000000;
            background-color: #ffffff;
          }
          .bad {
            color: #aaaaaa;
            background-color: #ffffff;
          }
        `;
        const issues = ContrastChecker.checkCSS(css);

        expect(issues).toHaveLength(1);
        expect(issues[0].selector).toBe('.bad');
      });

      it('should handle shorthand properties', () => {
        const css = `
          .text {
            color: #ccc;
            background: #fff;
          }
        `;
        const issues = ContrastChecker.checkCSS(css);

        expect(issues.length).toBeGreaterThan(0);
      });
    });

    describe('checkHTML()', () => {
      it('should find contrast issues in inline styles', () => {
        const html = '<p style="color: #cccccc; background-color: #ffffff;">Text</p>';
        const issues = ContrastChecker.checkHTML(html);

        expect(issues.length).toBeGreaterThan(0);
      });

      it('should pass for good inline contrast', () => {
        const html = '<p style="color: #333333; background-color: #ffffff;">Text</p>';
        const issues = ContrastChecker.checkHTML(html);

        expect(issues).toHaveLength(0);
      });
    });

    describe('suggestFix()', () => {
      it('should suggest a darker color for light text on light bg', () => {
        const suggestion = ContrastChecker.suggestFix('#cccccc', '#ffffff', 'AA', false);

        expect(suggestion.suggestedForeground).toBeDefined();
        // The suggested color should have better contrast
        const newRatio = getContrastRatio(suggestion.suggestedForeground, '#ffffff');
        expect(newRatio).toBeGreaterThanOrEqual(4.5);
      });

      it('should suggest a lighter color for dark text on dark bg', () => {
        const suggestion = ContrastChecker.suggestFix('#333333', '#222222', 'AA', false);

        expect(suggestion.suggestedForeground).toBeDefined();
        const newRatio = getContrastRatio(suggestion.suggestedForeground, '#222222');
        expect(newRatio).toBeGreaterThanOrEqual(4.5);
      });
    });

    describe('formatReport()', () => {
      it('should format issues as text report', () => {
        const issues = [{
          selector: '.text',
          foreground: '#cccccc',
          background: '#ffffff',
          ratio: 1.6,
          requiredRatio: 4.5,
          level: 'AA'
        }];

        const report = ContrastChecker.formatReport(issues, 'text');

        expect(report).toContain('.text');
        expect(report).toContain('1.6');
        expect(report).toContain('4.5');
      });

      it('should format issues as markdown', () => {
        const issues = [{
          selector: '.text',
          foreground: '#cccccc',
          background: '#ffffff',
          ratio: 1.6,
          requiredRatio: 4.5,
          level: 'AA'
        }];

        const report = ContrastChecker.formatReport(issues, 'markdown');

        expect(report).toContain('#');
        expect(report).toContain('.text');
      });
    });
  });
});
