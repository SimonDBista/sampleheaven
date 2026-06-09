"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '../../context/ToastContext';
import '../../styles/pages/auth.css';

export default function ForgotPasswordPage() {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    
    setIsSubmitted(true);
    addToast('Reset link dispatched to your inbox!', 'success');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-row">
          <Link href="/" className="navbar-logo" style={{ fontSize: '1.75rem' }}>
            <div className="logo-waveform">
              <span className="logo-bar"></span>
              <span className="logo-bar"></span>
              <span className="logo-bar"></span>
            </div>
            SampleGoldmine
          </Link>
        </div>

        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '12px' }}>Reset Your Password</h2>
        
        {!isSubmitted ? (
          <>
            <p className="body-small" style={{ textAlign: 'center', marginBottom: '24px' }}>
              Enter the email address associated with your profile, and we will dispatch a secure link to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="producer@studio.com"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <span style={{ fontSize: '3rem' }}>✉️</span>
            <h4 style={{ margin: '16px 0 8px' }}>Check Your Email</h4>
            <p className="body-small" style={{ marginBottom: '24px' }}>
              We have sent a password reset link to <b>{email}</b>. Please check your inbox and spam folders.
            </p>
            <button onClick={() => setIsSubmitted(false)} className="btn btn-secondary btn-sm">
              Change Email / Resend
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem' }}>
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Back to Log In
          </Link>
        </div>

      </div>
    </div>
  );
}
