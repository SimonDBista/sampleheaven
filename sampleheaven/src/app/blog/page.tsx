"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { mockBlogPosts, BlogPost } from '../../data/mockData';

export default function BlogListingPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter posts based on selected category tab
  const filteredPosts = selectedCategory === 'All'
    ? mockBlogPosts
    : mockBlogPosts.filter(post => post.category === selectedCategory);

  // Take the first post as the Featured Post
  const featuredPost = mockBlogPosts[0];
  const gridPosts = filteredPosts.filter(post => post.id !== featuredPost.id);

  const categories = ['All', 'Production Tips', 'Tutorial', 'Spotlight', 'News', 'Tool Reviews'];

  return (
    <div className="container main-content">
      
      {/* 1. Header Banner */}
      <div style={{ marginTop: '20px', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Blog & Production Resources</h1>
        <p className="body-small">
          Tutorials, sound design guides, and creator stories from the SampleGoldmine editors.
        </p>
      </div>

      {/* 2. Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px',
          marginBottom: '32px'
        }}
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              fontSize: '0.85rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Featured Post (Only show on 'All' or when category matches featured post) */}
      {(selectedCategory === 'All' || selectedCategory === featuredPost.category) && (
        <section
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            display: 'flex',
            marginBottom: '48px',
            flexWrap: 'wrap',
            cursor: 'pointer'
          }}
          className="grid-2col"
        >
          {/* Cover Art Image */}
          <div
            style={{
              width: '100%',
              minWidth: '320px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--bg-hover) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              height: '300px'
            }}
          >
            🎹
          </div>
          {/* Details */}
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
            <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>
              ⭐ FEATURED · {featuredPost.category}
            </span>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)' }}>
              <Link href={`/blog/${featuredPost.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {featuredPost.title}
              </Link>
            </h2>
            <p className="body-small" style={{ lineHeight: 1.6 }}>
              {featuredPost.excerpt}
            </p>
            <div className="caption" style={{ color: 'var(--text-muted)' }}>
              By <b>{featuredPost.author}</b> · {featuredPost.date} · {featuredPost.readTime}
            </div>
            <Link href={`/blog/${featuredPost.id}`} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
              Read Article →
            </Link>
          </div>
        </section>
      )}

      {/* 4. Grid of remaining posts */}
      <section style={{ paddingBottom: '64px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Latest Articles</h2>
        
        {gridPosts.length === 0 ? (
          <p className="body-small" style={{ fontStyle: 'italic' }}>No other articles found in this category.</p>
        ) : (
          <div className="grid-cards">
            {gridPosts.map(post => (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
              >
                {/* Thumb icon overlay */}
                <div
                  style={{
                    height: '160px',
                    background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem'
                  }}
                >
                  {post.category === 'Tutorial' ? '📝' : post.category === 'Spotlight' ? '🎤' : '🎧'}
                </div>
                
                {/* Info details */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                  <span className="tag" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '2px 8px' }}>
                    {post.category}
                  </span>
                  
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <Link href={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {post.title}
                    </Link>
                  </h4>
                  
                  <p className="body-small" style={{ lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '42px' }}>
                    {post.excerpt}
                  </p>
                  
                  <div className="caption" style={{ marginTop: 'auto', paddingTop: '12px', color: 'var(--text-muted)' }}>
                    By <b>{post.author}</b> · {post.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
