# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A11y Guardian is an Accessibility Auditor plugin for Claude Code that provides WCAG 2.1/2.2 compliance checking, auto-fixes, and contrast validation.

## Development Setup

```bash
npm install
npm test
```

## Project Structure

```
skills/a11y-guardian/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── commands/
│   ├── a11y-audit.md        # Audit command instructions
│   ├── a11y-fix.md          # Auto-fix command instructions
│   ├── contrast-check.md    # Contrast check command
│   └── help.md              # Help command
├── src/
│   ├── index.js             # Main export module
│   ├── auditor.js           # Audit engine
│   ├── fixer.js             # Auto-fix logic
│   ├── wcag-rules.js        # WCAG rule definitions
│   └── contrast.js          # Contrast ratio calculations
├── tests/
│   ├── auditor.test.js
│   ├── fixer.test.js
│   ├── wcag-rules.test.js
│   └── contrast.test.js
└── README.md
```

## Commands

- `/a11y-audit` - Run WCAG compliance audits
- `/a11y-fix` - Auto-fix accessibility issues
- `/contrast-check` - Validate color contrast ratios
- `/help` - Show help documentation

## Testing

```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```
