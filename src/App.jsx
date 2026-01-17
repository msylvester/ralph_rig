import React, { useState } from 'react'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import ProductSection from './components/ProductSection'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

/**
 * WCAG Non-Compliant Demo Application
 * This application intentionally violates multiple WCAG 2.1 guidelines
 * for educational and testing purposes.
 *
 * VIOLATIONS INCLUDED:
 * - Missing skip navigation links
 * - No landmark regions
 * - Poor heading hierarchy
 * - Images without alt text
 * - Poor color contrast
 * - Form inputs without labels
 * - Non-keyboard accessible elements
 * - Auto-playing content
 * - Missing focus indicators
 * - Click handlers on non-interactive elements
 * - Time-based content without controls
 */

function App() {
  const [showModal, setShowModal] = useState(false)

  return (
    // WCAG Violation: Using div instead of semantic elements, no main landmark
    <div className="app-container">
      {/* WCAG Violation: No skip navigation link */}

      <Header />

      {/* WCAG Violation: No <main> landmark */}
      <div className="main-content">
        <HeroSection />
        <ProductSection />
        <ContactForm />

        {/* WCAG Violation: Decorative div used as button without proper role/keyboard support */}
        <div
          className="floating-action-button"
          onClick={() => setShowModal(true)}
        >
          ?
        </div>
      </div>

      {showModal && (
        // WCAG Violation: Modal without proper focus trap or ARIA attributes
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content">
            {/* WCAG Violation: Close button without accessible name */}
            <span className="close-btn" onClick={() => setShowModal(false)}>×</span>
            <div className="modal-body">
              {/* WCAG Violation: Information conveyed by color alone */}
              <p>Items in <span className="red-text">red</span> are required.</p>
              <p>Items in <span className="green-text">green</span> are optional.</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default App
