"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import '../../styles/pages/auth.css';

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { signup, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }
    if (!agreeTerms) {
      addToast('You must agree to the Terms of Service to register.', 'error');
      return;
    }

    setIsLoading(true);
    const { data, error } = await signup(username, email, password);
    setIsLoading(false);

    if (error) {
      addToast(error, 'error');
    } else if (data) {
      addToast(`Welcome to SampleGoldmine, ${data.username}!`, 'success');
      router.push('/role-selection');
    }
  };

  const handleOAuthSignup = async (provider: string) => {
    if (provider !== 'Google') {
      addToast(`Only Google authentication is supported for this project.`, 'info');
      return;
    }

    addToast(`Registering through Google Secure Sign-In...`, 'info');
    setIsLoading(true);
    const { data, error } = await authService.signInWithGoogle();
    setIsLoading(false);

    if (error) {
      addToast(error.message || 'OAuth registration failed', 'error');
    } else if (data) {
      refreshUser();
      addToast(`Registered via Google successfully!`, 'success');
      router.push('/role-selection');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-overlay">
        <svg viewBox="0 0 1440 320" width="100%" height="100%">
          <path fill="none" stroke="var(--accent-secondary)" strokeWidth="3" d="M0,220 C200,80 600,300 900,180 C1200,60 1300,240 1440,220" />
        </svg>
      </div>

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

        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '24px' }}>Create Your Account</h2>

        {/* Primary OAuth Method */}
        <div className="oauth-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleOAuthSignup('Google')}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontWeight: 600,
              fontSize: '0.95rem',
              background: 'var(--accent-gradient)',
              border: 'none',
              borderRadius: 'var(--radius-md)'
            }}
            disabled={isLoading}
          >
            <span>🌐</span> Sign Up with Google
          </button>
        </div>

        <div className="auth-divider">or create with credentials</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              placeholder="e.g. ChillWave"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              placeholder="producer@studio.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="form-checkbox-label" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                className="form-checkbox"
                style={{ marginTop: '3px' }}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
                required
              />
              <span className="body-small">
                I agree to the <b>Terms of Service</b> and acknowledge the <b>Privacy Policy</b>.
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
