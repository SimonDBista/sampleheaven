"use client";

import React from 'react';
import Link from 'next/link';

interface GenreCardProps {
  name: string;
  samplesCount: number;
  gradient: string;
  emoji: string;
}

export const GenreCard: React.FC<GenreCardProps> = ({ name, samplesCount, gradient, emoji }) => {
  return (
    <Link
      href={`/browse?genre=${encodeURIComponent(name)}`}
      style={{
        display: 'block',
        position: 'relative',
        aspectRatio: '16/10',
        minWidth: '200px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: gradient,
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'var(--transition-default)'
      }}
      className="genre-card"
    >
      {/* Dark overlay gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(18, 19, 24, 0.9) 0%, rgba(18, 19, 24, 0.2) 100%)',
          transition: 'opacity 0.25s ease',
          zIndex: 1
        }}
        className="genre-card-overlay"
      />

      {/* Decorative top-right icon */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          fontSize: '1.5rem',
          opacity: 0.15,
          transition: 'var(--transition-default)',
          zIndex: 2
        }}
        className="genre-card-icon"
      >
        {emoji}
      </div>

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          padding: '20px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            transition: 'var(--transition-default)'
          }}
          className="genre-card-title"
        >
          {name}
        </h3>
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
          }}
        >
          {samplesCount.toLocaleString()} Samples
        </span>
      </div>

      {/* Hover state styles */}
      <style jsx>{`
        .genre-card:hover {
          transform: scale(1.03);
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-md);
        }
        .genre-card:hover .genre-card-overlay {
          background: linear-gradient(to top, rgba(18, 19, 24, 0.95) 0%, rgba(18, 19, 24, 0.3) 100%);
        }
        .genre-card:hover .genre-card-icon {
          opacity: 0.5;
          transform: scale(1.2);
        }
        .genre-card:hover .genre-card-title {
          color: var(--accent-secondary);
        }
      `}</style>
    </Link>
  );
};

export default GenreCard;
