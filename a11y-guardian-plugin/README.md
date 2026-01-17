# A11y Guardian - Claude Code Plugin

Accessibility Auditor plugin for Claude Code - WCAG 2.1/2.2 compliance checking, auto-fixes, and color contrast validation.

## Features

- **`/a11y-audit`** - Run comprehensive WCAG accessibility audits on HTML, JSX, Vue, and Svelte files
- **`/a11y-fix`** - Auto-fix common accessibility issues
- **`/contrast-check`** - Validate color contrast ratios for WCAG compliance
- **`/help`** - Show help for all a11y-guardian commands

## Installation

### Option 1: Symlink to Plugins Cache (Recommended)

```bash
# Clone or download this directory
git clone <repository-url> a11y-guardian-plugin

# Create symlink to Claude's plugins cache
ln -s "$(pwd)/a11y-guardian-plugin" ~/.claude/plugins/cache/a11y-guardian

# Restart Claude Code
```

### Option 2: Use --plugin-dir Flag

```bash
# Run Claude Code with the plugin directory
claude --plugin-dir /path/to/a11y-guardian-plugin
```

### Option 3: Add to Project

Copy the entire `a11y-guardian-plugin` directory into your project and use:

```bash
claude --plugin-dir ./a11y-guardian-plugin
```

## Verification

After installation, restart Claude Code and type `/a11y-` to see autocomplete suggestions for the available commands.

## Usage

### Run an Accessibility Audit

```
/a11y-audit                           # Audit all supported files
/a11y-audit src/**/*.jsx              # Audit React components only
/a11y-audit --level AAA               # Strict AAA compliance check
/a11y-audit --format markdown         # Output in markdown format
```

### Auto-Fix Issues

```
/a11y-fix                             # Fix all files
/a11y-fix --dry-run                   # Preview changes without applying
/a11y-fix --interactive               # Confirm each fix before applying
```

### Check Color Contrast

```
/contrast-check                       # Check all CSS files
/contrast-check --fg #333 --bg #fff   # Check specific color pair
/contrast-check --level AAA           # Enhanced contrast requirements
```

## What It Checks

### WCAG Level A (Basic)
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

### WCAG Level AA (Recommended)
- All Level A checks plus:
- Viewport meta preventing zoom (1.4.4)
- Empty headings (2.4.6)
- Color contrast issues (1.4.3)

### WCAG Level AAA (Enhanced)
- All Level AA checks plus:
- Enhanced contrast requirements (7:1 for normal text, 4.5:1 for large text)

## What It Auto-Fixes

- Adds `alt=""` to images missing alt attributes
- Adds `aria-label` to form inputs without labels
- Fixes skipped heading levels
- Adds `lang="en"` to HTML elements missing lang attribute
- Adds `aria-label` to buttons without accessible names

## Supported File Types

| Extension | Description |
|-----------|-------------|
| `.html`, `.htm` | HTML files |
| `.jsx`, `.tsx` | React components |
| `.vue` | Vue single-file components |
| `.svelte` | Svelte components |
| `.css` | Stylesheets (for contrast checking) |

## Directory Structure

```
a11y-guardian-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── commands/
│   ├── a11y-audit.md        # /a11y-audit command
│   ├── a11y-fix.md          # /a11y-fix command
│   ├── contrast-check.md    # /contrast-check command
│   └── help.md              # /help command
├── src/
│   ├── index.js             # Main exports
│   ├── auditor.js           # A11yAuditor class
│   ├── fixer.js             # A11yFixer class
│   ├── contrast.js          # ContrastChecker utilities
│   └── wcag-rules.js        # WCAG rule definitions
├── tests/
│   ├── auditor.test.js
│   ├── fixer.test.js
│   ├── contrast.test.js
│   └── wcag-rules.test.js
└── README.md
```

## Running Tests

```bash
# From the plugin directory
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
