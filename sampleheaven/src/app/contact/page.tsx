"use client";

import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Support');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      addToast('🎉 Support ticket created successfully! We will email you shortly.', 'success');
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="container main-content">
      
      {/* Title */}
      <div style={{ marginTop: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Get In Touch</h1>
        <p className="body-small">
          Have a question about billing, licensing, or need to file a copyright notice? File a ticket below.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid-2col" style={{ gap: '32px' }}>
        
        {/* Left Column: Form */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="form-group">
              <label className="form-label">Your Name <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. Alex Mercer"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                type="email"
                placeholder="producer@studio.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject Category</label>
              <select
                className="form-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="General Support">General Support</option>
                <option value="Billing / Plans">Billing / Subscriptions</option>
                <option value="Licensing Question">Licensing / Copyrights</option>
                <option value="DMCA Request">DMCA / Copyright Strike</option>
                <option value="Bug Report">Technical Bug Report</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Your Message <span style={{ color: 'var(--error)' }}>*</span></label>
              <textarea
                placeholder="Describe your issue, including file URLs or invoice IDs if relevant."
                className="form-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ minHeight: '160px' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Ticket...' : 'Send Message'}
            </button>

          </form>
        </div>

        {/* Right Column: Support details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Direct Contact</h4>
            <div className="body-small" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                📧 <b>Email:</b> <a href="mailto:support@samplegoldmine.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>support@samplegoldmine.com</a>
              </div>
              <div>
                🕒 <b>Typical Reply:</b> Within 24 hours (Monday to Friday)
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>DMCA Copyright Policies</h4>
            <p className="body-small" style={{ lineHeight: 1.5 }}>
              SampleGoldmine respects intellectual property rights. If you believe your copyrighted sound has been uploaded to our site without authorization, please file a ticket selecting the <b>DMCA Request</b> category. 
              <br /><br />
              Please provide: (1) identification of the copyrighted work, (2) the URL link of the infringing sample, and (3) your contact details.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Common FAQ Shortcuts</h4>
            <ul className="body-small" style={{ display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc', paddingLeft: '18px' }}>
              <li><a href="/pricing" style={{ color: 'var(--accent-secondary)' }}>How do I cancel my Pro subscription?</a></li>
              <li><a href="/about" style={{ color: 'var(--accent-secondary)' }}>Are files commercial-use royalty-free?</a></li>
              <li><a href="/upload" style={{ color: 'var(--accent-secondary)' }}>Why was my uploaded loop rejected?</a></li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
