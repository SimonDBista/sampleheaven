"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pack } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authService, interactionService, adminService, orderService } from '../lib/supabase';
import QRCheckoutModal from './QRCheckoutModal';

interface PackCardProps {
  pack: Pack;
}

export const PackCard: React.FC<PackCardProps> = ({ pack }) => {
  const { addToast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [purchasedKitIds, setPurchasedKitIds] = useState<string[]>([]);
  const [pendingKitIds, setPendingKitIds] = useState<string[]>([]);
  const { user: currentUser } = useAuth();
  const [geoCountry, setGeoCountry] = useState('US');

  useEffect(() => {
    const loadOrders = async () => {
      if (!currentUser?.id) {
        setPurchasedKitIds([]);
        setPendingKitIds([]);
        return;
      }
      try {
        const orders = await orderService.getBuyerOrders(currentUser.id);
        const approved = orders.filter(o => o.status === 'approved').map(o => o.product_id);
        const pending = orders.filter(o => o.status === 'pending').map(o => o.product_id);
        setPurchasedKitIds(approved);
        setPendingKitIds(pending);
      } catch (err) {
        console.error("Failed to load buyer orders in PackCard:", err);
      }
    };
    loadOrders();
  }, [currentUser?.id, isCheckoutOpen]);

  useEffect(() => {
    setGeoCountry(adminService.getSimulatedGeoCountry());

    const handleGeoChange = () => {
      setGeoCountry(adminService.getSimulatedGeoCountry());
    };

    window.addEventListener('geo-country-change', handleGeoChange);
    return () => {
      window.removeEventListener('geo-country-change', handleGeoChange);
    };
  }, []);

  const dynamicPack = pack as any;
  const usdPrice = dynamicPack.price || 0;
  
  // Localize price based on geoCountry
  let localPrice = usdPrice;
  let currencySymbol = '$';
  if (geoCountry === 'GB') {
    localPrice = usdPrice * 0.78;
    currencySymbol = '£';
  } else if (geoCountry === 'DE') {
    localPrice = usdPrice * 0.92;
    currencySymbol = '€';
  } else if (geoCountry === 'CA') {
    localPrice = usdPrice * 1.36;
    currencySymbol = 'C$';
  }

  const isOwner = currentUser?.username === pack.creator;
  const isUnlocked = usdPrice === 0 || isOwner || purchasedKitIds.includes(pack.id);
  const isPending = pendingKitIds.includes(pack.id);

  const handleDownloadPack = (e: React.MouseEvent) => {
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

    addToast(`Downloading pack "${pack.title}"...`, 'success');
    
    const link = document.createElement('a');
    const dynamicPack = pack as any;
    
    if (dynamicPack.fileUrl) {
      link.href = dynamicPack.fileUrl;
      link.setAttribute('target', '_blank');
      link.setAttribute('download', dynamicPack.fileUrl.substring(dynamicPack.fileUrl.lastIndexOf('/') + 1));
    } else {
      // Mock / Offline download fallback: download a small mock file blob
      const blob = new Blob([`Mock pack content for ${pack.title}`], { type: 'application/zip' });
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${pack.title.replace(/\s+/g, '_')}.zip`);
    }
    
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  };

  return (
    <>
      <Link
        href={`/browse?genre=${encodeURIComponent(pack.genre)}`}
        className="pack-card"
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderLeft: '4px solid var(--accent-primary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          transition: 'var(--transition-default)',
          textDecoration: 'none',
          color: 'inherit'
        }}
      >
        {/* Left Column: Cover Art */}
        <div
          style={{
            width: '200px',
            minWidth: '200px',
            height: '200px',
            background: dynamicPack.coverArt ? `url(${dynamicPack.coverArt}) center center / cover no-repeat` : 'linear-gradient(135deg, var(--bg-tertiary) 0%, var(--bg-hover) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRight: '1px solid var(--border)',
            fontFamily: 'var(--font-heading)',
            fontSize: dynamicPack.coverArt ? '0' : '3rem',
            color: 'var(--text-muted)'
          }}
          className="pack-card-image"
        >
          {!dynamicPack.coverArt && '💿'}
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: 'white'
            }}
          >
            {pack.genre}
          </span>
        </div>

        {/* Right Column: Information */}
        <div
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flexGrow: 1
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pack.title}</h3>
              <span className="caption" style={{ color: 'var(--text-muted)' }}>
                {pack.downloadsCount.toLocaleString()} downloads
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.5rem',
                  fontWeight: 800
                }}
              >
                {pack.creator.charAt(0).toUpperCase()}
              </span>
              <span>by {pack.creator}</span>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '16px'
              }}
            >
              {pack.description}
            </p>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="tag">{pack.samplesCount} Samples</span>
              {usdPrice > 0 ? (
                isUnlocked ? (
                  <span className="tag tag-accent" style={{ backgroundColor: 'var(--success)', color: 'white' }}>✓ Purchased</span>
                ) : isPending ? (
                  <span className="tag tag-accent" style={{ backgroundColor: 'var(--warning)', color: 'black' }}>⌛ Pending Verification</span>
                ) : (
                  <span className="tag tag-accent" style={{ backgroundColor: 'var(--accent-secondary)', color: 'white' }}>Paid Kit</span>
                )
              ) : (
                <span className="tag tag-accent">Free Pack</span>
              )}
            </div>
            
            <button
              onClick={handleDownloadPack}
              disabled={isPending}
              className="btn btn-sm btn-primary"
              style={{
                background: isPending ? 'var(--bg-secondary)' : (!isUnlocked ? 'var(--accent-gradient)' : 'var(--bg-tertiary)'),
                border: isPending ? '1px solid var(--border)' : (!isUnlocked ? 'none' : '1px solid var(--border)'),
                color: isPending ? 'var(--text-muted)' : (!isUnlocked ? 'white' : 'var(--text-primary)'),
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isUnlocked ? '📥 Download Pack' : (isPending ? '⌛ Awaiting Verification' : `💳 Buy Pack (${currencySymbol}${localPrice.toFixed(2)})`)}
            </button>
          </div>
        </div>

        <style jsx global>{`
          @media (max-width: 640px) {
            .pack-card {
              flex-direction: column !important;
            }
            .pack-card-image {
              width: 100% !important;
              height: 160px !important;
              border-right: none !important;
              border-bottom: 1px solid var(--border) !important;
            }
          }
          .pack-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-md);
            border-color: hsla(265, 90%, 65%, 0.3);
            border-left-color: var(--accent-secondary);
          }
        `}</style>
      </Link>

      {isCheckoutOpen && (
        <QRCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={{
            id: pack.id,
            title: pack.title,
            creator: pack.creator,
            price: localPrice
          }}
          onSuccess={() => {
            setPurchasedKitIds(interactionService.getPurchasedKitIds());
            addToast(`Payment notice for "${pack.title}" submitted successfully!`, 'success');
          }}
        />
      )}
    </>
  );
};

export default PackCard;
