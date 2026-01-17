---
description: Validate color contrast ratios for WCAG compliance
---

# Color Contrast Check Command

Check color contrast ratios to ensure WCAG 2.1 compliance.

## Usage

```
/contrast-check [file-pattern] [--level AA|AAA] [--format text|markdown]
```

Or check specific colors:
```
/contrast-check --fg #333333 --bg #ffffff
```

## Arguments

- `file-pattern`: Glob pattern for CSS files to check (default: `**/*.css`)
- `--level`: WCAG level to check against (default: AA)
- `--format`: Output format (default: text)
- `--fg`: Foreground color to check
- `--bg`: Background color to check

## WCAG Contrast Requirements

### Level AA (Minimum)
- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio

### Level AAA (Enhanced)
- **Normal text**: 7:1 contrast ratio
- **Large text**: 4.5:1 contrast ratio

## Supported Color Formats

- Hex: `#ffffff`, `#fff`
- RGB: `rgb(255, 255, 255)`
- RGBA: `rgba(255, 255, 255, 0.5)`
- HSL: `hsl(0, 0%, 100%)`
- Named colors: `white`, `black`, `red`, etc.

## Example Output

```
═══════════════════════════════════════════════════════════════
                  COLOR CONTRAST REPORT
═══════════════════════════════════════════════════════════════

Found 2 contrast issue(s):
───────────────────────────────────────────────────────────────

❌ .hero-text
   Foreground: #cccccc
   Background: #ffffff
   Ratio: 1.6:1 (required: 4.5:1 for AA)

❌ .subtitle
   Foreground: #888888
   Background: #f0f0f0
   Ratio: 3.1:1 (required: 4.5:1 for AA)

SUGGESTED FIXES:
───────────────────────────────────────────────────────────────

.hero-text: Change #cccccc to #767676 for 4.5:1 ratio
.subtitle: Change #888888 to #6b6b6b for 4.5:1 ratio
```

## Instructions for Claude

When the user invokes this command:

### For file-based checks:

1. **Parse arguments**: Extract file pattern and level
2. **Find CSS files**: Use Glob tool to find matching files
3. **For each file**:
   - Read file content
   - Run `ContrastChecker.checkCSS()`
   - Collect all issues
4. **Check HTML files**: Also scan for inline styles in HTML
5. **Generate suggestions**: For each failing pair, run `ContrastChecker.suggestFix()`
6. **Format report**: Display issues with suggested fixes

### For direct color checks:

1. **Parse colors**: Extract foreground and background
2. **Calculate ratio**: Use `getContrastRatio()`
3. **Check compliance**: Use `meetsWCAG()`
4. **Suggest fix if needed**: Use `ContrastChecker.suggestFix()`

### Sample Code

```javascript
import { ContrastChecker, getContrastRatio, meetsWCAG, parseColor } from './skills/a11y-guardian/src/contrast.js';

// Check specific colors
const ratio = getContrastRatio('#333333', '#ffffff');
const result = meetsWCAG('#333333', '#ffffff', 'AA', false);

if (!result.passes) {
  const suggestion = ContrastChecker.suggestFix('#333333', '#ffffff', 'AA', false);
  console.log(`Suggested fix: ${suggestion.suggestedForeground}`);
}

// Check CSS file
const issues = ContrastChecker.checkCSS(cssContent, { level: 'AA' });
const report = ContrastChecker.formatReport(issues, 'text');
```

### Key Behaviors

- Always show the current ratio alongside the required ratio
- Provide specific color suggestions that meet requirements
- Distinguish between normal and large text requirements
- Group issues by severity (how far below the requirement)
- Consider both CSS files and inline HTML styles

### After Checking

If issues are found, offer to:
1. Show exact color replacements that would pass
2. Update CSS files with the fixed colors (with user confirmation)
