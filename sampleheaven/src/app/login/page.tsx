"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import '../../styles/pages/auth.css';

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { login, refreshUser } = useAuth();
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUser.trim() || !password.trim()) {
      addToast('Please enter both your credentials.', 'error');
      return;
    }

    setIsLoading(true);
    const { data, error } = await login(emailOrUser, password);
    setIsLoading(false);

    if (error) {
      addToast(error, 'error');
    } else if (data) {
      addToast(`Welcome back, ${data.username}!`, 'success');
      if (data.role) {
        router.push(data.role === 'Admin' ? '/admin' : data.role === 'Seller' ? '/dashboard' : '/');
      } else {
        router.push('/role-selection');
      }
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    if (provider !== 'Google') {
      addToast(`Only Google authentication is supported for this project.`, 'info');
      return;
    }

    addToast(`Authenticating through Google Secure Sign-In...`, 'info');
    setIsLoading(true);
    const { data, error } = await authService.signInWithGoogle();
    setIsLoading(false);

    if (error) {
      addToast(error.message || 'OAuth error occurred', 'error');
    } else if (data) {
      refreshUser();
      addToast(`Successfully logged in via Google!`, 'success');
      if (data.role) {
        router.push(data.role === 'Admin' ? '/admin' : data.role === 'Seller' ? '/dashboard' : '/');
      } else {
        router.push('/role-selection');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-overlay">
        <svg viewBox="0 0 1440 320" width="100%" height="100%">
          <path fill="none" stroke="var(--accent-primary)" strokeWidth="3" d="M0,160 C300,80 600,280 900,180 C1200,60 1300,240 1440,220" />
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

        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '24px' }}>Welcome Back</h2>

        {/* Primary OAuth Method */}
        <div className="oauth-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleOAuthLogin('Google')}
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
            <span>🌐</span> Continue with Google
          </button>
        </div>

        <div className="auth-divider">or use credentials</div>

        {/* Secondary Standard Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <input
              type="text"
              placeholder="e.g. KVNG Beats"
              className="form-input"
              value={emailOrUser}
              onChange={(e) => setEmailOrUser(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
