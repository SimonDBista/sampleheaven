"use client";

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  const values = [
    { title: "👥 Community First", desc: "We believe sound is meant to be shared. Our platform is built on mutual support and creative feedback between producers." },
    { title: "🎸 Creator Empowerment", desc: "Sound designers deserve credit and reach. We build tools that help designers find audiences, track statistics, and monetize their work." },
    { title: "🔓 Open Access", desc: "High-quality samples shouldn't be blocked by massive paywalls. We maintain a generous free tier so anyone can start making music." }
  ];

  const team = [
    { name: "Alex Mercer", role: "Co-Founder & Audio Lead", avatar: "A", bio: "Former sound designer for game studios. Passionate about DSP synthesis." },
    { name: "Sarah Connor", role: "Lead Frontend Engineer", avatar: "S", bio: "Ableton power-user. Focused on making beautiful audio interfaces." },
    { name: "Marcus Vance", role: "Community Organizer", avatar: "M", bio: "DJ and beatmaker. Runs our sample-making contests and newsletters." }
  ];

  return (
    <div className="container main-content" style={{ maxWidth: '800px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '48px' }}>
      
      {/* 1. Header Banner */}
      <section style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>About SampleGoldmine</h1>
        <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
          "Your Sound Starts Here" — We are building the world's most accessible community audio library.
        </p>
      </section>

      {/* 2. Mission details */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Our Mission
        </h2>
        <p className="body-large" style={{ lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          SampleGoldmine was founded in 2026 by a group of music producers, audio engineers, and sound designers who grew tired of expensive subscription libraries, duplicate loop registries, and royalty disputes. 
          <br /><br />
          We envisioned a self-sustaining ecosystem of shared sound, where creators could upload loops, one-shots, and FX to build reputation, and where other producers could download high-quality files under clear, royalty-free licensing.
        </p>
      </section>

      {/* 3. Value Grid */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Core Values
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {values.map(val => (
            <div
              key={val.title}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{val.title}</h4>
              <p className="body-small" style={{ lineHeight: 1.5 }}>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Team members */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
          Behind the Waveforms
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          {team.map(member => (
            <div
              key={member.name}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'white',
                  marginBottom: '16px'
                }}
              >
                {member.avatar}
              </div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>{member.name}</h4>
              <span className="caption" style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginBottom: '8px', display: 'block' }}>
                {member.role}
              </span>
              <p className="body-small" style={{ lineHeight: 1.4 }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Bottom CTA */}
      <section style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '32px', paddingBottom: '48px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Join the Sound Revolution</h2>
        <p className="body-small" style={{ marginBottom: '20px' }}>
          Help us build the catalog. Sign up for a Creator profile today.
        </p>
        <Link href="/signup" className="btn btn-primary">
          Start Uploading
        </Link>
      </section>

    </div>
  );
}
