import React from 'react'

/**
 * Footer Component with WCAG Violations:
 * - No footer landmark
 * - Links that open in new window without warning
 * - Icon-only social links
 * - Poor color contrast
 * - Small text that can't be resized
 */
function Footer() {
  return (
    // WCAG Violation: Using div instead of <footer>
    <div className="footer">
      <div className="footer-content">
        {/* WCAG Violation: Links that open in new tab without indication */}
        <div className="footer-links">
          <a href="#" target="_blank">Privacy Policy</a>
          <a href="#" target="_blank">Terms of Service</a>
          <a href="#" target="_blank">Cookie Policy</a>
        </div>

        {/* WCAG Violation: Social links with icon-only, no accessible names */}
        <div className="social-links">
          <a href="#" className="social-icon">📘</a>
          <a href="#" className="social-icon">🐦</a>
          <a href="#" className="social-icon">📷</a>
          <a href="#" className="social-icon">💼</a>
        </div>

        {/* WCAG Violation: Low contrast copyright text, small fixed font size */}
        <div className="copyright">
          © 2024 WCAG Non-Compliant Demo. All rights reserved.
        </div>

        {/* WCAG Violation: Link disguised as regular text */}
        <div className="hidden-link" onClick={() => window.location.href = '#secret'}>
          Click here for secret deals
        </div>
      </div>
    </div>
  )
}

export default Footer
