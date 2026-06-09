"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sample } from '../data/mockData';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authService, productService, interactionService, Product, profileService } from '../lib/supabase';
import QRCheckoutModal from './QRCheckoutModal';

interface SampleCardProps {
  sample: Sample;
}

export const SampleCard: React.FC<SampleCardProps> = ({ sample }) => {
  const { currentSample, isPlaying, togglePlay } = useAudio();
  const { addToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [downloadCount, setDownloadCount] = useState(sample.downloads);
  
  // Purchase states
  const { user: currentUser } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [dbProduct, setDbProduct] = useState<Product | null>(null);
  const [profilePic, setProfilePic] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isCurrent = currentSample?.id === sample.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;

  useEffect(() => {
    const loadState = async () => {
      const liked = interactionService.getLikedIds();
      setIsLiked(liked.includes(sample.id));
      setPurchasedIds(interactionService.getPurchasedKitIds());
      setPendingIds(interactionService.getPendingKitIds());

      try {
        const allProds = await productService.getProducts();
        // Match either by direct ID (prod-1 vs sample-1/prod-1) or title/creator
        const found = allProds.find(p => p.id === sample.id || (p.title.toLowerCase() === sample.title.toLowerCase() && p.seller_name.toLowerCase() === sample.creator.toLowerCase()));
        setDbProduct(found || null);

        const { profile } = await profileService.getSellerProfileByUsername(sample.creator);
        if (profile?.profile_picture_url) {
          setProfilePic(profile.profile_picture_url);
        }
      } catch (err) {
        console.error("Failed to load sample product settings:", err);
      }
    };
    loadState();
  }, [sample.id, sample.title, sample.creator, currentUser?.id]);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    togglePlay(sample);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const liked = interactionService.toggleLike(sample.id);
    setIsLiked(liked);
    addToast(liked ? `Saved "${sample.title}" to library!` : `Removed "${sample.title}" from library`, 'info');
  };

  const price = dbProduct ? dbProduct.price : 0;
  const isOwner = currentUser?.username === sample.creator;
  const isUnlocked = price === 0 || isOwner || purchasedIds.includes(sample.id) || (dbProduct ? purchasedIds.includes(dbProduct.id) : false);
  const isPending = pendingIds.includes(sample.id) || (dbProduct ? pendingIds.includes(dbProduct.id) : false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPending) {
      addToast('Your payment notice is currently pending verification from the seller/admin.', 'info');
      return;
    }

    if (!isUnlocked) {
      setIsCheckoutOpen(true);
      return;
    }

    interactionService.recordDownload(sample.id);
    setDownloadCount(prev => prev + 1);
    addToast(`Downloading "${sample.title}"...`, 'success');

    const link = document.createElement('a');
    if (sample.audioUrl) {
      link.href = sample.audioUrl;
      link.setAttribute('target', '_blank');
      link.setAttribute('download', sample.audioUrl.substring(sample.audioUrl.lastIndexOf('/') + 1));
    } else {
      // Mock / Offline download fallback: download a small mock file blob
      const isPack = sample.type === 'Pack' || sample.type === 'Kit';
      const fileExt = isPack ? (sample.format.toLowerCase() === 'rar' ? 'rar' : 'zip') : 'wav';
      const mimeType = isPack ? 'application/zip' : 'audio/wav';
      const content = `Mock content for ${sample.title} (${sample.type})`;
      const blob = new Blob([content], { type: mimeType });
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${sample.title.replace(/\s+/g, '_')}.${fileExt}`);
    }
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  // Generate 32 mock heights for the visual waveform representation
  const waveformHeights = [
    30, 45, 60, 35, 20, 50, 75, 90, 40, 25,
    65, 80, 55, 30, 45, 70, 85, 40, 20, 50,
    75, 95, 60, 35, 55, 80, 40, 30, 45, 60,
    35, 20
  ];

  return (
    <>
      <Link href={`/sample/${sample.id}`} className={`sample-card ${isCurrentlyPlaying ? 'sample-card--playing' : ''}`}>
        {/* 1. Waveform Thumbnail Area */}
        <div 
          className="sample-card-wave-area"
          style={{
            background: sample.coverArt ? `linear-gradient(180deg, rgba(10, 10, 12, 0.4) 0%, rgba(10, 10, 12, 0.85) 100%), url(${sample.coverArt}) center center / cover no-repeat` : undefined
          }}
        >
          {/* Animated/Static Waveform Bars */}
          {sample.type !== 'Pack' && sample.type !== 'Kit' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                width: '80%',
                height: '80px',
                position: 'absolute',
                bottom: '20px'
              }}
            >
              {waveformHeights.map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: `${h}%`,
                    backgroundColor: isCurrentlyPlaying ? 'var(--accent-primary)' : 'var(--accent-secondary)',
                    borderRadius: 'var(--radius-full)',
                    opacity: isCurrentlyPlaying ? 0.9 : 0.4,
                    transformOrigin: 'bottom',
                    animationName: isCurrentlyPlaying ? 'wave-shimmer' : 'none',
                    animationDuration: '1.2s',
                    animationTimingFunction: 'ease-in-out',
                    animationIterationCount: 'infinite',
                    animationDirection: 'alternate',
                    animationDelay: `${i * 0.03}s`
                  }}
                />
              ))}
            </div>
          ) : (
            <div style={{ position: 'absolute', bottom: '24px', left: '0', right: '0', textAlign: 'center', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              📦 Sample Kit Archive
            </div>
          )}

          {/* Play/Pause Button Overlay */}
          {sample.type !== 'Pack' && sample.type !== 'Kit' && (
            <button
              onClick={handlePlayPause}
              className={`sample-card-play-btn ${isCurrentlyPlaying ? 'pulse-playing' : ''}`}
              aria-label={isCurrentlyPlaying ? 'Pause sample' : 'Play sample'}
            >
              {isCurrentlyPlaying ? '❚❚' : '▶'}
            </button>
          )}
        </div>

        {/* 2. Info Section */}
        <div className="sample-card-info">
          <h4 className="sample-card-title">{sample.title}</h4>
          
          <span className="sample-card-creator">
            <span className="sample-card-creator-avatar" style={{ overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {profilePic ? (
                <img src={profilePic} alt={sample.creator} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                sample.creator.charAt(0).toUpperCase()
              )}
            </span>
            {sample.creator}
          </span>

          <div className="sample-card-badges">
            {sample.bpm && <span className="tag">{sample.bpm} BPM</span>}
            {sample.key && <span className="tag">{sample.key}</span>}
            <span className="tag tag-accent">{sample.type}</span>
            <span className="tag">{sample.format}</span>
          </div>
        </div>

        {/* 3. Action Row */}
        <div className="sample-card-action-row">
          <span className="sample-card-downloads">
            📥 {downloadCount.toLocaleString()}
          </span>
          <div className="sample-card-actions">
            <button
              onClick={handleLike}
              className={`sample-card-like-btn ${isLiked ? 'sample-card-like-btn--liked' : ''}`}
              aria-label="Save sample"
            >
              {isLiked ? '❤️' : '🤍'}
            </button>
            <button
              onClick={handleDownload}
              disabled={isPending}
              className="sample-card-download-btn"
              style={{
                background: isPending ? 'var(--bg-secondary)' : (!isUnlocked ? 'var(--accent-gradient)' : 'var(--bg-tertiary)'),
                color: isPending ? 'var(--text-muted)' : (!isUnlocked ? 'white' : 'var(--text-primary)'),
                border: isPending ? '1px solid var(--border)' : (!isUnlocked ? 'none' : '1px solid var(--border)'),
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isUnlocked ? 'Download' : (isPending ? 'Pending' : `Buy ($${price.toFixed(2)})`)}
            </button>
          </div>
        </div>

        {/* Waveform Keyframe styles */}
        <style jsx>{`
          @keyframes wave-shimmer {
            0% {
              transform: scaleY(1);
            }
            100% {
              transform: scaleY(0.3);
            }
          }
        `}</style>
      </Link>

      {isCheckoutOpen && (
        <QRCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={{
            id: dbProduct?.id || sample.id,
            title: sample.title,
            creator: sample.creator,
            price: price
          }}
          onSuccess={() => {
            setPurchasedIds(interactionService.getPurchasedKitIds());
            setPendingIds(interactionService.getPendingKitIds());
            addToast(`Payment notice for "${sample.title}" submitted successfully!`, 'success');
          }}
        />
      )}
    </>
  );
};

export default SampleCard;
