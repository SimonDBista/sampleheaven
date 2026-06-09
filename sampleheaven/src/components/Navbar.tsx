"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { authService, MockUser } from '../lib/supabase';
import { SearchBar } from './SearchBar';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll depth to adjust header padding
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push('/login');
  };

  const navLinks = [
    { label: 'Browse', path: '/browse' },
    { label: 'Upload', path: '/upload' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' }
  ];

  // Don't show global nav in auth views
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(pathname);

  if (isAuthPage) return null;

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-compact' : ''}`}>
      <div className="container navbar-container">
        
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <div className="logo-waveform">
            <span className="logo-bar"></span>
            <span className="logo-bar"></span>
            <span className="logo-bar"></span>
          </div>
          SampleGoldmine
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || pathname?.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Global Search & User Actions */}
        <div className="navbar-actions">
          
          {/* Global Autocomplete Search Bar */}
          <div className="desktop-search">
            <SearchBar />
          </div>


          {user ? (
            /* User profile dropdown */
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: user.profile_picture_url ? 'none' : 'var(--accent-gradient)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '2px solid var(--border)',
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: '180px',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 1001
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Logged in as <b>{user.username}</b>
                  </div>
                  
                  {user.role === 'Admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', color: 'var(--accent-secondary)', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                      🛠️ Admin Panel
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    💻 Dashboard
                  </Link>
                  
                  <Link
                    href="/library"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    💾 My Library
                  </Link>

                  <Link
                    href={`/creator/${user.username}`}
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'block', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    👤 Public Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 16px',
                      color: 'var(--error)',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      borderTop: '1px solid var(--border)',
                      marginTop: '6px'
                    }}
                  >
                    🚪 Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out: Auth Links */
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Hamburger menu toggle */}
          <button
            className="navbar-hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--bg-primary)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '24px'
          }}
        >
          {/* Mobile Search */}
          <div>
            <SearchBar />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: pathname === link.path ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <span className="caption" style={{ color: 'var(--text-muted)' }}>Logged in as {user.username}</span>
              {user.role === 'Admin' && (
                <Link href="/admin" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  🛠️ Admin Panel
                </Link>
              )}
              <Link href="/dashboard" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                💻 Dashboard
              </Link>
              <Link href="/library" onClick={() => setIsOpen(false)} style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                💾 My Library
              </Link>
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }}
                style={{ 
                  textAlign: 'left', 
                  fontSize: '1.1rem', 
                  color: 'var(--error)', 
                  cursor: 'pointer',
                  border: 'none',
                  background: 'none',
                  padding: 0
                }}
              >
                🚪 Log Out
              </button>
            </div>
          )}

          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
              <Link href="/login" onClick={() => setIsOpen(false)} className="btn btn-secondary">
                Sign In
              </Link>
              <Link href="/signup" onClick={() => setIsOpen(false)} className="btn btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .desktop-search {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
