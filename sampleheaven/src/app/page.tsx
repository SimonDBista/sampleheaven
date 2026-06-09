"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { mockSamples, mockPacks, mockCreators, Pack } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { productService, getCoverArtUrl, supabaseUrl, isRealSupabaseConfigured } from '../lib/supabase';
import SearchBar from '../components/SearchBar';
import SampleCard from '../components/SampleCard';
import PackCard from '../components/PackCard';
import GenreCard from '../components/GenreCard';
import CreatorCard from '../components/CreatorCard';
import '../styles/pages/homepage.css';

export default function Home() {
  const router = useRouter();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [packs, setPacks] = useState<Pack[]>([]);

  // Load packs including dynamically uploaded ones
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const dbProducts = await productService.getProducts();
        const dbPacks: Pack[] = dbProducts
          .filter(p => p.type === 'Pack')
          .map(p => ({
            id: p.id,
            title: p.title,
            creator: p.seller_name,
            samplesCount: 15,
            downloadsCount: p.downloads || 0,
            genre: p.genre,
            description: p.description || 'Premium sample pack.',
            price: p.price,
            coverArt: getCoverArtUrl(p.cover_art_url),
            fileUrl: isRealSupabaseConfigured && p.file_url
              ? `${supabaseUrl}/storage/v1/object/public/samples/${p.seller_id}/${encodeURIComponent(p.file_url)}`
              : undefined
          }));
        
        const combined = [...dbPacks];
        mockPacks.forEach(mp => {
          if (!combined.some(c => c.id === mp.id || c.title.toLowerCase() === mp.title.toLowerCase())) {
            combined.push(mp);
          }
        });
        setPacks(combined);
      } catch (err) {
        console.error("Failed to load packs on homepage:", err);
        setPacks(mockPacks);
      }
    };
    loadPacks();
  }, []);

  // 1. Staggered Entry Animations using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-scroll-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const animElements = document.querySelectorAll('.fade-in-scroll');
    animElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    addToast('🎉 Welcome to the drop list! Check your inbox for your free sample pack.', 'success');
    setEmail('');
  };

  const handleScrollDown = () => {
    const nextSec = document.getElementById('categories-section');
    if (nextSec) {
      nextSec.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mock Category List with Emoji
  const categories = [
    { label: 'Drum Loops', icon: '🥁' },
    { label: 'Melodic Loops', icon: '🎹' },
    { label: 'One-Shots', icon: '🎯' },
    { label: 'Bass', icon: '🎸' },
    { label: 'Vocals', icon: '🎤' },
    { label: 'SFX', icon: '💥' },
    { label: 'MIDI', icon: '🎼' },
    { label: 'Ambient', icon: '🌊' },
    { label: 'Foley', icon: '🎬' }
  ];

  // Genre gradients and icons
  const genres = [
    { name: 'Hip-Hop', count: 18450, gradient: 'linear-gradient(135deg, hsl(320, 80%, 30%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🎤' },
    { name: 'Electronic', count: 12900, gradient: 'linear-gradient(135deg, hsl(200, 90%, 30%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🎛️' },
    { name: 'Lo-Fi', count: 9540, gradient: 'linear-gradient(135deg, hsl(30, 60%, 25%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '☕' },
    { name: 'Cinematic', count: 7120, gradient: 'linear-gradient(135deg, hsl(280, 70%, 25%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🎬' },
    { name: 'Pop', count: 10400, gradient: 'linear-gradient(135deg, hsl(340, 80%, 35%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '✨' },
    { name: 'R&B', count: 6890, gradient: 'linear-gradient(135deg, hsl(10, 70%, 25%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🎷' },
    { name: 'Trap', count: 14320, gradient: 'linear-gradient(135deg, hsl(265, 80%, 30%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🔥' },
    { name: 'Ambient', count: 5210, gradient: 'linear-gradient(135deg, hsl(170, 70%, 20%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🌊' },
    { name: 'Jazz', count: 4120, gradient: 'linear-gradient(135deg, hsl(50, 70%, 20%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '🎺' },
    { name: 'Rock', count: 3200, gradient: 'linear-gradient(135deg, hsl(0, 80%, 25%) 0%, hsl(240, 15%, 8%) 100%)', emoji: '⚡' }
  ];

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        {/* Animated wave background canvas */}
        <div className="hero-waveform-bg">
          <svg viewBox="0 0 1440 320" width="100%" height="100%" preserveAspectRatio="none">
            <path
              fill="none"
              stroke="url(#accentGrad)"
              strokeWidth="2"
              d="M0,192 C240,240 480,96 720,128 C960,160 1200,320 1440,192"
            >
              <animate attributeName="d" dur="10s" repeatCount="indefinite"
                values="
                  M0,192 C240,240 480,96 720,128 C960,160 1200,320 1440,192;
                  M0,160 C300,120 400,280 750,220 C1100,160 1200,80 1440,160;
                  M0,192 C240,240 480,96 720,128 C960,160 1200,320 1440,192
                "
              />
            </path>
            <path
              fill="none"
              stroke="url(#cyanGrad)"
              strokeWidth="1.5"
              d="M0,128 C300,220 500,60 800,140 C1100,220 1300,100 1440,128"
              opacity="0.7"
            >
              <animate attributeName="d" dur="12s" repeatCount="indefinite"
                values="
                  M0,128 C300,220 500,60 800,140 C1100,220 1300,100 1440,128;
                  M0,220 C200,80 600,300 900,180 C1200,60 1300,240 1440,220;
                  M0,128 C300,220 500,60 800,140 C1100,220 1300,100 1440,128
                "
              />
            </path>
            <defs>
              <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-secondary)" />
              </linearGradient>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-secondary)" />
                <stop offset="100%" stopColor="var(--bg-hover)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="hero-vignette" />

        <div className="container hero-content">
          <div className="hero-logo">👼 SampleGoldmine</div>
          <h1 className="hero-title">Discover, Share & Download Free Audio Samples</h1>
          <p className="body-large hero-subtitle">
            Join thousands of producers sharing loops, one-shots, MIDI, and sound effects — 100% royalty-free.
          </p>

          <SearchBar heroVariant={true} />

          <div className="hero-popular-searches">
            <span>Popular searches:</span>
            <Link href="/browse?q=808" className="tag tag-interactive">808 Drums</Link>
            <Link href="/browse?q=piano" className="tag tag-interactive">Lo-Fi Piano</Link>
            <Link href="/browse?q=hi-hat" className="tag tag-interactive">Trap Hi-Hats</Link>
            <Link href="/browse?q=pad" className="tag tag-interactive">Ambient Pads</Link>
            <Link href="/browse?q=vocal" className="tag tag-interactive">Vocal Chops</Link>
          </div>

          <div className="hero-ctas">
            <Link href="/browse" className="btn btn-primary">Explore Samples</Link>
            <Link href="/upload" className="btn btn-secondary">Start Uploading</Link>
          </div>

          <div style={{ marginTop: '24px' }} className="caption">
            50,000+ Samples · 10,000+ Creators · 100% Royalty-Free
          </div>
        </div>

        <div className="hero-scroll-indicator bounce" onClick={handleScrollDown}>
          ▼
        </div>
      </section>

      {/* 2. Quick Category Navigation Section */}
      <section id="categories-section" className="section container fade-in-scroll">
        <div className="category-slider">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/browse?type=${encodeURIComponent(cat.label === 'Drum Loops' || cat.label === 'Melodic Loops' ? 'Loop' : cat.label === 'One-Shots' ? 'One-Shot' : cat.label)}`}
              className="category-pill"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Trending Samples Section */}
      <section className="section container fade-in-scroll">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2>🔥 Trending Samples</h2>
          <Link href="/browse" className="footer-link" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            View All →
          </Link>
        </div>
        
        {/* Horizontal Carousel */}
        <div className="carousel-container">
          {mockSamples.slice(0, 8).map((sample) => (
            <div className="carousel-item" key={sample.id}>
              <SampleCard sample={sample} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Staff Picks / Curated Packs Section */}
      <section className="section container fade-in-scroll">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2>⭐ Staff Picks</h2>
          <Link href="/browse?type=Pack" className="footer-link" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            View All Packs →
          </Link>
        </div>
        
        {/* Grid of packs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {(packs.length > 0 ? packs : mockPacks).slice(0, 4).map((pack) => (
            <PackCard pack={pack} key={pack.id} />
          ))}
        </div>
      </section>

      {/* 5. Browse by Genre Section */}
      <section className="section container fade-in-scroll">
        <h2 style={{ marginBottom: '24px' }}>Browse by Genre</h2>
        <div className="genre-grid">
          {genres.map((genre) => (
            <GenreCard
              key={genre.name}
              name={genre.name}
              samplesCount={genre.count}
              gradient={genre.gradient}
              emoji={genre.emoji}
            />
          ))}
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} className="section">
        <div className="container fade-in-scroll">
          <h2 style={{ textAlign: 'center', marginBottom: '48px' }}>How It Works</h2>
          <div className="steps-container">
            <span className="step-connector-line"></span>

            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon-circle">🔍</div>
              <h4 style={{ marginBottom: '8px' }}>Search</h4>
              <p className="body-small" style={{ maxWidth: '240px' }}>
                Find the perfect sample by genre, BPM, key, scale, or instrument tag.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon-circle">🎧</div>
              <h4 style={{ marginBottom: '8px' }}>Preview</h4>
              <p className="body-small" style={{ maxWidth: '240px' }}>
                Listen instantly in your browser with our interactive high-DPI waveform player.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon-circle">⬇️</div>
              <h4 style={{ marginBottom: '8px' }}>Download</h4>
              <p className="body-small" style={{ maxWidth: '240px' }}>
                Grab 100% royalty-free, high-quality audio files ready for any DAW project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Featured Creators Section */}
      <section className="section container fade-in-scroll">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2>🎤 Featured Creators</h2>
          <Link href="/browse" className="footer-link" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            View All →
          </Link>
        </div>
        
        <div className="grid-cards">
          {mockCreators.slice(0, 4).map((creator) => (
            <CreatorCard creator={creator} key={creator.username} />
          ))}
        </div>
      </section>

      {/* 8. Recent Uploads Section */}
      <section className="section container fade-in-scroll">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h2>🆕 Latest Uploads</h2>
          <Link href="/browse" className="footer-link" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            View All →
          </Link>
        </div>
        
        <div className="grid-cards">
          {mockSamples.slice(8, 16).map((sample) => (
            <SampleCard sample={sample} key={sample.id} />
          ))}
        </div>
      </section>

      {/* 9. Community Stats Strip */}
      <section className="stats-strip">
        <div className="container stats-grid fade-in-scroll">
          <div className="stat-item">
            <span className="stat-number">52,400+</span>
            <span className="caption">Total Samples</span>
            <span className="stat-divider"></span>
          </div>
          <div className="stat-item">
            <span className="stat-number">1.2M+</span>
            <span className="caption">Downloads Served</span>
            <span className="stat-divider"></span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10,800+</span>
            <span className="caption">Active Creators</span>
            <span className="stat-divider"></span>
          </div>
          <div className="stat-item">
            <span className="stat-number">120+</span>
            <span className="caption">Countries Represented</span>
          </div>
        </div>
      </section>

      {/* 10. Newsletter Sign Up */}
      <section className="section container fade-in-scroll">
        <div className="newsletter-banner">
          <div>
            <h2 style={{ marginBottom: '12px' }}>Get Weekly Sample Drops in Your Inbox</h2>
            <p style={{ maxWidth: '450px' }}>
              Subscribe for hand-picked sample packs, music production guides, and exclusive free loop kits every week.
            </p>
          </div>

          <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <input
                type="email"
                placeholder="producer@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ flexGrow: 1 }}
                required
              />
              <button type="submit" className="btn btn-primary">
                Subscribe
              </button>
            </div>
            <div className="caption" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
              🎁 Get a free MIDI chord essentials kit on signup
            </div>
            <div className="caption" style={{ color: 'var(--text-muted)' }}>
              We respect your inbox. Unsubscribe anytime.
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
