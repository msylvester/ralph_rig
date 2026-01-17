import { WCAGRules, WCAGLevel, RuleSeverity } from './wcag-rules.js';

// Helper to extract JSX/TSX content for auditing
function extractJSXContent(content) {
  const jsxBlocks = [];

  // Match return statements with JSX
  const returnRegex = /return\s*\(\s*([\s\S]*?)\s*\);?/g;
  let match;
  while ((match = returnRegex.exec(content)) !== null) {
    jsxBlocks.push(match[1]);
  }

  // Match arrow function returns with parens
  const arrowRegex = /=>\s*\(\s*([\s\S]*?)\s*\)(?:\s*[;,}]|\s*$)/g;
  while ((match = arrowRegex.exec(content)) !== null) {
    jsxBlocks.push(match[1]);
  }

  // If we found return blocks, also extract any nested JSX inside expressions
  // This catches {condition && <img />} patterns
  if (jsxBlocks.length > 0) {
    const combinedContent = jsxBlocks.join('\n');

    // Find self-closing tags inside JSX expressions
    const insideExpressions = combinedContent.match(/<[a-z][a-z0-9]*\s+[^>]*\/>/gi) || [];
    jsxBlocks.push(...insideExpressions);

    return jsxBlocks.join('\n');
  }

  // Otherwise find individual JSX tags
  const selfClosingRegex = /<([a-z][a-z0-9]*)\s+[^>]*\/>/gi;
  while ((match = selfClosingRegex.exec(content)) !== null) {
    jsxBlocks.push(match[0]);
  }

  const openingTagRegex = /<([a-z][a-z0-9]*)\s+[^>]*>[\s\S]*?<\/\1>/gi;
  while ((match = openingTagRegex.exec(content)) !== null) {
    jsxBlocks.push(match[0]);
  }

  // If no matches, try to find any JSX-like content
  if (jsxBlocks.length === 0) {
    const jsxTagRegex = /<[A-Za-z][^>]*(?:\/>|>[\s\S]*?<\/[A-Za-z]+>)/g;
    while ((match = jsxTagRegex.exec(content)) !== null) {
      jsxBlocks.push(match[0]);
    }
  }

  return jsxBlocks.join('\n');
}

// Helper to extract template content from Vue SFCs
function extractVueTemplate(content) {
  const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
  return templateMatch ? templateMatch[1] : '';
}

// Helper to extract HTML content from Svelte files
function extractSvelteContent(content) {
  // Remove script and style blocks
  let html = content.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  return html;
}

// Convert JSX self-closing tags to HTML
function normalizeJSXToHTML(content) {
  // Convert JSX self-closing tags (e.g., <img /> to <img>)
  let html = content;

  // Replace className with class (for cheerio parsing)
  html = html.replace(/className=/g, 'class=');

  // Handle JSX expressions - remove them for now
  html = html.replace(/\{[^}]*\}/g, '');

  // Handle JSX fragments
  html = html.replace(/<>/g, '<div>');
  html = html.replace(/<\/>/g, '</div>');

  // Handle React.Fragment
  html = html.replace(/<React\.Fragment>/g, '<div>');
  html = html.replace(/<\/React\.Fragment>/g, '</div>');

  return html;
}

// Determine file type and extract auditable HTML
function getAuditableHTML(content, filename) {
  const ext = filename.split('.').pop().toLowerCase();

  switch (ext) {
    case 'jsx':
    case 'tsx':
      const jsxContent = extractJSXContent(content);
      return normalizeJSXToHTML(jsxContent);

    case 'vue':
      const vueTemplate = extractVueTemplate(content);
      return normalizeJSXToHTML(vueTemplate);

    case 'svelte':
      const svelteContent = extractSvelteContent(content);
      return normalizeJSXToHTML(svelteContent);

    case 'html':
    case 'htm':
    default:
      return content;
  }
}

// Get WCAG levels to include based on target level
function getLevelsToInclude(targetLevel) {
  switch (targetLevel) {
    case WCAGLevel.A:
      return [WCAGLevel.A];
    case WCAGLevel.AA:
      return [WCAGLevel.A, WCAGLevel.AA];
    case WCAGLevel.AAA:
      return [WCAGLevel.A, WCAGLevel.AA, WCAGLevel.AAA];
    default:
      return [WCAGLevel.A, WCAGLevel.AA]; // Default to AA
  }
}

export const A11yAuditor = {
  /**
   * Audit HTML content for accessibility issues
   * @param {string} html - HTML content to audit
   * @param {object} options - Audit options
   * @param {string} options.level - WCAG level to check (A, AA, AAA)
   * @returns {object} Audit result with issues and summary
   */
  audit(html, options = {}) {
    const targetLevel = options.level || WCAGLevel.AA;
    const levelsToInclude = getLevelsToInclude(targetLevel);

    // Get rules that match the level filter
    const rules = WCAGRules.getAllRules().filter(rule =>
      levelsToInclude.includes(rule.wcagLevel)
    );

    // Run all applicable rules
    const issues = [];
    for (const rule of rules) {
      const ruleIssues = rule.check(html);
      issues.push(...ruleIssues);
    }

    // Calculate summary
    const summary = {
      total: issues.length,
      errors: issues.filter(i => i.severity === RuleSeverity.ERROR).length,
      warnings: issues.filter(i => i.severity === RuleSeverity.WARNING).length,
      info: issues.filter(i => i.severity === RuleSeverity.INFO).length,
      level: targetLevel
    };

    return { issues, summary };
  },

  /**
   * Audit a file (supports HTML, JSX, TSX, Vue, Svelte)
   * @param {string} content - File content
   * @param {string} filename - File name for type detection
   * @param {object} options - Audit options
   * @returns {Promise<object>} Audit result with file info
   */
  async auditFile(content, filename, options = {}) {
    const html = getAuditableHTML(content, filename);
    const result = this.audit(html, options);

    return {
      file: filename,
      ...result
    };
  },

  /**
   * Format audit result as a report
   * @param {object} result - Audit result
   * @param {string} format - Output format (text, json, markdown)
   * @returns {string} Formatted report
   */
  formatReport(result, format = 'text') {
    switch (format) {
      case 'json':
        return JSON.stringify(result, null, 2);

      case 'markdown':
        return formatMarkdownReport(result);

      case 'text':
      default:
        return formatTextReport(result);
    }
  }
};

function formatTextReport(result) {
  const lines = [];

  // Header
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('                    A11Y ACCESSIBILITY AUDIT');
  lines.push('═══════════════════════════════════════════════════════════════');
  lines.push('');

  // Summary
  lines.push(`SUMMARY (WCAG ${result.summary.level})`);
  lines.push('───────────────────────────────────────────────────────────────');
  lines.push(`  Total issues:  ${result.summary.total}`);
  lines.push(`  Errors:        ${result.summary.errors}`);
  lines.push(`  Warnings:      ${result.summary.warnings}`);
  lines.push(`  Info:          ${result.summary.info}`);
  lines.push('');

  if (result.issues.length === 0) {
    lines.push('✅ No accessibility issues found!');
    return lines.join('\n');
  }

  // Group issues by rule
  const issuesByRule = {};
  for (const issue of result.issues) {
    if (!issuesByRule[issue.ruleId]) {
      issuesByRule[issue.ruleId] = [];
    }
    issuesByRule[issue.ruleId].push(issue);
  }

  // Output issues grouped by rule
  lines.push('ISSUES');
  lines.push('───────────────────────────────────────────────────────────────');

  for (const [ruleId, issues] of Object.entries(issuesByRule)) {
    const rule = WCAGRules.getRule(ruleId);
    const severityIcon = getSeverityIcon(issues[0].severity);

    lines.push('');
    lines.push(`${severityIcon} ${rule?.name || ruleId} (${issues.length} issue${issues.length > 1 ? 's' : ''})`);
    lines.push(`   Rule: ${ruleId} | WCAG ${rule?.wcagCriteria || 'N/A'}`);

    for (const issue of issues) {
      lines.push(`   └─ ${issue.message}`);
      if (issue.element) {
        const truncatedElement = truncateString(issue.element, 60);
        lines.push(`      Element: ${truncatedElement}`);
      }
      if (issue.suggestion) {
        lines.push(`      💡 ${issue.suggestion}`);
      }
    }
  }

  return lines.join('\n');
}

function formatMarkdownReport(result) {
  const lines = [];

  // Header
  lines.push('# Accessibility Audit Report');
  lines.push('');

  // Summary
  lines.push(`## Summary (WCAG ${result.summary.level})`);
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Total Issues | ${result.summary.total} |`);
  lines.push(`| Errors | ${result.summary.errors} |`);
  lines.push(`| Warnings | ${result.summary.warnings} |`);
  lines.push(`| Info | ${result.summary.info} |`);
  lines.push('');

  if (result.issues.length === 0) {
    lines.push('✅ **No accessibility issues found!**');
    return lines.join('\n');
  }

  // Group issues by severity
  const errors = result.issues.filter(i => i.severity === RuleSeverity.ERROR);
  const warnings = result.issues.filter(i => i.severity === RuleSeverity.WARNING);
  const info = result.issues.filter(i => i.severity === RuleSeverity.INFO);

  if (errors.length > 0) {
    lines.push('## ❌ Errors');
    lines.push('');
    for (const issue of errors) {
      const rule = WCAGRules.getRule(issue.ruleId);
      lines.push(`### ${rule?.name || issue.ruleId}`);
      lines.push(`- **Rule:** \`${issue.ruleId}\` (WCAG ${rule?.wcagCriteria || 'N/A'})`);
      lines.push(`- **Message:** ${issue.message}`);
      if (issue.element) {
        lines.push(`- **Element:** \`${truncateString(issue.element, 80)}\``);
      }
      if (issue.suggestion) {
        lines.push(`- **Suggestion:** ${issue.suggestion}`);
      }
      lines.push('');
    }
  }

  if (warnings.length > 0) {
    lines.push('## ⚠️ Warnings');
    lines.push('');
    for (const issue of warnings) {
      const rule = WCAGRules.getRule(issue.ruleId);
      lines.push(`### ${rule?.name || issue.ruleId}`);
      lines.push(`- **Rule:** \`${issue.ruleId}\` (WCAG ${rule?.wcagCriteria || 'N/A'})`);
      lines.push(`- **Message:** ${issue.message}`);
      if (issue.suggestion) {
        lines.push(`- **Suggestion:** ${issue.suggestion}`);
      }
      lines.push('');
    }
  }

  if (info.length > 0) {
    lines.push('## ℹ️ Info');
    lines.push('');
    for (const issue of info) {
      const rule = WCAGRules.getRule(issue.ruleId);
      lines.push(`- **${rule?.name || issue.ruleId}:** ${issue.message}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function getSeverityIcon(severity) {
  switch (severity) {
    case RuleSeverity.ERROR:
      return '❌ [error]';
    case RuleSeverity.WARNING:
      return '⚠️  [warning]';
    case RuleSeverity.INFO:
      return 'ℹ️  [info]';
    default:
      return '•';
  }
}

function truncateString(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}
