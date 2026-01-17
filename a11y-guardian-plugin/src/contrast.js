import * as cheerio from 'cheerio';
import * as csstree from 'css-tree';

// Named colors to RGB
const NAMED_COLORS = {
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  red: { r: 255, g: 0, b: 0 },
  green: { r: 0, g: 128, b: 0 },
  blue: { r: 0, g: 0, b: 255 },
  yellow: { r: 255, g: 255, b: 0 },
  cyan: { r: 0, g: 255, b: 255 },
  magenta: { r: 255, g: 0, b: 255 },
  gray: { r: 128, g: 128, b: 128 },
  grey: { r: 128, g: 128, b: 128 },
  silver: { r: 192, g: 192, b: 192 },
  maroon: { r: 128, g: 0, b: 0 },
  olive: { r: 128, g: 128, b: 0 },
  lime: { r: 0, g: 255, b: 0 },
  aqua: { r: 0, g: 255, b: 255 },
  teal: { r: 0, g: 128, b: 128 },
  navy: { r: 0, g: 0, b: 128 },
  fuchsia: { r: 255, g: 0, b: 255 },
  purple: { r: 128, g: 0, b: 128 },
  orange: { r: 255, g: 165, b: 0 },
  pink: { r: 255, g: 192, b: 203 },
  brown: { r: 165, g: 42, b: 42 },
  transparent: { r: 0, g: 0, b: 0, a: 0 }
};

/**
 * Parse a color string into RGB components
 */
export function parseColor(colorStr) {
  if (!colorStr) return null;

  const color = colorStr.trim().toLowerCase();

  // Named color
  if (NAMED_COLORS[color]) {
    return { ...NAMED_COLORS[color] };
  }

  // Hex color
  if (color.startsWith('#')) {
    return parseHex(color);
  }

  // RGB/RGBA
  if (color.startsWith('rgb')) {
    return parseRGB(color);
  }

  // HSL/HSLA
  if (color.startsWith('hsl')) {
    return parseHSL(color);
  }

  return null;
}

function parseHex(hex) {
  let h = hex.slice(1);

  // Expand 3-char hex
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }

  // Expand 4-char hex (with alpha)
  if (h.length === 4) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }

  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  const result = { r, g, b };

  if (h.length === 8) {
    result.a = parseInt(h.slice(6, 8), 16) / 255;
  }

  return result;
}

function parseRGB(rgb) {
  const match = rgb.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!match) return null;

  const result = {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10)
  };

  if (match[4] !== undefined) {
    result.a = parseFloat(match[4]);
  }

  return result;
}

function parseHSL(hsl) {
  const match = hsl.match(/hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!match) return null;

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  // HSL to RGB conversion
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const result = {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };

  if (match[4] !== undefined) {
    result.a = parseFloat(match[4]);
  }

  return result;
}

/**
 * Calculate relative luminance of a color
 * Per WCAG 2.1 formula
 */
function getLuminance(color) {
  const sRGB = [color.r, color.g, color.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Per WCAG 2.1 formula
 */
export function getContrastRatio(color1, color2) {
  const c1 = typeof color1 === 'string' ? parseColor(color1) : color1;
  const c2 = typeof color2 === 'string' ? parseColor(color2) : color2;

  if (!c1 || !c2) return 1;

  const l1 = getLuminance(c1);
  const l2 = getLuminance(c2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if colors meet WCAG requirements
 */
export function meetsWCAG(foreground, background, level = 'AA', isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);

  let requiredRatio;
  if (level === 'AAA') {
    requiredRatio = isLargeText ? 4.5 : 7;
  } else { // AA
    requiredRatio = isLargeText ? 3 : 4.5;
  }

  return {
    passes: ratio >= requiredRatio,
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
    level
  };
}

/**
 * Convert RGB to hex
 */
function rgbToHex(color) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(color.r) + toHex(color.g) + toHex(color.b);
}

export const ContrastChecker = {
  /**
   * Check contrast issues in CSS
   */
  checkCSS(css, options = {}) {
    const level = options.level || 'AA';
    const issues = [];

    try {
      const ast = csstree.parse(css);

      csstree.walk(ast, {
        visit: 'Rule',
        enter: (node) => {
          if (node.type !== 'Rule' || !node.prelude || !node.block) return;

          let foreground = null;
          let background = null;
          let selector = '';

          try {
            selector = csstree.generate(node.prelude);
          } catch (e) {
            return;
          }

          // Find color and background-color declarations
          csstree.walk(node.block, {
            visit: 'Declaration',
            enter: (decl) => {
              const property = decl.property.toLowerCase();
              const value = csstree.generate(decl.value);

              if (property === 'color') {
                foreground = value;
              } else if (property === 'background-color' || property === 'background') {
                // For shorthand, try to extract just the color
                const parsed = parseColor(value);
                if (parsed) {
                  background = value;
                }
              }
            }
          });

          // Only check if both colors are defined
          if (foreground && background) {
            const result = meetsWCAG(foreground, background, level, false);

            if (!result.passes) {
              issues.push({
                selector,
                foreground,
                background,
                ratio: result.ratio,
                requiredRatio: result.requiredRatio,
                level
              });
            }
          }
        }
      });
    } catch (e) {
      // CSS parsing error, return empty issues
    }

    return issues;
  },

  /**
   * Check contrast in inline HTML styles
   */
  checkHTML(html, options = {}) {
    const $ = cheerio.load(html);
    const level = options.level || 'AA';
    const issues = [];

    $('[style]').each((_, el) => {
      const $el = $(el);
      const style = $el.attr('style');

      if (!style) return;

      // Parse inline style
      let foreground = null;
      let background = null;

      const colorMatch = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
      const bgMatch = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);

      if (colorMatch) foreground = colorMatch[1].trim();
      if (bgMatch) background = bgMatch[1].trim();

      if (foreground && background) {
        const result = meetsWCAG(foreground, background, level, false);

        if (!result.passes) {
          issues.push({
            element: $.html(el).substring(0, 100),
            foreground,
            background,
            ratio: result.ratio,
            requiredRatio: result.requiredRatio,
            level
          });
        }
      }
    });

    return issues;
  },

  /**
   * Suggest a fix for a failing color combination
   */
  suggestFix(foreground, background, level = 'AA', isLargeText = false) {
    const fgColor = parseColor(foreground);
    const bgColor = parseColor(background);

    if (!fgColor || !bgColor) {
      return { error: 'Could not parse colors' };
    }

    const requiredRatio = level === 'AAA'
      ? (isLargeText ? 4.5 : 7)
      : (isLargeText ? 3 : 4.5);

    const bgLuminance = getLuminance(bgColor);

    // Determine if we should make foreground lighter or darker
    const shouldDarken = bgLuminance > 0.5;

    // Binary search for a color that meets the requirement
    let low = 0;
    let high = 1;
    let suggestedColor = { ...fgColor };

    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;

      if (shouldDarken) {
        // Darken the color
        suggestedColor = {
          r: Math.round(fgColor.r * (1 - mid)),
          g: Math.round(fgColor.g * (1 - mid)),
          b: Math.round(fgColor.b * (1 - mid))
        };
      } else {
        // Lighten the color
        suggestedColor = {
          r: Math.round(fgColor.r + (255 - fgColor.r) * mid),
          g: Math.round(fgColor.g + (255 - fgColor.g) * mid),
          b: Math.round(fgColor.b + (255 - fgColor.b) * mid)
        };
      }

      const ratio = getContrastRatio(suggestedColor, bgColor);

      if (ratio >= requiredRatio) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const suggestedHex = rgbToHex(suggestedColor);
    const newRatio = getContrastRatio(suggestedColor, bgColor);

    return {
      originalForeground: foreground,
      originalBackground: background,
      suggestedForeground: suggestedHex,
      newRatio: Math.round(newRatio * 100) / 100,
      requiredRatio
    };
  },

  /**
   * Format contrast issues as a report
   */
  formatReport(issues, format = 'text') {
    if (format === 'markdown') {
      return formatMarkdownReport(issues);
    }
    return formatTextReport(issues);
  }
};

function formatTextReport(issues) {
  const lines = [];

  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                  COLOR CONTRAST REPORT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  if (issues.length === 0) {
    lines.push('✅ No contrast issues found!');
    return lines.join('\n');
  }

  lines.push(`Found ${issues.length} contrast issue(s):`);
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push('');

  for (const issue of issues) {
    const location = issue.selector || issue.element || 'Unknown';
    lines.push(`❌ ${location}`);
    lines.push(`   Foreground: ${issue.foreground}`);
    lines.push(`   Background: ${issue.background}`);
    lines.push(`   Ratio: ${issue.ratio}:1 (required: ${issue.requiredRatio}:1 for ${issue.level})`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatMarkdownReport(issues) {
  const lines = [];

  lines.push('# Color Contrast Report');
  lines.push('');

  if (issues.length === 0) {
    lines.push('✅ **No contrast issues found!**');
    return lines.join('\n');
  }

  lines.push(`Found **${issues.length}** contrast issue(s):`);
  lines.push('');
  lines.push('| Location | Foreground | Background | Ratio | Required |');
  lines.push('|----------|------------|------------|-------|----------|');

  for (const issue of issues) {
    const location = issue.selector || (issue.element ? issue.element.substring(0, 30) + '...' : 'Unknown');
    lines.push(`| ${location} | ${issue.foreground} | ${issue.background} | ${issue.ratio}:1 | ${issue.requiredRatio}:1 |`);
  }

  return lines.join('\n');
}
