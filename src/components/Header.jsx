import React from 'react'

/**
 * Header Component with WCAG Violations:
 * - No <header> landmark
 * - Navigation without <nav> landmark
 * - Links without proper focus indication
 * - Logo image without alt text
 * - Low contrast text
 */
function Header() {
  return (
    // WCAG Violation: Using div instead of <header>
    <div className="header">
      {/* WCAG Violation: Image without alt attribute */}
      <img src="https://via.placeholder.com/150x50" className="logo" />

      {/* WCAG Violation: Navigation without <nav> element */}
      <div className="navigation">
        <ul className="nav-list">
          {/* WCAG Violation: Empty links, poor contrast */}
          <li><a href="#" className="nav-link">Home</a></li>
          <li><a href="#" className="nav-link">About</a></li>
          <li><a href="#" className="nav-link">Products</a></li>
          <li><a href="#" className="nav-link">Services</a></li>
          <li><a href="#" className="nav-link">Contact</a></li>
        </ul>
      </div>

      {/* WCAG Violation: Icon-only button without accessible name */}
      <button className="menu-btn">
        <span className="hamburger-icon">☰</span>
      </button>
    </div>
  )
}

export default Header
