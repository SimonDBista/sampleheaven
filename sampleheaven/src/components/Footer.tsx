"use client";

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-logo-col">
          <Link href="/" className="navbar-logo">
            <div className="logo-waveform">
              <span className="logo-bar"></span>
              <span className="logo-bar"></span>
              <span className="logo-bar"></span>
            </div>
            SampleGoldmine
          </Link>
          <p>
            A community-driven marketplace for high-quality audio samples and sound assets. Empowering creators and producers everywhere.
          </p>
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Twitter">𝕏</a>
            <a href="#" className="footer-social-link" aria-label="Instagram">📸</a>
            <a href="#" className="footer-social-link" aria-label="YouTube">📹</a>
            <a href="#" className="footer-social-link" aria-label="Discord">👾</a>
            <a href="#" className="footer-social-link" aria-label="SoundCloud">☁️</a>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="footer-col-title">Explore</h4>
          <ul className="footer-menu">
            <li><Link href="/browse" className="footer-link">Browse All</Link></li>
            <li><Link href="/browse?type=Loop" className="footer-link">Drum & Melody Loops</Link></li>
            <li><Link href="/browse?type=One-Shot" className="footer-link">One-Shots</Link></li>
            <li><Link href="/browse?type=SFX" className="footer-link">Sound Effects</Link></li>
            <li><Link href="/browse?type=Pack" className="footer-link">Sample Packs</Link></li>
          </ul>
        </div>

        {/* Creators Links */}
        <div>
          <h4 className="footer-col-title">Creators</h4>
          <ul className="footer-menu">
            <li><Link href="/upload" className="footer-link">Upload Sounds</Link></li>
            <li><Link href="/dashboard" className="footer-link">Creator Dashboard</Link></li>
            <li><Link href="/about" className="footer-link">Community Guidelines</Link></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h4 className="footer-col-title">Support</h4>
          <ul className="footer-menu">
            <li><Link href="/contact" className="footer-link">Help Center</Link></li>
            <li><Link href="/contact" className="footer-link">Contact Support</Link></li>
            <li><Link href="/about" className="footer-link">DMCA Policy</Link></li>
            <li><Link href="/about" className="footer-link">Licensing Terms</Link></li>
            <li><Link href="/about" className="footer-link">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} SampleGoldmine. All rights reserved.</span>
        <span>Made with ♥ for producers everywhere.</span>
      </div>
    </footer>
  );
};

export default Footer;
