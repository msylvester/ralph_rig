import { describe, it, expect } from 'vitest';
import { A11yAuditor } from '../src/auditor.js';
import { RuleSeverity, WCAGLevel } from '../src/wcag-rules.js';

describe('A11y Auditor', () => {
  describe('audit()', () => {
    it('should run all rules on HTML content', () => {
      const html = '<img src="test.jpg">';
      const result = A11yAuditor.audit(html);

      expect(result).toHaveProperty('issues');
      expect(result).toHaveProperty('summary');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should return summary with counts by severity', () => {
      const html = '<img src="test.jpg"><button></button>';
      const result = A11yAuditor.audit(html);

      expect(result.summary).toHaveProperty('total');
      expect(result.summary).toHaveProperty('errors');
      expect(result.summary).toHaveProperty('warnings');
      expect(result.summary).toHaveProperty('info');
      expect(result.summary.total).toBe(result.issues.length);
    });

    it('should filter by WCAG level', () => {
      const html = '<meta name="viewport" content="user-scalable=no">';
      const resultA = A11yAuditor.audit(html, { level: WCAGLevel.A });
      const resultAA = A11yAuditor.audit(html, { level: WCAGLevel.AA });

      // The viewport rule is AA, so it should only appear in AA results
      const viewportIssueA = resultA.issues.find(i => i.ruleId === 'text-sizing');
      const viewportIssueAA = resultAA.issues.find(i => i.ruleId === 'text-sizing');

      expect(viewportIssueA).toBeUndefined();
      expect(viewportIssueAA).toBeDefined();
    });

    it('should include all lower levels when filtering', () => {
      const html = '<img src="test.jpg"><meta name="viewport" content="user-scalable=no">';
      const resultAA = A11yAuditor.audit(html, { level: WCAGLevel.AA });

      // Should include both A and AA level issues
      const imgIssue = resultAA.issues.find(i => i.ruleId === 'img-alt');
      const viewportIssue = resultAA.issues.find(i => i.ruleId === 'text-sizing');

      expect(imgIssue).toBeDefined();
      expect(viewportIssue).toBeDefined();
    });

    it('should return passing status for accessible HTML', () => {
      const html = `
        <html lang="en">
          <head></head>
          <body>
            <header><nav><a href="/">Home</a></nav></header>
            <main>
              <h1>Title</h1>
              <img src="photo.jpg" alt="A nice photo">
              <button>Click me</button>
            </main>
            <footer>Footer content</footer>
          </body>
        </html>
      `;
      const result = A11yAuditor.audit(html);

      expect(result.summary.errors).toBe(0);
    });
  });

  describe('auditFile()', () => {
    it('should audit HTML file content', async () => {
      const htmlContent = '<img src="test.jpg">';
      const result = await A11yAuditor.auditFile(htmlContent, 'test.html');

      expect(result).toHaveProperty('file', 'test.html');
      expect(result).toHaveProperty('issues');
    });

    it('should handle JSX/TSX files', async () => {
      const jsxContent = `
        function Component() {
          return (
            <div>
              <img src="test.jpg" />
              <button></button>
            </div>
          );
        }
      `;
      const result = await A11yAuditor.auditFile(jsxContent, 'Component.jsx');

      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle Vue SFC files', async () => {
      const vueContent = `
        <template>
          <div>
            <img src="test.jpg" />
          </div>
        </template>
        <script>
        export default {}
        </script>
      `;
      const result = await A11yAuditor.auditFile(vueContent, 'Component.vue');

      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should handle Svelte files', async () => {
      const svelteContent = `
        <script>
          let name = 'world';
        </script>
        <img src="test.jpg" />
        <button></button>
      `;
      const result = await A11yAuditor.auditFile(svelteContent, 'Component.svelte');

      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('formatReport()', () => {
    it('should format report as text', () => {
      const html = '<img src="test.jpg">';
      const result = A11yAuditor.audit(html);
      const report = A11yAuditor.formatReport(result, 'text');

      expect(typeof report).toBe('string');
      expect(report).toContain('error');
    });

    it('should format report as JSON', () => {
      const html = '<img src="test.jpg">';
      const result = A11yAuditor.audit(html);
      const report = A11yAuditor.formatReport(result, 'json');

      const parsed = JSON.parse(report);
      expect(parsed).toHaveProperty('issues');
      expect(parsed).toHaveProperty('summary');
    });

    it('should format report as markdown', () => {
      const html = '<img src="test.jpg">';
      const result = A11yAuditor.audit(html);
      const report = A11yAuditor.formatReport(result, 'markdown');

      expect(report).toContain('#');
      expect(report).toContain('Image');
    });

    it('should group issues by rule in text format', () => {
      const html = '<img src="a.jpg"><img src="b.jpg">';
      const result = A11yAuditor.audit(html);
      const report = A11yAuditor.formatReport(result, 'text');

      expect(report).toContain('img-alt');
    });
  });

  describe('JSX/TSX Parsing', () => {
    it('should extract HTML from JSX return statements', async () => {
      const jsx = `
        export function App() {
          return (
            <main>
              <img src="photo.jpg" />
              <a href="#">link</a>
            </main>
          );
        }
      `;
      const result = await A11yAuditor.auditFile(jsx, 'App.jsx');

      // Should find img without alt and link with generic text
      expect(result.issues.some(i => i.ruleId === 'img-alt')).toBe(true);
    });

    it('should handle multi-line JSX', async () => {
      const jsx = `
        const Card = () => (
          <div className="card">
            <img
              src="photo.jpg"
              className="card-img"
            />
            <button
              onClick={() => {}}
            >
            </button>
          </div>
        );
      `;
      const result = await A11yAuditor.auditFile(jsx, 'Card.tsx');

      expect(result.issues.some(i => i.ruleId === 'img-alt')).toBe(true);
      expect(result.issues.some(i => i.ruleId === 'button-name')).toBe(true);
    });

    it('should handle JSX fragments', async () => {
      const jsx = `
        function List() {
          return (
            <>
              <img src="a.jpg" />
              <img src="b.jpg" />
            </>
          );
        }
      `;
      const result = await A11yAuditor.auditFile(jsx, 'List.jsx');

      const imgIssues = result.issues.filter(i => i.ruleId === 'img-alt');
      // Should find at least 2 missing alt issues
      expect(imgIssues.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle conditional rendering', async () => {
      const jsx = `
        function Conditional({ show }) {
          return (
            <div>
              {show && <img src="visible.jpg" />}
              {!show ? <img src="alt.jpg" /> : null}
            </div>
          );
        }
      `;
      const result = await A11yAuditor.auditFile(jsx, 'Conditional.jsx');

      const imgIssues = result.issues.filter(i => i.ruleId === 'img-alt');
      expect(imgIssues.length).toBe(2);
    });
  });
});
