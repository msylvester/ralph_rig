---
description: Run WCAG accessibility audit on HTML/JSX/Vue/Svelte files
---

# Accessibility Audit Command

Run a comprehensive WCAG 2.1/2.2 accessibility audit on your codebase.

## Usage

```
/a11y-audit [file-pattern] [--level A|AA|AAA] [--format text|json|markdown]
```

## Arguments

- `file-pattern`: Glob pattern for files to audit (default: `**/*.{html,jsx,tsx,vue,svelte}`)
- `--level`: WCAG conformance level to check (default: AA)
- `--format`: Output format (default: text)

## What It Checks

### Level A (Basic)
- Missing alt text on images (1.1.1)
- Form inputs without labels (1.3.1)
- Skipped heading levels (1.3.1)
- Missing lang attribute on HTML (3.1.1)
- Buttons without accessible names (4.1.2)
- Links without descriptive text (2.4.4)
- Invalid ARIA roles (4.1.2)
- Focusable elements with aria-hidden (4.1.2)
- Positive tabindex values (2.4.7)
- Missing landmark regions (1.3.1)

### Level AA (Recommended)
- All Level A checks plus:
- Viewport meta preventing zoom (1.4.4)
- Empty headings (2.4.6)
- Color contrast issues (1.4.3) - via /contrast-check

### Level AAA (Enhanced)
- All Level AA checks plus:
- Additional enhanced contrast requirements

## Example Output

```
═══════════════════════════════════════════════════════════════
                    A11Y ACCESSIBILITY AUDIT
═══════════════════════════════════════════════════════════════

SUMMARY (WCAG AA)
───────────────────────────────────────────────────────────────
  Total issues:  5
  Errors:        3
  Warnings:      2
  Info:          0

ISSUES
───────────────────────────────────────────────────────────────

❌ [error] Image Alternative Text (2 issues)
   Rule: img-alt | WCAG 1.1.1
   └─ Image is missing alt attribute
      Element: <img src="photo.jpg">
      💡 Add an alt attribute describing the image, or alt="" for decorative images
```

## Instructions for Claude

When the user invokes this command:

1. **Parse arguments**: Extract file pattern, WCAG level, and format from user input
2. **Find matching files**: Use Glob tool to find files matching the pattern
3. **Read each file**: Use Read tool to get file contents
4. **Run audit**: Use the A11yAuditor from `skills/a11y-guardian/src/auditor.js`
5. **Generate report**: Format results according to requested format
6. **Present findings**: Show the report with actionable suggestions

### Sample Code for Running Audit

```javascript
import { A11yAuditor } from './skills/a11y-guardian/src/auditor.js';
import { WCAGLevel } from './skills/a11y-guardian/src/wcag-rules.js';

// Audit a single file
const result = await A11yAuditor.auditFile(fileContent, filename, {
  level: WCAGLevel.AA
});

// Format the report
const report = A11yAuditor.formatReport(result, 'text');
```

### Key Behaviors

- Always show a summary first with total counts
- Group issues by rule for clarity
- Include the specific WCAG criterion for each issue
- Provide actionable suggestions for fixes
- For JSX/TSX files, extract and parse the JSX content
- For Vue SFCs, parse the `<template>` section
- For Svelte files, parse HTML outside script/style blocks

### After Audit

Suggest running `/a11y-fix` if issues are found that can be auto-fixed.
