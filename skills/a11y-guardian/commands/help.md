---
description: Show help for a11y-guardian accessibility commands
---

# A11y Guardian Help

Display help information for the accessibility auditor plugin.

## Available Commands

### `/a11y-audit` - Run Accessibility Audit
Scan your codebase for WCAG 2.1/2.2 accessibility issues.

**Usage:**
```
/a11y-audit [file-pattern] [--level A|AA|AAA] [--format text|json|markdown]
```

**Examples:**
```
/a11y-audit                     # Audit all supported files
/a11y-audit src/**/*.jsx        # Audit React components
/a11y-audit --level AAA         # Strict AAA compliance
```

---

### `/a11y-fix` - Auto-Fix Issues
Automatically fix common accessibility problems.

**Usage:**
```
/a11y-fix [file-pattern] [--dry-run] [--interactive]
```

**Examples:**
```
/a11y-fix                       # Fix all files
/a11y-fix --dry-run             # Preview changes only
/a11y-fix --interactive         # Confirm each fix
```

**What it fixes:**
- Missing alt attributes on images
- Form inputs without labels
- Skipped heading levels
- Missing lang attribute on HTML
- Buttons without accessible names

---

### `/contrast-check` - Check Color Contrast
Validate color contrast ratios for WCAG compliance.

**Usage:**
```
/contrast-check [file-pattern] [--level AA|AAA]
/contrast-check --fg COLOR --bg COLOR
```

**Examples:**
```
/contrast-check                 # Check all CSS files
/contrast-check --fg #333 --bg #fff  # Check specific colors
/contrast-check --level AAA     # Enhanced contrast check
```

**Requirements:**
- AA Normal text: 4.5:1
- AA Large text: 3:1
- AAA Normal text: 7:1
- AAA Large text: 4.5:1

---

## Supported File Types

| Extension | Description |
|-----------|-------------|
| `.html`, `.htm` | HTML files |
| `.jsx`, `.tsx` | React components |
| `.vue` | Vue single-file components |
| `.svelte` | Svelte components |
| `.css` | Stylesheets (for contrast checking) |

---

## Quick Tips

1. **Start with an audit**: Run `/a11y-audit` to see all issues
2. **Fix what you can**: Use `/a11y-fix` for automatic fixes
3. **Check contrast**: Run `/contrast-check` on your CSS
4. **Review manually**: Some issues require human judgment
5. **Aim for AA**: Level AA is the recommended standard

---

## Getting Help

- View this help: `/a11y-help`
- See the README: `skills/a11y-guardian/README.md`
- Run tests: `npm test -- skills/a11y-guardian/tests/`
