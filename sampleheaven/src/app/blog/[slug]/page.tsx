"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { mockBlogPosts, BlogPost } from '../../../data/mockData';

export default function BlogDetailPage() {
  const params = useParams();
  const postId = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    const found = mockBlogPosts.find(p => p.id === postId);
    if (found) {
      setPost(found);
    }
  }, [postId]);

  if (!post) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
        <h2>Article Not Found</h2>
        <Link href="/blog" className="btn btn-primary">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="container main-content" style={{ maxWidth: '720px', margin: '40px auto', paddingBottom: '64px' }}>
      
      {/* Back button */}
      <Link href="/blog" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}>
        ← Back to Blog
      </Link>

      {/* Header Info */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        <span className="tag tag-accent" style={{ alignSelf: 'flex-start' }}>
          {post.category}
        </span>
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15 }}>{post.title}</h1>
        <div className="caption" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          By <b>{post.author}</b> · Published on {post.date} · {post.readTime}
        </div>
      </section>

      {/* Hero placeholder */}
      <div
        style={{
          width: '100%',
          height: '240px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5rem',
          marginBottom: '32px'
        }}
      >
        📖
      </div>

      {/* Article Content */}
      <article style={{ lineHeight: 1.8, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p className="body-large" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {post.excerpt}
        </p>

        <p>
          Creating music using pre-recorded samples is an art form in itself. Whether you're slicing up acoustic breakbeats, stretching vocal pads, or layering sub-bass components, the key to standing out as a producer is understanding the techniques of sonic manipulation. In this guide, we dive deep into the methods employed by top-tier sound designers.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '20px', fontSize: '1.25rem' }}>1. Dynamic Filtering and EQ</h3>
        <p>
          One of the first mistakes beginners make is layering samples without EQ carving. Low frequencies overlap quickly, resulting in a muddy mix. Always use a high-pass filter on non-bass samples (like piano keys, hi-hat loops, and ambient risers) to clear out the sub-100Hz range, leaving that room exclusively for your kick drum and 808 bass lines.
        </p>

        <blockquote>
          <div
            style={{
              borderLeft: '4px solid var(--accent-primary)',
              paddingLeft: '16px',
              fontStyle: 'italic',
              margin: '20px 0',
              color: 'var(--text-primary)'
            }}
          >
            "A clean mix isn't about adding more frequencies; it's about carving away elements that fight for the same acoustic footprint." — SoundForge, Lead Designer
          </div>
        </blockquote>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '20px', fontSize: '1.25rem' }}>2. Formant and Pitch Manipulation</h3>
        <p>
          Pitching a sample up or down changes its duration and timbre. If you are using a vocal chop, try shifting the formants separately from the pitch itself. Shifting formants down while keeping the pitch constant can add a dark, vintage texture, while shifting formants up creates a bright, electronic character that cuts through dense synthwave stacks.
        </p>

        <h3 style={{ color: 'var(--text-primary)', marginTop: '20px', fontSize: '1.25rem' }}>3. Creating Unique Spaces</h3>
        <p>
          To make dry samples sound cohesive, feed them through a shared auxiliary reverb bus. Apply a subtle stereo delay (5-15 milliseconds) to widen percussion loops, or apply sidechain compression triggered by your kick drum to make synth pads swell rhythmically, creating movement in the track.
        </p>

      </article>

      {/* Footer Newsletter Box */}
      <section
        style={{
          marginTop: '48px',
          borderTop: '1px solid var(--border)',
          paddingTop: '32px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <h4>Enjoyed this guide?</h4>
        <p className="body-small" style={{ maxWidth: '400px' }}>
          Subscribe to our drop list to receive our latest sound packs and sound design guides in your inbox.
        </p>
        <Link href="/" className="btn btn-primary btn-sm">
          Return Home
        </Link>
      </section>

    </div>
  );
}
