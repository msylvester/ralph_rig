# Claudette - Accessibility for Claude Code

![Claudette](claudette_exe.png)

**A Claude skill that makes your repository WCAG compliant.**

Claudette is an accessibility auditor skill for Claude Code that automatically checks and fixes your web applications to meet WCAG 2.1/2.2 accessibility standards. Simply install this skill and use the commands to audit, fix, and validate accessibility across your entire codebase.

## Features

- **WCAG 2.1/2.2 Compliance Checking** - Comprehensive rule-based auditing
- **Auto-fixes for Common Issues** - Automatically fix missing alt text, labels, and more
- **Color Contrast Validation** - Ensure text meets WCAG contrast requirements
- **Focus/Keyboard Navigation Analysis** - Detect focus order and tabindex issues
- **ARIA and Semantic HTML Suggestions** - Get recommendations for better accessibility

## Installation

```bash
npm install
```

## Commands

### `/a11y-audit`

Run a full accessibility audit on your codebase.

```bash
/a11y-audit                           # Audit all supported files
/a11y-audit src/**/*.jsx              # Audit specific files
/a11y-audit --level AAA               # Check AAA compliance
/a11y-audit --format markdown         # Output as markdown
```

### `/a11y-fix`

Auto-fix common accessibility issues.

```bash
/a11y-fix                             # Fix all files
/a11y-fix src/components/             # Fix specific directory
/a11y-fix --dry-run                   # Preview changes
/a11y-fix --interactive               # Confirm each fix
```

### `/contrast-check`

Validate color contrast ratios.

```bash
/contrast-check                       # Check all CSS files
/contrast-check --fg #333 --bg #fff   # Check specific colors
/contrast-check --level AAA           # Check AAA compliance
```

## Supported File Types

- HTML (`.html`, `.htm`)
- JSX/TSX (`.jsx`, `.tsx`)
- Vue Single File Components (`.vue`)
- Svelte Components (`.svelte`)
- CSS (`.css`)

## WCAG Rules Implemented

### Level A (Basic)
| Rule ID | Description | WCAG Criterion |
|---------|-------------|----------------|
| `img-alt` | Images must have alternative text | 1.1.1 |
| `form-label` | Form inputs must have labels | 1.3.1 |
| `heading-order` | Heading levels should not skip | 1.3.1 |
| `html-lang` | HTML must have lang attribute | 3.1.1 |
| `button-name` | Buttons must have accessible names | 4.1.2 |
| `link-name` | Links must have descriptive text | 2.4.4 |
| `aria-valid-role` | ARIA roles must be valid | 4.1.2 |
| `aria-hidden-focus` | Focusable elements shouldn't be hidden | 4.1.2 |
| `tabindex-positive` | Avoid positive tabindex values | 2.4.7 |
| `semantic-button` | Use semantic button elements | 4.1.2 |
| `landmark-regions` | Page should have landmarks | 1.3.1 |

### Level AA (Recommended)
| Rule ID | Description | WCAG Criterion |
|---------|-------------|----------------|
| `text-sizing` | Text should be resizable | 1.4.4 |
| `heading-content` | Headings should have content | 2.4.6 |
| Contrast checks via `/contrast-check` | 1.4.3 |

## Auto-Fix Capabilities

The `/a11y-fix` command can automatically fix:

- **Missing alt attributes** - Adds `alt=""` (decorative placeholder)
- **Missing form labels** - Adds `aria-label` with intelligent text
- **Skipped heading levels** - Corrects heading hierarchy
- **Missing lang attribute** - Adds `lang="en"` to HTML
- **Unlabeled buttons** - Adds `aria-label` based on context

## API Usage

You can also use the modules programmatically:

```javascript
import { A11yAuditor } from './skills/a11y-guardian/src/auditor.js';
import { A11yFixer } from './skills/a11y-guardian/src/fixer.js';
import { ContrastChecker, getContrastRatio } from './skills/a11y-guardian/src/contrast.js';
import { WCAGRules, WCAGLevel } from './skills/a11y-guardian/src/wcag-rules.js';

// Audit HTML
const result = A11yAuditor.audit(htmlContent, { level: WCAGLevel.AA });
console.log(result.summary);

// Fix issues
const fixed = A11yFixer.fixAll(htmlContent);
console.log(`Made ${fixed.summary.totalChanges} changes`);

// Check contrast
const ratio = getContrastRatio('#333333', '#ffffff');
console.log(`Contrast ratio: ${ratio}:1`);
```

## Running Tests

```bash
npm test
```

## Example Report

```
===============================================================
                    A11Y ACCESSIBILITY AUDIT
===============================================================

SUMMARY (WCAG AA)
---------------------------------------------------------------
  Total issues:  3
  Errors:        2
  Warnings:      1
  Info:          0

ISSUES
---------------------------------------------------------------

[error] Image Alternative Text (2 issues)
   Rule: img-alt | WCAG 1.1.1
   - Image is missing alt attribute
      Element: <img src="hero.jpg">
      Add an alt attribute describing the image

[warning] Heading Hierarchy (1 issue)
   Rule: heading-order | WCAG 1.3.1
   - Heading level h3 skipped from h1
      Use h2 instead, or add intermediate heading levels
```

## License

ISC
