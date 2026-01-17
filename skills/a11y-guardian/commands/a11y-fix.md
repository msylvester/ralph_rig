---
description: Auto-fix common accessibility issues in HTML/JSX/Vue/Svelte files
---

# Accessibility Auto-Fix Command

Automatically fix common accessibility issues that can be safely resolved.

## Usage

```
/a11y-fix [file-pattern] [--dry-run] [--interactive]
```

## Arguments

- `file-pattern`: Glob pattern for files to fix (default: `**/*.{html,jsx,tsx,vue,svelte}`)
- `--dry-run`: Show what would be fixed without making changes
- `--interactive`: Confirm each fix before applying

## What It Fixes

### Image Alt Text
- Adds `alt=""` to images without alt attribute
- Images are marked as decorative by default - user should add descriptions

### Form Labels
- Adds `aria-label` to form inputs without labels
- Uses id, name, or placeholder to generate label text
- Converts camelCase/snake_case to readable text

### Heading Hierarchy
- Fixes skipped heading levels (e.g., h1 → h3 becomes h1 → h2)
- Preserves heading content and attributes

### HTML Language
- Adds `lang="en"` to html elements missing lang attribute
- Fixes empty lang attributes

### Button Names
- Adds `aria-label` to buttons without accessible names
- Infers purpose from class names when possible

## Example Output

```
═══════════════════════════════════════════════════════════════
                    A11Y AUTO-FIX RESULTS
═══════════════════════════════════════════════════════════════

File: src/components/Header.jsx

CHANGES APPLIED:
───────────────────────────────────────────────────────────────

1. [add-alt] Added empty alt attribute for image
   - <img src="logo.png">
   + <img src="logo.png" alt="">

2. [add-aria-label] Added aria-label="Search" to button
   - <button class="search-btn"><svg>...</svg></button>
   + <button class="search-btn" aria-label="Search"><svg>...</svg></button>

SUMMARY:
  Total changes: 2
  - add-alt: 1
  - add-aria-label: 1
```

## Instructions for Claude

When the user invokes this command:

1. **Parse arguments**: Extract file pattern and flags
2. **Find matching files**: Use Glob tool to find files
3. **For each file**:
   - Read file content
   - Run `A11yFixer.fixAll()`
   - If dry-run, show changes without applying
   - If interactive, show each change and ask for confirmation
   - Otherwise, write fixed content back to file
4. **Show summary**: Display all changes made

### Sample Code for Running Fixes

```javascript
import { A11yFixer } from './skills/a11y-guardian/src/fixer.js';

// Fix all issues in content
const result = A11yFixer.fixAll(fileContent);

// Check what changed
console.log(`Made ${result.summary.totalChanges} changes`);

// Get the fixed content
const fixedContent = result.fixed;

// Generate a patch for review
const patch = A11yFixer.generatePatch(originalContent, fixedContent);
```

### Important Notes

- Always show changes before applying in non-dry-run mode
- Use Edit tool to apply changes (preserves undo history)
- Group changes by file for clarity
- Recommend manual review after fixes are applied
- Some fixes (like empty alt text) need human input to complete

### After Fixing

Suggest running `/a11y-audit` again to verify all issues are resolved and to check for any remaining issues that require manual attention.
