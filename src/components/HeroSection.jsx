import React, { useEffect } from 'react'

/**
 * Hero Section with WCAG Violations:
 * - Background image with text overlay (poor contrast)
 * - Auto-playing video without controls
 * - Heading hierarchy skip (h4 without h2, h3)
 * - Animated content that can't be paused
 * - Text embedded in images
 */
function HeroSection() {
  useEffect(() => {
    // WCAG Violation: Auto-scrolling carousel without pause control
    const interval = setInterval(() => {
      const carousel = document.querySelector('.carousel')
      if (carousel) {
        carousel.scrollLeft += 1
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    // WCAG Violation: No section landmark or heading
    <div className="hero-section">
      {/* WCAG Violation: Background image with overlaid text - contrast issues */}
      <div className="hero-banner">
        {/* WCAG Violation: Skipping heading levels (h1 to h4) */}
        <h4 className="hero-title">Welcome to Our Amazing Store!</h4>
        <p className="hero-subtitle">Best deals you'll ever find</p>

        {/* WCAG Violation: Link that looks like a button but has poor focus */}
        <a href="#" className="cta-button">Shop Now</a>
      </div>

      {/* WCAG Violation: Auto-playing video without controls, captions, or transcript */}
      <video className="promo-video" autoPlay loop muted>
        <source src="promo.mp4" type="video/mp4" />
      </video>

      {/* WCAG Violation: Scrolling/moving content without pause mechanism */}
      <div className="carousel">
        <div className="carousel-track">
          {/* WCAG Violation: Images without alt text */}
          <img src="https://via.placeholder.com/200x150" />
          <img src="https://via.placeholder.com/200x150" />
          <img src="https://via.placeholder.com/200x150" />
          <img src="https://via.placeholder.com/200x150" />
          <img src="https://via.placeholder.com/200x150" />
        </div>
      </div>

      {/* WCAG Violation: Important information conveyed through image of text */}
      <img
        src="https://via.placeholder.com/400x100?text=50%25+OFF+TODAY+ONLY"
        className="promo-banner"
      />

      {/* WCAG Violation: Blinking/flashing content */}
      <div className="flash-sale-banner">
        🔥 FLASH SALE! Limited Time Only! 🔥
      </div>
    </div>
  )
}

export default HeroSection
