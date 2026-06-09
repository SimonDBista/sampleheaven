"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { interactionService, productService } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const GlobalPlayer: React.FC = () => {
  const { currentSample, isPlaying, currentTime, duration, volume, pause, play, seek, setVolume } = useAudio();
  const { addToast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.7);

  // Purchase states
  const { user: currentUser } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [dbProduct, setDbProduct] = useState<any>(null);

  // Sync like and purchase states when sample changes
  useEffect(() => {
    if (currentSample) {
      const liked = interactionService.getLikedIds();
      setIsLiked(liked.includes(currentSample.id));
      setPurchasedIds(interactionService.getPurchasedKitIds());
      setPendingIds(interactionService.getPendingKitIds());

      const loadDbProduct = async () => {
        try {
          const allProds = await productService.getProducts();
          const found = allProds.find(p => p.id === currentSample.id || (p.title.toLowerCase() === currentSample.title.toLowerCase() && p.seller_name.toLowerCase() === currentSample.creator.toLowerCase()));
          setDbProduct(found || null);
        } catch (err) {
          console.error("Failed to load global player product info:", err);
        }
      };
      loadDbProduct();
    }
  }, [currentSample, currentUser?.id]);

  if (!currentSample) return null;

  const price = dbProduct ? dbProduct.price : 0;
  const isOwner = currentUser?.username === currentSample.creator;
  const isUnlocked = price === 0 || isOwner || purchasedIds.includes(currentSample.id) || (dbProduct ? purchasedIds.includes(dbProduct.id) : false);
  const isPending = pendingIds.includes(currentSample.id) || (dbProduct ? pendingIds.includes(dbProduct.id) : false);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play(currentSample);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const liked = interactionService.toggleLike(currentSample.id);
    setIsLiked(liked);
    addToast(liked ? `Added "${currentSample.title}" to library!` : `Removed "${currentSample.title}" from library`, 'info');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPending) {
      addToast('Your payment notice is currently pending verification from the seller/admin.', 'info');
      return;
    }

    if (!isUnlocked) {
      addToast(`Please purchase "${currentSample.title}" to download it.`, 'info');
      return;
    }

    interactionService.recordDownload(currentSample.id);
    addToast(`Starting download: ${currentSample.title}.${currentSample.format.toLowerCase()}`, 'success');

    const link = document.createElement('a');
    if (currentSample.audioUrl) {
      link.href = currentSample.audioUrl;
      link.setAttribute('target', '_blank');
      link.setAttribute('download', currentSample.audioUrl.substring(currentSample.audioUrl.lastIndexOf('/') + 1));
    } else {
      const isPack = currentSample.type === 'Pack' || currentSample.type === 'Kit';
      const fileExt = isPack ? (currentSample.format.toLowerCase() === 'rar' ? 'rar' : 'zip') : 'wav';
      const mimeType = isPack ? 'application/zip' : 'audio/wav';
      const content = `Mock content for ${currentSample.title} (${currentSample.type})`;
      const blob = new Blob([content], { type: mimeType });
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${currentSample.title.replace(/\s+/g, '_')}.${fileExt}`);
    }
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) {
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    seek(pct);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div
      className="global-player"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.5)'
      }}
    >
      {/* 1. Left side: Sample Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '220px', maxWidth: '30%' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: isPlaying ? 'var(--shadow-glow)' : 'none'
          }}
        >
          🎵
        </div>
        <div style={{ overflow: 'hidden' }}>
          <h4
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {currentSample.title}
          </h4>
          <Link
            href={`/creator/${currentSample.creator}`}
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap'
            }}
          >
            {currentSample.creator}
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginLeft: '12px' }}>
          <button
            onClick={handleLike}
            style={{ color: isLiked ? 'var(--error)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
            aria-label="Like sample"
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
          <button
            onClick={handleDownload}
            disabled={isPending}
            style={{ 
              color: isPending ? 'var(--text-muted)' : (isUnlocked ? 'var(--text-primary)' : 'var(--accent-primary)'), 
              cursor: isPending ? 'not-allowed' : 'pointer', 
              fontSize: '1.1rem',
              opacity: isPending ? 0.5 : 1
            }}
            aria-label="Download sample"
          >
            {isPending ? '⌛' : (isUnlocked ? '📥' : '🔒')}
          </button>
        </div>
      </div>

      {/* 2. Center: Control & Scrubber */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexGrow: 1,
          maxWidth: '600px',
          padding: '0 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '6px' }}>
          <button style={{ color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '1.2rem' }}>⏮</button>
          <button
            onClick={handlePlayPause}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'var(--transition-default)'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button style={{ color: 'var(--text-muted)', cursor: 'not-allowed', fontSize: '1.2rem' }}>⏭</button>
        </div>
        
        {/* Scrubber Bar */}
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.001"
            value={duration > 0 ? currentTime / duration : 0}
            onChange={handleScrub}
            style={{
              flexGrow: 1,
              height: '4px',
              borderRadius: '2px',
              WebkitAppearance: 'none',
              backgroundColor: 'var(--border)',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '30px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right side: Volume Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '150px', justifyContent: 'flex-end' }}>
        <button onClick={handleMuteToggle} style={{ fontSize: '1.1rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          {isMuted || volume === 0 ? '🔇' : volume < 0.4 ? '🔉' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          style={{
            width: '80px',
            height: '4px',
            borderRadius: '2px',
            WebkitAppearance: 'none',
            backgroundColor: 'var(--border)',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '32px', textAlign: 'right' }}>
          {currentSample.type}
        </span>
      </div>

      {/* Styles for range sliders */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-primary);
          transition: transform 0.1s;
        }
        input[type='range']::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
};

export default GlobalPlayer;
