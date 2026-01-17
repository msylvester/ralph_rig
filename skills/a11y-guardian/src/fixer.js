import * as cheerio from 'cheerio';

// Convert camelCase/snake_case to readable text
function toReadableText(str) {
  if (!str) return '';

  // Handle camelCase
  let result = str.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Handle snake_case and kebab-case
  result = result.replace(/[-_]/g, ' ');

  // Capitalize first letter of each word
  return result.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

// Input types that don't need labels
const EXEMPT_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'reset', 'image']);

export const A11yFixer = {
  /**
   * Fix missing alt attributes on images
   */
  fixImgAlt(html) {
    const $ = cheerio.load(html, { xml: { decodeEntities: false } });
    const changes = [];

    $('img').each((_, el) => {
      const $el = $(el);
      const alt = $el.attr('alt');
      const role = $el.attr('role');

      // Skip if already has alt or is marked as decorative
      if (alt !== undefined || role === 'presentation' || role === 'none') {
        return;
      }

      const original = $.html(el);
      $el.attr('alt', '');
      const replacement = $.html(el);

      changes.push({
        type: 'add-alt',
        description: 'Added empty alt attribute for image (mark as decorative or add description)',
        original,
        replacement
      });
    });

    return {
      fixed: $.html(),
      changes
    };
  },

  /**
   * Fix missing labels on form inputs
   */
  fixFormLabels(html) {
    const $ = cheerio.load(html, { xml: { decodeEntities: false } });
    const changes = [];

    $('input, select, textarea').each((_, el) => {
      const $el = $(el);
      const type = $el.attr('type') || 'text';
      const id = $el.attr('id');

      // Skip exempt input types
      if (EXEMPT_INPUT_TYPES.has(type)) {
        return;
      }

      // Skip if already has labeling
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

      // Generate label text from available info
      let labelText = '';

      // Use placeholder if available
      const placeholder = $el.attr('placeholder');
      if (placeholder) {
        labelText = placeholder;
      }
      // Use name attribute
      else if ($el.attr('name')) {
        labelText = toReadableText($el.attr('name'));
      }
      // Use id attribute
      else if (id) {
        labelText = toReadableText(id);
      }
      // Use type as fallback
      else {
        labelText = toReadableText(type) + ' field';
      }

      const original = $.html(el);
      $el.attr('aria-label', labelText);
      const replacement = $.html(el);

      changes.push({
        type: 'add-aria-label',
        description: `Added aria-label="${labelText}" to form input`,
        original,
        replacement
      });
    });

    return {
      fixed: $.html(),
      changes
    };
  },

  /**
   * Fix heading hierarchy (skipped levels)
   */
  fixHeadingHierarchy(html) {
    const $ = cheerio.load(html, { xml: { decodeEntities: false } });
    const changes = [];
    let lastLevel = 0;

    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const level = parseInt(el.tagName.charAt(1), 10);

      if (lastLevel > 0 && level > lastLevel + 1) {
        const correctLevel = lastLevel + 1;
        const original = $.html(el);
        const content = $(el).html();
        const attributes = getElementAttributes($, el);

        // Replace the element with corrected heading level
        const newTag = `h${correctLevel}`;
        const attrStr = Object.entries(attributes)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        const replacement = attrStr
          ? `<${newTag} ${attrStr}>${content}</${newTag}>`
          : `<${newTag}>${content}</${newTag}>`;

        $(el).replaceWith(replacement);

        changes.push({
          type: 'fix-heading-level',
          description: `Changed h${level} to h${correctLevel} to fix hierarchy`,
          original,
          replacement
        });

        lastLevel = correctLevel;
      } else {
        lastLevel = level;
      }
    });

    return {
      fixed: $.html(),
      changes
    };
  },

  /**
   * Fix missing lang attribute on html element
   */
  fixHtmlLang(html, defaultLang = 'en') {
    const $ = cheerio.load(html, { xml: { decodeEntities: false } });
    const changes = [];
    const htmlEl = $('html');

    if (htmlEl.length > 0) {
      const lang = htmlEl.attr('lang');

      if (!lang || lang.trim() === '') {
        const original = `<html${lang !== undefined ? ` lang="${lang}"` : ''}>`;
        htmlEl.attr('lang', defaultLang);
        const replacement = `<html lang="${defaultLang}">`;

        changes.push({
          type: 'add-lang',
          description: `Added lang="${defaultLang}" to html element`,
          original,
          replacement
        });
      }
    }

    return {
      fixed: $.html(),
      changes
    };
  },

  /**
   * Fix buttons without accessible names
   */
  fixButtonName(html) {
    const $ = cheerio.load(html, { xml: { decodeEntities: false } });
    const changes = [];

    $('button, [role="button"]').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      const ariaLabel = $el.attr('aria-label');
      const ariaLabelledby = $el.attr('aria-labelledby');
      const title = $el.attr('title');

      // Skip if already has accessible name
      if (text || ariaLabel || ariaLabelledby || title) {
        return;
      }

      // Try to determine button purpose from context
      let labelText = 'Button';

      // Check for common icon patterns
      const hasIcon = $el.find('svg, i, span[class*="icon"]').length > 0;
      if (hasIcon) {
        // Try to infer from class names
        const className = $el.attr('class') || '';
        if (className.includes('close')) labelText = 'Close';
        else if (className.includes('menu')) labelText = 'Menu';
        else if (className.includes('search')) labelText = 'Search';
        else if (className.includes('delete')) labelText = 'Delete';
        else if (className.includes('edit')) labelText = 'Edit';
        else if (className.includes('add')) labelText = 'Add';
        else if (className.includes('remove')) labelText = 'Remove';
        else if (className.includes('submit')) labelText = 'Submit';
        else if (className.includes('cancel')) labelText = 'Cancel';
        else labelText = 'Button (needs description)';
      }

      const original = $.html(el);
      $el.attr('aria-label', labelText);
      const replacement = $.html(el);

      changes.push({
        type: 'add-button-label',
        description: `Added aria-label="${labelText}" to button`,
        original,
        replacement
      });
    });

    return {
      fixed: $.html(),
      changes
    };
  },

  /**
   * Apply all fixers
   */
  fixAll(html) {
    let current = html;
    const allChanges = [];

    // Apply each fixer in sequence
    const fixers = [
      { name: 'fixImgAlt', fn: this.fixImgAlt },
      { name: 'fixFormLabels', fn: this.fixFormLabels },
      { name: 'fixHeadingHierarchy', fn: this.fixHeadingHierarchy },
      { name: 'fixHtmlLang', fn: this.fixHtmlLang },
      { name: 'fixButtonName', fn: this.fixButtonName }
    ];

    for (const fixer of fixers) {
      const result = fixer.fn.call(this, current);
      current = result.fixed;
      allChanges.push(...result.changes);
    }

    // Calculate summary
    const byType = {};
    for (const change of allChanges) {
      byType[change.type] = (byType[change.type] || 0) + 1;
    }

    return {
      fixed: current,
      changes: allChanges,
      summary: {
        totalChanges: allChanges.length,
        byType
      }
    };
  },

  /**
   * Generate a diff-style patch showing changes
   */
  generatePatch(original, fixed) {
    const originalLines = original.split('\n');
    const fixedLines = fixed.split('\n');
    const patch = [];

    // Simple diff - compare line by line
    const maxLines = Math.max(originalLines.length, fixedLines.length);

    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i];
      const fixedLine = fixedLines[i];

      if (origLine !== fixedLine) {
        if (origLine !== undefined) {
          patch.push(`- ${origLine}`);
        }
        if (fixedLine !== undefined) {
          patch.push(`+ ${fixedLine}`);
        }
      }
    }

    return patch.join('\n');
  }
};

// Helper to get element attributes as object
function getElementAttributes($, el) {
  const attrs = {};
  const rawAttrs = el.attribs || {};
  for (const [key, value] of Object.entries(rawAttrs)) {
    attrs[key] = value;
  }
  return attrs;
}
