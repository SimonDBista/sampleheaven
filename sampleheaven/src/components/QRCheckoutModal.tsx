"use client";

import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { authService, profileService, orderService, SellerProfile } from '../lib/supabase';

interface QRCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    creator: string; // seller username
    price: number;
  };
  onSuccess: () => void;
}

export const QRCheckoutModal: React.FC<QRCheckoutModalProps> = ({ isOpen, onClose, product, onSuccess }) => {
  const { addToast } = useToast();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const { user: buyer } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [paymentMethod, setPaymentMethod] = useState<'eSewa' | 'Khalti' | 'Bank Transfer'>('eSewa');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string>('');
  const proofInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { profile } = await profileService.getSellerProfileByUsername(product.creator);
        setSellerProfile(profile);
      } catch (err) {
        console.error("Failed to load seller checkout profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen, product.creator]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPaymentProof(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleConfirmPayment = async () => {
    if (!buyer) {
      addToast('Please log in to make a purchase.', 'error');
      return;
    }
    if (!sellerProfile) {
      addToast('Seller profile could not be loaded.', 'error');
      return;
    }
    if (!paymentProof) {
      addToast('Please upload a screenshot or receipt of your transaction as proof of payment.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate confirmation network/processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      await orderService.createOrder(
        buyer.id,
        sellerProfile.user_id,
        product.id,
        paymentMethod,
        paymentProof
      );

      addToast('🎉 Payment notice submitted! Awaiting seller verification.', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit payment notice.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultQR = "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?q=80&w=300&h=300&auto=format&fit=crop";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💸 Manual Payment Checkout">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '16px' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading seller details and payment setup...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Summary */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '16px',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{product.title}</h4>
              <span className="caption" style={{ color: 'var(--text-muted)' }}>Seller: <b>{sellerProfile?.display_name || product.creator}</b></span>
            </div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent-secondary)'
              }}
            >
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Choose Payment Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['eSewa', 'Khalti', 'Bank Transfer'] as const).map((method) => {
                const isActive = paymentMethod === method;
                const emoji = method === 'eSewa' ? '🟢' : method === 'Khalti' ? '🟣' : '🏦';
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: isActive ? '2px solid var(--accent-primary)' : '1px solid var(--border)',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{method}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* QR Display Panel */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '24px',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            {sellerProfile?.qr_image_url ? (
              <img
                src={sellerProfile.qr_image_url}
                alt="Seller Payment QR"
                style={{
                  width: '180px',
                  height: '180px',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'white',
                  padding: '8px',
                  border: '1px solid var(--border)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '16px',
                  border: '2px dashed var(--border)'
                }}
              >
                No Custom QR Code Uploaded. Scan fallback below.
              </div>
            )}

            {!sellerProfile?.qr_image_url && (
              <img
                src={defaultQR}
                alt="Default QR"
                style={{
                  width: '120px',
                  height: '120px',
                  objectFit: 'contain',
                  opacity: 0.6,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'white',
                  padding: '4px'
                }}
              />
            )}

            <div>
              <p className="body-small" style={{ fontWeight: 600 }}>
                Scan to pay ${product.price.toFixed(2)} via {paymentMethod}
              </p>
              {sellerProfile?.instagram_username && (
                <p className="caption" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  Instagram Support: <a href={`https://instagram.com/${sellerProfile.instagram_username}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>@{sellerProfile.instagram_username}</a>
                </p>
              )}
            </div>
          </div>

          {/* Checklist Instructions */}
          <div style={{ padding: '0 8px' }}>
            <h5 style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '8px' }}>📋 Instructions</h5>
            <ol className="caption" style={{ color: 'var(--text-secondary)', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <li>Open your {paymentMethod} or mobile banking app on your phone.</li>
              <li>Scan the QR code above or upload it from your gallery.</li>
              <li>Transfer the exact amount of <b>${product.price.toFixed(2)}</b>.</li>
              <li>Once payment is successful, take a screenshot of the receipt.</li>
              <li>Upload the screenshot in the area below, then click **"I have paid"**.</li>
              <li>The seller will manually approve your transaction to unlock your download.</li>
            </ol>
          </div>

          {/* Payment Proof Upload Area */}
          <div style={{ padding: '0 8px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontWeight: 600 }}>
              📤 Upload Payment Proof (Receipt Screenshot) <span style={{ color: 'var(--error)' }}>*</span>
            </label>
            <div
              onClick={() => proofInputRef.current?.click()}
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-tertiary)',
                position: 'relative',
                transition: 'border-color 0.2s ease, background-color 0.2s ease'
              }}
            >
              <input
                type="file"
                ref={proofInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleProofUpload}
              />
              {paymentProof ? (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img
                    src={paymentProof}
                    alt="Payment Proof Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem'
                    }}
                  >
                    Click to Change
                  </div>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📸</span>
                  <span className="caption" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '0 10px' }}>
                    Click to upload transaction receipt image
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', height: '48px', marginTop: '8px', background: 'var(--accent-gradient)' }}
          >
            {isSubmitting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                <span>Submitting payment notice...</span>
              </div>
            ) : (
              '✅ I have paid'
            )}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default QRCheckoutModal;
