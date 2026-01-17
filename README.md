# WCAG Non-Compliant React Demo

A React project that intentionally demonstrates common WCAG (Web Content Accessibility Guidelines) violations for **educational and testing purposes**.

## Purpose

This project is designed for:
- Learning about web accessibility issues
- Testing accessibility auditing tools (axe, WAVE, Lighthouse)
- Training developers to identify accessibility problems
- Demonstrating the impact of poor accessibility practices

## WCAG Violations Included

### Perceivable (Principle 1)
- Images without alt text
- Poor color contrast ratios (< 4.5:1 for normal text)
- Information conveyed by color alone
- Text embedded in images
- Auto-playing video without captions
- Flashing/blinking content

### Operable (Principle 2)
- Missing skip navigation links
- Keyboard traps (modal without proper focus management)
- Small click/touch targets (< 44x44px)
- Time-limited interactions without extension options
- Focus indicators removed
- Non-keyboard accessible interactive elements

### Understandable (Principle 3)
- Missing lang attribute on HTML element
- Form inputs without associated labels
- Placeholder text used as labels
- Error messages not associated with inputs
- Required fields not clearly indicated

### Robust (Principle 4)
- Non-semantic HTML (divs instead of landmarks)
- Missing ARIA attributes where needed
- Invalid heading hierarchy
- Interactive elements without proper roles

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app with multiple violations
├── styles.css            # CSS with contrast/focus violations
└── components/
    ├── Header.jsx        # Navigation accessibility issues
    ├── HeroSection.jsx   # Auto-play, carousel, contrast issues
    ├── ProductSection.jsx # Table, color-only status, tiny targets
    ├── ContactForm.jsx   # Form accessibility violations
    └── Footer.jsx        # Link and semantic issues
```

## Disclaimer

**This project is intentionally inaccessible and should NEVER be used as a template for real applications.** It exists solely for educational purposes to help developers understand and identify accessibility issues.

For guidance on building accessible web applications, refer to:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
