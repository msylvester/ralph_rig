import * as cheerio from 'cheerio';

export const WCAGLevel = {
  A: 'A',
  AA: 'AA',
  AAA: 'AAA'
};

export const RuleSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Valid ARIA roles per WAI-ARIA spec
const VALID_ARIA_ROLES = new Set([
  'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell',
  'checkbox', 'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition',
  'dialog', 'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell',
  'group', 'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main',
  'marquee', 'math', 'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'navigation', 'none', 'note', 'option', 'presentation', 'progressbar', 'radio',
  'radiogroup', 'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
  'searchbox', 'separator', 'slider', 'spinbutton', 'status', 'switch', 'tab',
  'table', 'tablist', 'tabpanel', 'term', 'textbox', 'timer', 'toolbar', 'tooltip',
  'tree', 'treegrid', 'treeitem'
]);

// Generic link text that should be avoided
const GENERIC_LINK_TEXT = new Set([
  'click here', 'here', 'read more', 'more', 'link', 'learn more', 'click',
  'this', 'go', 'see more', 'continue', 'details'
]);

// Input types that don't need labels
const EXEMPT_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

const rules = [
  // 1.1.1 Non-text Content (Level A)
  {
    id: 'img-alt',
    name: 'Image Alternative Text',
    description: 'Images must have alternative text',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '1.1.1',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('img').each((_, el) => {
        const $el = $(el);
        const alt = $el.attr('alt');
        const role = $el.attr('role');
        const ariaLabel = $el.attr('aria-label');

        // Decorative images with role="presentation" or role="none" are exempt
        if (role === 'presentation' || role === 'none') {
          return;
        }

        // Check if alt attribute exists (empty string is valid for decorative)
        if (alt === undefined && !ariaLabel) {
          issues.push({
            ruleId: 'img-alt',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: 'Image is missing alt attribute',
            suggestion: 'Add an alt attribute describing the image, or alt="" for decorative images'
          });
        }
      });

      return issues;
    }
  },

  // 1.3.1 Info and Relationships (Level A) - Form Labels
  {
    id: 'form-label',
    name: 'Form Input Labels',
    description: 'Form inputs must have associated labels',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '1.3.1',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('input, select, textarea').each((_, el) => {
        const $el = $(el);
        const type = $el.attr('type') || 'text';
        const id = $el.attr('id');

        // Skip exempt input types
        if (EXEMPT_INPUT_TYPES.has(type)) {
          return;
        }

        // Check for aria-label or aria-labelledby
        if ($el.attr('aria-label') || $el.attr('aria-labelledby')) {
          return;
        }

        // Check for associated label
        if (id) {
          const label = $(`label[for="${id}"]`);
          if (label.length > 0) {
            return;
          }
        }

        // Check if wrapped in label
        if ($el.parents('label').length > 0) {
          return;
        }

        // Check for title attribute (less preferred but valid)
        if ($el.attr('title')) {
          return;
        }

        issues.push({
          ruleId: 'form-label',
          severity: RuleSeverity.ERROR,
          element: $.html(el),
          message: 'Form input is missing an associated label',
          suggestion: 'Add a <label> element with for attribute, or use aria-label/aria-labelledby'
        });
      });

      return issues;
    }
  },

  // 1.3.1 Info and Relationships (Level A) - Heading Order
  {
    id: 'heading-order',
    name: 'Heading Hierarchy',
    description: 'Heading levels should not skip levels',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '1.3.1',
    severity: RuleSeverity.WARNING,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];
      let lastLevel = 0;

      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const level = parseInt(el.tagName.charAt(1), 10);

        // Check if we skipped a level (but allow going back to lower numbers)
        if (lastLevel > 0 && level > lastLevel + 1) {
          issues.push({
            ruleId: 'heading-order',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: `Heading level h${level} skipped from h${lastLevel}`,
            suggestion: `Use h${lastLevel + 1} instead, or add intermediate heading levels`
          });
        }

        lastLevel = level;
      });

      return issues;
    }
  },

  // 3.1.1 Language of Page (Level A)
  {
    id: 'html-lang',
    name: 'Page Language',
    description: 'HTML element must have a lang attribute',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '3.1.1',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];
      const htmlEl = $('html');

      if (htmlEl.length === 0) {
        return issues;
      }

      const lang = htmlEl.attr('lang');

      if (!lang || lang.trim() === '') {
        issues.push({
          ruleId: 'html-lang',
          severity: RuleSeverity.ERROR,
          element: '<html>',
          message: 'HTML element is missing a valid lang attribute',
          suggestion: 'Add a lang attribute to the html element, e.g., lang="en"'
        });
      }

      return issues;
    }
  },

  // 4.1.2 Name, Role, Value (Level A) - Button Name
  {
    id: 'button-name',
    name: 'Button Accessible Name',
    description: 'Buttons must have an accessible name',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '4.1.2',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('button, [role="button"]').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        const ariaLabel = $el.attr('aria-label');
        const ariaLabelledby = $el.attr('aria-labelledby');
        const title = $el.attr('title');

        if (!text && !ariaLabel && !ariaLabelledby && !title) {
          issues.push({
            ruleId: 'button-name',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: 'Button has no accessible name',
            suggestion: 'Add text content, aria-label, or aria-labelledby to the button'
          });
        }
      });

      return issues;
    }
  },

  // 2.4.4 Link Purpose (Level A)
  {
    id: 'link-name',
    name: 'Link Purpose',
    description: 'Links must have an accessible and descriptive name',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '2.4.4',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('a[href]').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim().toLowerCase();
        const ariaLabel = ($el.attr('aria-label') || '').toLowerCase();
        const title = ($el.attr('title') || '').toLowerCase();

        const accessibleName = ariaLabel || text || title;

        if (!accessibleName) {
          issues.push({
            ruleId: 'link-name',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: 'Link has no accessible name',
            suggestion: 'Add text content, aria-label, or a descriptive title'
          });
          return;
        }

        if (GENERIC_LINK_TEXT.has(accessibleName)) {
          issues.push({
            ruleId: 'link-name',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: `Link text "${accessibleName}" is not descriptive`,
            suggestion: 'Use descriptive link text that explains the destination or purpose'
          });
        }
      });

      return issues;
    }
  },

  // 4.1.2 - ARIA Role Validity
  {
    id: 'aria-valid-role',
    name: 'Valid ARIA Roles',
    description: 'ARIA roles must be valid',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '4.1.2',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('[role]').each((_, el) => {
        const $el = $(el);
        const role = $el.attr('role');

        if (!VALID_ARIA_ROLES.has(role)) {
          issues.push({
            ruleId: 'aria-valid-role',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: `Invalid ARIA role: "${role}"`,
            suggestion: 'Use a valid ARIA role from the WAI-ARIA specification'
          });
        }
      });

      return issues;
    }
  },

  // 4.1.2 - ARIA Hidden Focus
  {
    id: 'aria-hidden-focus',
    name: 'ARIA Hidden Focusable',
    description: 'aria-hidden elements should not contain focusable elements',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '4.1.2',
    severity: RuleSeverity.ERROR,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('[aria-hidden="true"]').each((_, el) => {
        const $el = $(el);
        const tagName = el.tagName.toLowerCase();

        // Check if the element itself is focusable
        const isFocusable = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName) ||
          $el.attr('tabindex') !== undefined;

        if (isFocusable) {
          issues.push({
            ruleId: 'aria-hidden-focus',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: 'Focusable element has aria-hidden="true"',
            suggestion: 'Remove aria-hidden or make the element non-focusable'
          });
          return;
        }

        // Check for focusable descendants
        const focusableDescendants = $el.find('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableDescendants.length > 0) {
          issues.push({
            ruleId: 'aria-hidden-focus',
            severity: RuleSeverity.ERROR,
            element: $.html(el),
            message: 'aria-hidden="true" contains focusable elements',
            suggestion: 'Remove focusable elements from aria-hidden container or restructure'
          });
        }
      });

      return issues;
    }
  },

  // 2.4.7 Focus Visible - Tabindex
  {
    id: 'tabindex-positive',
    name: 'Positive Tabindex',
    description: 'Avoid positive tabindex values',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '2.4.7',
    severity: RuleSeverity.WARNING,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('[tabindex]').each((_, el) => {
        const $el = $(el);
        const tabindex = parseInt($el.attr('tabindex'), 10);

        if (tabindex > 0) {
          issues.push({
            ruleId: 'tabindex-positive',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: `Positive tabindex value (${tabindex}) disrupts natural focus order`,
            suggestion: 'Use tabindex="0" or tabindex="-1" instead, and manage focus order with DOM structure'
          });
        }
      });

      return issues;
    }
  },

  // Semantic HTML - Clickable divs
  {
    id: 'semantic-button',
    name: 'Semantic Button',
    description: 'Use semantic button elements instead of clickable divs',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '4.1.2',
    severity: RuleSeverity.WARNING,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('div[onclick], span[onclick], div[onkeypress], span[onkeypress]').each((_, el) => {
        const $el = $(el);
        const role = $el.attr('role');

        // If it has role="button", it's somewhat acceptable
        if (role === 'button') {
          return;
        }

        issues.push({
          ruleId: 'semantic-button',
          severity: RuleSeverity.WARNING,
          element: $.html(el),
          message: 'Clickable element should use semantic button',
          suggestion: 'Use a <button> element instead of a clickable div/span for better accessibility'
        });
      });

      return issues;
    }
  },

  // 1.4.4 Resize Text (Level AA) - Text sizing
  {
    id: 'text-sizing',
    name: 'Text Sizing',
    description: 'Text should be resizable up to 200% without loss of content',
    wcagLevel: WCAGLevel.AA,
    wcagCriteria: '1.4.4',
    severity: RuleSeverity.WARNING,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      // Check for viewport meta with user-scalable=no or maximum-scale < 2
      $('meta[name="viewport"]').each((_, el) => {
        const content = $(el).attr('content') || '';

        if (content.includes('user-scalable=no') || content.includes('user-scalable=0')) {
          issues.push({
            ruleId: 'text-sizing',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: 'Viewport meta prevents text scaling (user-scalable=no)',
            suggestion: 'Remove user-scalable=no to allow users to zoom'
          });
        }

        const maxScaleMatch = content.match(/maximum-scale\s*=\s*([\d.]+)/);
        if (maxScaleMatch && parseFloat(maxScaleMatch[1]) < 2) {
          issues.push({
            ruleId: 'text-sizing',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: `Viewport maximum-scale (${maxScaleMatch[1]}) is too restrictive`,
            suggestion: 'Set maximum-scale to at least 2.0 or remove the restriction'
          });
        }
      });

      return issues;
    }
  },

  // 2.4.6 Headings and Labels (Level AA)
  {
    id: 'heading-content',
    name: 'Heading Content',
    description: 'Headings should have meaningful content',
    wcagLevel: WCAGLevel.AA,
    wcagCriteria: '2.4.6',
    severity: RuleSeverity.WARNING,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      $('h1, h2, h3, h4, h5, h6').each((_, el) => {
        const $el = $(el);
        const text = $el.text().trim();

        if (!text) {
          issues.push({
            ruleId: 'heading-content',
            severity: RuleSeverity.WARNING,
            element: $.html(el),
            message: 'Heading is empty',
            suggestion: 'Add descriptive text content to the heading'
          });
        }
      });

      return issues;
    }
  },

  // Landmark Regions
  {
    id: 'landmark-regions',
    name: 'Landmark Regions',
    description: 'Page should have proper landmark regions',
    wcagLevel: WCAGLevel.A,
    wcagCriteria: '1.3.1',
    severity: RuleSeverity.INFO,
    check: (html) => {
      const $ = cheerio.load(html);
      const issues = [];

      const hasMain = $('main, [role="main"]').length > 0;
      const hasHeader = $('header, [role="banner"]').length > 0;
      const hasNav = $('nav, [role="navigation"]').length > 0;
      const hasFooter = $('footer, [role="contentinfo"]').length > 0;

      if (!hasMain) {
        issues.push({
          ruleId: 'landmark-regions',
          severity: RuleSeverity.INFO,
          element: '<body>',
          message: 'Page is missing a main landmark region',
          suggestion: 'Add a <main> element or role="main" to identify the main content'
        });
      }

      if (!hasHeader) {
        issues.push({
          ruleId: 'landmark-regions',
          severity: RuleSeverity.INFO,
          element: '<body>',
          message: 'Page is missing a header/banner landmark region',
          suggestion: 'Add a <header> element or role="banner" for the site header'
        });
      }

      if (!hasNav) {
        issues.push({
          ruleId: 'landmark-regions',
          severity: RuleSeverity.INFO,
          element: '<body>',
          message: 'Page is missing a navigation landmark region',
          suggestion: 'Add a <nav> element or role="navigation" for navigation links'
        });
      }

      if (!hasFooter) {
        issues.push({
          ruleId: 'landmark-regions',
          severity: RuleSeverity.INFO,
          element: '<body>',
          message: 'Page is missing a footer/contentinfo landmark region',
          suggestion: 'Add a <footer> element or role="contentinfo" for the site footer'
        });
      }

      return issues;
    }
  }
];

export const WCAGRules = {
  getAllRules: () => rules,

  getRule: (id) => rules.find(r => r.id === id),

  getRulesByLevel: (level) => rules.filter(r => r.wcagLevel === level),

  runRule: (ruleId, html) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) {
      throw new Error(`Rule not found: ${ruleId}`);
    }
    return rule.check(html);
  },

  runAllRules: (html) => {
    const allIssues = [];
    for (const rule of rules) {
      const issues = rule.check(html);
      allIssues.push(...issues);
    }
    return allIssues;
  }
};
