import React, { useState } from 'react'

/**
 * Contact Form with WCAG Violations:
 * - Form inputs without labels
 * - No fieldset/legend for grouped inputs
 * - Placeholder text as only label
 * - Required fields without indication
 * - Error messages not associated with inputs
 * - Time-limited form submission
 * - CAPTCHA without alternative
 */
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false,
  })
  const [errors, setErrors] = useState({})
  const [timeLeft, setTimeLeft] = useState(60)

  // WCAG Violation: Time-limited interaction without ability to extend
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          alert('Session expired! Please refresh.')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validation that doesn't announce errors to screen readers
    const newErrors = {}
    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    setErrors(newErrors)
  }

  return (
    // WCAG Violation: No form landmark, no heading
    <div className="contact-section">
      {/* WCAG Violation: Time display without context */}
      <div className="timer">Time remaining: {timeLeft}s</div>

      <form onSubmit={handleSubmit} className="contact-form">
        {/* WCAG Violation: No fieldset/legend for personal info group */}
        <div className="form-group">
          {/* WCAG Violation: Input without associated label, placeholder as label */}
          <input
            type="text"
            placeholder="Your Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="form-input"
          />
          {/* WCAG Violation: Error not associated with input via aria-describedby */}
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          {/* WCAG Violation: Input without label */}
          <input
            type="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-input"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          {/* WCAG Violation: Input without label, unclear format requirement */}
          <input
            type="tel"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-input"
          />
        </div>

        {/* WCAG Violation: Select without label */}
        <div className="form-group">
          <select
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="form-select"
          >
            <option value="">Select Subject</option>
            <option value="sales">Sales Inquiry</option>
            <option value="support">Technical Support</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* WCAG Violation: Textarea without label */}
        <div className="form-group">
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="form-textarea"
            rows={4}
          />
        </div>

        {/* WCAG Violation: Checkbox without proper label association */}
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            checked={formData.newsletter}
            onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
            className="form-checkbox"
          />
          <span className="checkbox-text">Subscribe to newsletter</span>
        </div>

        {/* WCAG Violation: CAPTCHA without accessible alternative */}
        <div className="captcha-container">
          <img src="https://via.placeholder.com/200x50?text=CAPTCHA+IMAGE" className="captcha-image" />
          {/* WCAG Violation: No label for CAPTCHA input */}
          <input type="text" placeholder="Enter CAPTCHA" className="captcha-input" />
        </div>

        {/* WCAG Violation: Required fields indicator at bottom, not top */}
        <p className="required-note">* Required fields</p>

        {/* WCAG Violation: Submit button with poor contrast */}
        <button type="submit" className="submit-btn">Send Message</button>
      </form>
    </div>
  )
}

export default ContactForm
