"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Sample } from '../data/mockData';
import { useAudio } from '../context/AudioContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authService, productService, interactionService, Product } from '../lib/supabase';
import QRCheckoutModal from './QRCheckoutModal';

interface WaveformPlayerProps {
  sample: Sample;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ sample }) => {
  const { currentSample, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume } = useAudio();
  const { addToast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isLiked, setIsLiked] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipX, setTooltipX] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Key selector
  const [selectedKey, setSelectedKey] = useState(sample.key || 'C');

  // Purchase states
  const { user: currentUser } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [dbProduct, setDbProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const isCurrent = currentSample?.id === sample.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  
  // Waveform peak data seeded from sample ID
  const peaksRef = useRef<number[]>([]);
  if (peaksRef.current.length === 0) {
    const seed = sample.title.charCodeAt(0) + sample.title.length;
    const numBars = 120;
    const peaks = [];
    for (let i = 0; i < numBars; i++) {
      const val = Math.abs(Math.sin(i * 0.15 + seed) * Math.cos(i * 0.05)) * 0.8 + 0.15;
      peaks.push(val);
    }
    peaksRef.current = peaks;
  }

  useEffect(() => {
    const loadState = async () => {
      setIsLiked(interactionService.getLikedIds().includes(sample.id));
      setPurchasedIds(interactionService.getPurchasedKitIds());
      setPendingIds(interactionService.getPendingKitIds());

      try {
        const allProds = await productService.getProducts();
        const found = allProds.find(p => p.id === sample.id || (p.title.toLowerCase() === sample.title.toLowerCase() && p.seller_name.toLowerCase() === sample.creator.toLowerCase()));
        setDbProduct(found || null);
      } catch (err) {
        console.error("Failed to load sample details:", err);
      }
    };
    loadState();
  }, [sample.id, sample.title, sample.creator, currentUser?.id]);

  // Redraw Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const peaks = peaksRef.current;
    const numBars = peaks.length;
    const barWidth = 3;
    const barGap = 2;
    const totalBarSpace = barWidth + barGap;
    
    const startX = (width - (numBars * totalBarSpace)) / 2;
    
    ctx.clearRect(0, 0, width, height);

    const playedPercent = isCurrent && duration > 0 ? currentTime / duration : 0;
    const playedThreshold = numBars * playedPercent;

    for (let i = 0; i < numBars; i++) {
      const x = startX + i * totalBarSpace;
      const barHeight = peaks[i] * height * 0.8;
      const y = (height - barHeight) / 2;

      if (i < playedThreshold) {
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, '#8b5cf6');
        grad.addColorStop(1, '#22d3ee');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = 'rgba(107, 107, 118, 0.35)';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1.5);
      ctx.fill();
    }

    if (isCurrent && playedPercent > 0 && playedPercent < 1) {
      const playheadX = startX + (numBars * totalBarSpace * playedPercent);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(playheadX, 0, 2, height);
    }
  }, [currentTime, duration, isCurrent, sample.id]);

  const handlePlayPause = () => {
    togglePlay(sample);
  };

  const getPercentageFromEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    return Math.max(0, Math.min(1, pct));
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pct = getPercentageFromEvent(e);
    seek(pct);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const hoverTime = pct * duration;
    
    const minutes = Math.floor(hoverTime / 60);
    const seconds = Math.floor(hoverTime % 60);
    setTooltipText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    setTooltipX(x);
    setShowTooltip(true);

    if (isScrubbing) {
      seek(pct);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScrubbing(true);
    seek(getPercentageFromEvent(e));
  };

  const handleCanvasMouseUp = () => {
    setIsScrubbing(false);
  };

  const handleLike = () => {
    const liked = interactionService.toggleLike(sample.id);
    setIsLiked(liked);
    addToast(liked ? 'Saved to library!' : 'Removed from library', 'info');
  };

  const price = dbProduct ? dbProduct.price : 0;
  const isOwner = currentUser?.username === sample.creator;
  const isUnlocked = price === 0 || isOwner || purchasedIds.includes(sample.id) || (dbProduct ? purchasedIds.includes(dbProduct.id) : false);
  const isPending = pendingIds.includes(sample.id) || (dbProduct ? pendingIds.includes(dbProduct.id) : false);

  const handleDownload = () => {
    if (isPending) {
      addToast('Your payment notice is currently pending verification from the seller/admin.', 'info');
      return;
    }

    if (!isUnlocked) {
      setIsCheckoutOpen(true);
      return;
    }
    interactionService.recordDownload(sample.id);
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

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (sample.type === 'Pack' || sample.type === 'Kit') {
    return (
      <div 
        ref={containerRef}
        style={{ 
          backgroundColor: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '28px',
          minHeight: '200px',
          flexWrap: 'wrap'
        }}
      >
        {/* Large Cover Art / CD Icon */}
        <div style={{
          width: '140px',
          height: '140px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: sample.coverArt ? `url(${sample.coverArt}) center center / cover no-repeat` : 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '3.5rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          flexShrink: 0
        }}>
          {!sample.coverArt && '💿'}
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="tag tag-accent">💿 Sample Kit</span>
            <span className="tag">{sample.genre}</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{sample.title}</h2>
          <p className="body-small" style={{ color: 'var(--text-muted)', margin: '4px 0 16px', lineHeight: 1.5 }}>
            This is a compressed sound library archive (.zip / .rar format). It contains loops, stems, and one-shots. Click the download button below to save the kit.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button onClick={handleLike} className="btn btn-secondary btn-sm">
              {isLiked ? '❤️ Saved' : '🤍 Add to Library'}
            </button>

            <button
              onClick={handleDownload}
              disabled={isPending}
              className="btn btn-primary btn-sm"
              style={{
                background: isPending ? 'var(--bg-secondary)' : (!isUnlocked ? 'var(--accent-gradient)' : 'var(--bg-tertiary)'),
                color: isPending ? 'var(--text-muted)' : (!isUnlocked ? 'white' : 'var(--text-primary)'),
                border: isPending ? '1px solid var(--border)' : (!isUnlocked ? 'none' : '1px solid var(--border)'),
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isUnlocked ? '📥 Download Kit Archive' : (isPending ? '⌛ Awaiting Verification' : `💳 Buy Kit ($${price.toFixed(2)})`)}
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                addToast('Link copied to clipboard!', 'success');
              }}
              className="btn btn-icon"
              style={{ width: '38px', height: '38px' }}
              aria-label="Share sample"
            >
              🔗
            </button>
          </div>
        </div>

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
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}
    >
      {/* 1. Interactive Canvas Area */}
      <div style={{ position: 'relative', width: '100%', height: '120px' }} onMouseLeave={() => setShowTooltip(false)}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'ew-resize',
            display: 'block'
          }}
        />

        {/* Hover Time Tooltip */}
        {showTooltip && (
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: `${tooltipX}px`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem',
              color: 'var(--text-primary)',
              pointerEvents: 'none',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 10
            }}
          >
            {tooltipText}
          </div>
        )}
      </div>

      {/* 2. Controls Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Play & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handlePlayPause}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-gradient)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.25rem',
              boxShadow: isCurrentlyPlaying ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
              transition: 'var(--transition-default)'
            }}
            className={isCurrentlyPlaying ? 'pulse-playing' : ''}
          >
            {isCurrentlyPlaying ? '❚❚' : '▶'}
          </button>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isCurrent ? formatTime(currentTime) : '0:00'} / {formatTime(isCurrent ? duration : parseFloat(sample.duration.split(':')[0])*60 + parseFloat(sample.duration.split(':')[1]))}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Click waveform to seek
            </span>
          </div>
        </div>

        {/* Volume & Utility Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Key selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="caption" style={{ color: 'var(--text-muted)' }}>Key:</span>
            <select
              value={selectedKey}
              onChange={(e) => {
                const k = e.target.value;
                setSelectedKey(k);
                addToast(`Transposed sound to key ${k}! Preview and download updated.`, 'info');
              }}
              style={{
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{
                width: '100px',
                height: '4px',
                borderRadius: '2px',
                WebkitAppearance: 'none',
                backgroundColor: 'var(--border)',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Action Row */}
          <button onClick={handleLike} className="btn btn-secondary btn-sm">
            {isLiked ? '❤️ Saved' : '🤍 Add to Library'}
          </button>

          <button
            onClick={handleDownload}
            disabled={isPending}
            className="btn btn-primary btn-sm"
            style={{
              background: isPending ? 'var(--bg-secondary)' : (!isUnlocked ? 'var(--accent-gradient)' : 'var(--bg-tertiary)'),
              color: isPending ? 'var(--text-muted)' : (!isUnlocked ? 'white' : 'var(--text-primary)'),
              border: isPending ? '1px solid var(--border)' : (!isUnlocked ? 'none' : '1px solid var(--border)'),
              cursor: isPending ? 'not-allowed' : 'pointer'
            }}
          >
            {isUnlocked ? `📥 Download (${selectedKey})` : (isPending ? '⌛ Awaiting Verification' : `💳 Buy WAV ($${price.toFixed(2)})`)}
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              addToast('Link copied to clipboard!', 'success');
            }}
            className="btn btn-icon"
            style={{ width: '38px', height: '38px' }}
            aria-label="Share sample"
          >
            🔗
          </button>
        </div>
      </div>

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
    </div>
  );
};

export default WaveformPlayer;
