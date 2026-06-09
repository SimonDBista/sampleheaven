"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function RoleSelectionPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { user, isLoading, updateUserRole } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        addToast('Please sign in to configure your role.', 'info');
        router.push('/login');
      } else if (user.role) {
        addToast(`Operating as ${user.role}.`, 'info');
        router.push(user.role === 'Seller' ? '/dashboard' : '/');
      }
    }
  }, [user, isLoading, router, addToast]);

  const handleSelectRole = async (role: 'Buyer' | 'Seller') => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const updated = await updateUserRole(role);
      setIsUpdating(false);
      if (updated) {
        addToast(`🎉 Account role configured successfully as: ${role}!`, 'success');
        router.push(role === 'Seller' ? '/dashboard' : '/');
      } else {
        addToast('Failed to configure role. Please try again.', 'error');
      }
    } catch (e) {
      setIsUpdating(false);
      addToast('An error occurred while updating your role.', 'error');
    }
  };

  if (isLoading || isUpdating) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)' }}>Configuring your profile session...</p>
      </div>
    );
  }

  return (
    <div className="container main-content flex-center" style={{ minHeight: '75vh', padding: '40px 20px' }}>
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px'
        }}
      >
        <div>
          <span style={{ fontSize: '3.5rem' }}>👋</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Choose Your Marketplace Role
          </h1>
          <p className="body-large" style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
            Welcome to SampleGoldmine! To proceed, please select your primary activity. You can toggle settings in your profile later.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            width: '100%',
            marginTop: '16px'
          }}
        >
          {/* Card 1: Buyer */}
          <div
            onClick={() => handleSelectRole('Buyer')}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="role-card"
          >
            <span style={{ fontSize: '3.5rem' }}>🎧</span>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>I am a Buyer</h3>
            <p className="body-small" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Browse beats, loops, and drum kits. Support your favorite local creators, scan QR codes to pay, and download high-quality files.
            </p>
            <button className="btn btn-secondary" style={{ pointerEvents: 'none', marginTop: '12px' }}>
              Select Buyer
            </button>
          </div>

          {/* Card 2: Seller */}
          <div
            onClick={() => handleSelectRole('Seller')}
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
            className="role-card"
          >
            <span style={{ fontSize: '3.5rem' }}>🎹</span>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>I am a Seller</h3>
            <p className="body-small" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Set up your profile, upload your payment QR code (eSewa / Khalti / Bank), publish your beats and sample packs, and approve order downloads.
            </p>
            <button className="btn btn-primary" style={{ pointerEvents: 'none', marginTop: '12px' }}>
              Select Seller
            </button>
          </div>
        </div>

        <style jsx>{`
          .role-card:hover {
            transform: translateY(-8px);
            border-color: var(--accent-primary);
            box-shadow: 0 12px 24px -10px rgba(124, 58, 237, 0.3);
          }
        `}</style>
      </div>
    </div>
  );
}
