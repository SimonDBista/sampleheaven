"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { authService, profileService, productService, orderService, User, SellerProfile, Product, Order } from '../../lib/supabase';
import '../../styles/pages/dashboard.css';

export default function DashboardPage() {
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  const { user, isLoading: authLoading, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);

  // Dynamic States
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);

  // Navigation Panel (depends on Role)
  const [activePanel, setActivePanel] = useState<string>('');

  // Sub-tabs for Catalog and Library
  const [catalogTab, setCatalogTab] = useState<'Beat' | 'Pack' | 'One-Shot'>('Beat');
  const [libraryTab, setLibraryTab] = useState<'Beat' | 'Pack' | 'One-Shot'>('Beat');

  // Edit Settings states
  const [displayName, setDisplayName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  const loadDashboardData = async (currentUser: User) => {
    try {
      if (currentUser.role === 'Seller') {
        const profile = await profileService.getSellerProfile(currentUser.id);
        if (profile) {
          setSellerProfile(profile);
          setDisplayName(profile.display_name || '');
          setInstagram(profile.instagram_username || '');
          setProfilePic(profile.profile_picture_url || '');
          setQrCode(profile.qr_image_url || '');
        }
        
        const sellerProducts = await productService.getSellerProducts(currentUser.id);
        setProducts(sellerProducts);
        
        const incomingOrders = await orderService.getSellerOrders(currentUser.id);
        setSellerOrders(incomingOrders);
      } else {
        const history = await orderService.getBuyerOrders(currentUser.id);
        setBuyerOrders(history);
        setDisplayName(currentUser.username || '');
        setProfilePic(currentUser.profile_picture_url || '');
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      if (!activePanel) {
        setActivePanel(user.role === 'Seller' ? 'settings' : 'library');
      }
      loadDashboardData(user);
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    try {
      if (user.role === 'Seller') {
        const updated = await profileService.updateSellerProfile(user.id, {
          display_name: displayName,
          instagram_username: instagram,
          profile_picture_url: profilePic,
          qr_image_url: qrCode
        });
        if (updated) {
          setSellerProfile(updated);
          addToast('🎉 Seller profile settings saved successfully!', 'success');
        }
      } else {
        const updated = await updateUserProfile({
          username: displayName,
          profile_picture_url: profilePic
        });
        if (updated) {
          addToast('🎉 Profile settings saved successfully!', 'success');
        }
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      addToast(`Deleted "${title}" successfully.`, 'success');
    } catch (err) {
      addToast('Failed to delete product.', 'error');
    }
  };

  const handleOrderAction = async (orderId: string, status: 'approved' | 'rejected', buyerName: string) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      if (updated) {
        setSellerOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        addToast(`Order has been marked as ${status}. Access updated for ${buyerName}.`, 'success');
      }
    } catch (err) {
      addToast('Failed to update order status.', 'error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pic' | 'qr') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const val = event.target.result as string;
          if (type === 'pic') setProfilePic(val);
          else setQrCode(val);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleTriggerDownload = (order: Order) => {
    addToast(`Starting download for unlocked beat/pack: ${order.product_title}`, 'success');
  };

  if (loading) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <h2>Dashboard Restricted</h2>
        <p>Please log in to view purchases, edit your profile settings, or manage uploads.</p>
        <Link href="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="container main-content" style={{ marginTop: '32px' }}>
      
      {/* 2-column sidebar layout */}
      <div style={{ display: 'flex', gap: '32px', minHeight: '60vh', flexWrap: 'wrap' }} className="grid-2col">
        
        {/* Sidebar Nav (Left) */}
        <aside
          style={{
            width: '260px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            height: 'fit-content'
          }}
        >
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '12px' }}>
            <span className="caption" style={{ color: 'var(--text-muted)' }}>MARKETPLACE ACCOUNT</span>
            <h4 style={{ color: 'var(--text-primary)', marginTop: '4px' }}>{user.username}</h4>
            <span className="tag tag-accent" style={{ marginTop: '6px', display: 'inline-block' }}>Role: {user.role}</span>
          </div>

          {/* Seller Menu Buttons */}
          {user.role === 'Seller' && (
            <>
              <button
                onClick={() => setActivePanel('settings')}
                className={`btn btn-sm ${activePanel === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                ⚙️ Profile settings
              </button>

              <button
                onClick={() => setActivePanel('catalog')}
                className={`btn btn-sm ${activePanel === 'catalog' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                🎵 My Catalog ({products.length})
              </button>

              <button
                onClick={() => setActivePanel('orders')}
                className={`btn btn-sm ${activePanel === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                💰 Incoming Orders ({sellerOrders.filter(o => o.status === 'pending').length})
              </button>

              <Link
                href="/upload"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '24px', width: '100%', background: 'var(--accent-gradient)' }}
              >
                📤 Upload Product
              </Link>
            </>
          )}

          {/* Buyer Menu Buttons */}
          {user.role === 'Buyer' && (
            <>
              <button
                onClick={() => setActivePanel('settings')}
                className={`btn btn-sm ${activePanel === 'settings' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                ⚙️ Profile settings
              </button>

              <button
                onClick={() => setActivePanel('library')}
                className={`btn btn-sm ${activePanel === 'library' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ justifyContent: 'flex-start', width: '100%' }}
              >
                💾 My Library ({buyerOrders.length})
              </button>
              
              <Link
                href="/browse"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '24px', width: '100%', background: 'var(--accent-gradient)' }}
              >
                🔍 Browse Sounds
              </Link>
            </>
          )}
        </aside>

        {/* Content Area (Right) */}
        <div style={{ flexGrow: 1, maxWidth: '100%', overflow: 'hidden' }}>
          
          {/* PANEL: PROFILE SETTINGS */}
          {activePanel === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem' }}>{user.role === 'Seller' ? 'Seller Profile Configuration' : 'Profile Settings'}</h2>
                <p className="body-small">
                  {user.role === 'Seller' 
                    ? 'Customize your shopfront. Set display info and payment routing QR codes.' 
                    : 'Customize your profile. Upload an avatar and set your display name.'}
                </p>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
                
                {/* Display Name */}
                <div className="form-group">
                  <label className="form-label">{user.role === 'Seller' ? 'Display Store Name' : 'Display Name / Username'}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={user.role === 'Seller' ? 'e.g. KVNG Beats' : 'e.g. Alex Mercer'}
                    required
                  />
                </div>

                {/* Instagram Handle */}
                {user.role === 'Seller' && (
                  <div className="form-group">
                    <label className="form-label">Instagram Username</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
                      <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '32px' }}
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="kvngbeats_official"
                      />
                    </div>
                  </div>
                )}

                <div style={user.role === 'Seller' ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' } : {}} className={user.role === 'Seller' ? "grid-2col" : ""}>
                  
                  {/* Profile Picture */}
                  <div className="form-group" style={user.role !== 'Seller' ? { maxWidth: '280px' } : {}}>
                    <label className="form-label">Profile Avatar</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, 'pic')} />
                      {profilePic ? (
                        <img src={profilePic} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <>
                          <span style={{ fontSize: '1.5rem' }}>📷</span>
                          <span className="caption">Upload Picture</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Payment QR code */}
                  {user.role === 'Seller' && (
                    <div className="form-group">
                      <label className="form-label">Payment QR Image (eSewa / Khalti / Bank QR)</label>
                      <div
                        onClick={() => qrInputRef.current?.click()}
                        style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <input type="file" ref={qrInputRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => handleImageUpload(e, 'qr')} />
                        {qrCode ? (
                          <img src={qrCode} alt="QR Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'white' }} />
                        ) : (
                          <>
                            <span style={{ fontSize: '1.5rem' }}>📤</span>
                            <span className="caption">Upload Payment QR</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '48px', marginTop: '8px', background: 'var(--accent-gradient)' }}
                >
                  {isSavingProfile ? 'Saving settings...' : '💾 Save Profile Configuration'}
                </button>
              </form>
            </div>
          )}

          {/* PANEL: SELLER CATALOG */}
          {activePanel === 'catalog' && user.role === 'Seller' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.75rem' }}>My Catalog</h2>
                <Link href="/upload" className="btn btn-secondary btn-sm">Upload New Sound</Link>
              </div>

              {/* Sub-tabs Categorization */}
              <div className="segmented-control" style={{ marginBottom: '20px', maxWidth: '520px' }}>
                <button
                  type="button"
                  className={`segment-btn ${catalogTab === 'Beat' ? 'segment-btn--active' : ''}`}
                  onClick={() => setCatalogTab('Beat')}
                >
                  🎹 Beats ({products.filter(p => p.type === 'Beat').length})
                </button>
                <button
                  type="button"
                  className={`segment-btn ${catalogTab === 'Pack' ? 'segment-btn--active' : ''}`}
                  onClick={() => setCatalogTab('Pack')}
                >
                  📦 Sample Kits ({products.filter(p => p.type === 'Pack').length})
                </button>
                <button
                  type="button"
                  className={`segment-btn ${catalogTab === 'One-Shot' ? 'segment-btn--active' : ''}`}
                  onClick={() => setCatalogTab('One-Shot')}
                >
                  🎯 One-Shots ({products.filter(p => p.type === 'One-Shot').length})
                </button>
              </div>

              {products.filter(p => p.type === catalogTab).length === 0 ? (
                <div className="empty-state" style={{ minHeight: '30vh' }}>
                  <span>🎵</span>
                  <h3>No uploads found</h3>
                  <p className="body-small">You have not uploaded any custom {catalogTab === 'Beat' ? 'beats' : catalogTab === 'Pack' ? 'sample kits' : 'one-shot sounds'} yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }} className="body-small">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 18px' }}>Title</th>
                        <th style={{ padding: '12px 18px' }}>Type</th>
                        <th style={{ padding: '12px 18px' }}>Genre</th>
                        <th style={{ padding: '12px 18px' }}>Price</th>
                        <th style={{ padding: '12px 18px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.filter(p => p.type === catalogTab).map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</td>
                          <td style={{ padding: '12px 18px' }}>
                            <span className="tag" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{p.type}</span>
                          </td>
                          <td style={{ padding: '12px 18px' }}>{p.genre}</td>
                          <td style={{ padding: '12px 18px', fontWeight: 700 }}>
                            {p.price > 0 ? `$${p.price.toFixed(2)}` : 'Free'}
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Active</span>
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.title)}
                              style={{ color: 'var(--error)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PANEL: SELLER INCOMING ORDERS */}
          {activePanel === 'orders' && user.role === 'Seller' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>Incoming Orders Approval</h2>
              {sellerOrders.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '30vh' }}>
                  <span>💰</span>
                  <h3>No incoming orders yet</h3>
                  <p className="body-small">Transactions submitted by buyers using your QR code will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }} className="body-small">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 18px' }}>Buyer</th>
                        <th style={{ padding: '12px 18px' }}>Product</th>
                        <th style={{ padding: '12px 18px' }}>Price</th>
                        <th style={{ padding: '12px 18px' }}>Payment Provider</th>
                        <th style={{ padding: '12px 18px' }}>Status</th>
                        <th style={{ padding: '12px 18px' }}>Payment Proof</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerOrders.map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{o.buyer_name}</td>
                          <td style={{ padding: '12px 18px' }}>{o.product_title}</td>
                          <td style={{ padding: '12px 18px', fontWeight: 700 }}>${o.product_price.toFixed(2)}</td>
                          <td style={{ padding: '12px 18px' }}>{o.payment_method}</td>
                          <td style={{ padding: '12px 18px' }}>
                            <span
                              style={{
                                color: o.status === 'approved' ? 'var(--success)' : o.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                                fontWeight: 700,
                                textTransform: 'capitalize'
                              }}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 18px' }}>
                            {o.payment_proof_url ? (
                              <button
                                onClick={() => setSelectedProofOrder(o)}
                                className="btn btn-sm btn-ghost"
                                style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer' }}
                              >
                                🖼️ View Proof
                              </button>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>No Proof</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            {o.status === 'pending' ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOrderAction(o.id, 'approved', o.buyer_name)}
                                  className="btn btn-sm btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: 'var(--success)', border: 'none', cursor: 'pointer' }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleOrderAction(o.id, 'rejected', o.buyer_name)}
                                  className="btn btn-sm btn-ghost"
                                  style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--error)', color: 'var(--error)', cursor: 'pointer' }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PANEL: BUYER DOWNLOADS/LIBRARY */}
          {activePanel === 'library' && user.role === 'Buyer' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '20px' }}>My Library & Sound Downloads</h2>
              
              {/* Sub-tabs Categorization */}
              <div className="segmented-control" style={{ marginBottom: '20px', maxWidth: '520px' }}>
                <button
                  type="button"
                  className={`segment-btn ${libraryTab === 'Beat' ? 'segment-btn--active' : ''}`}
                  onClick={() => setLibraryTab('Beat')}
                >
                  🎹 Beats ({buyerOrders.filter(o => (o.product_type || 'Beat') === 'Beat').length})
                </button>
                <button
                  type="button"
                  className={`segment-btn ${libraryTab === 'Pack' ? 'segment-btn--active' : ''}`}
                  onClick={() => setLibraryTab('Pack')}
                >
                  📦 Sample Kits ({buyerOrders.filter(o => (o.product_type || 'Beat') === 'Pack').length})
                </button>
                <button
                  type="button"
                  className={`segment-btn ${libraryTab === 'One-Shot' ? 'segment-btn--active' : ''}`}
                  onClick={() => setLibraryTab('One-Shot')}
                >
                  🎯 One-Shots ({buyerOrders.filter(o => (o.product_type || 'Beat') === 'One-Shot').length})
                </button>
              </div>

              {buyerOrders.filter(o => (o.product_type || 'Beat') === libraryTab).length === 0 ? (
                <div className="empty-state" style={{ minHeight: '30vh' }}>
                  <span>💾</span>
                  <h3>No {libraryTab === 'Beat' ? 'beats' : libraryTab === 'Pack' ? 'sample kits' : 'one-shot sounds'} found</h3>
                  <p className="body-small">You do not have any purchased/downloaded {libraryTab === 'Beat' ? 'beats' : libraryTab === 'Pack' ? 'sample kits' : 'one-shot sounds'} in this category.</p>
                  <Link href="/browse" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Browse Sound Catalog</Link>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }} className="body-small">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '12px 18px' }}>Product</th>
                        <th style={{ padding: '12px 18px' }}>Price</th>
                        <th style={{ padding: '12px 18px' }}>Method</th>
                        <th style={{ padding: '12px 18px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Download File</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyerOrders.filter(o => (o.product_type || 'Beat') === libraryTab).map((o) => {
                        const isApproved = o.status === 'approved';
                        return (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 18px', fontWeight: 600, color: 'var(--text-primary)' }}>{o.product_title}</td>
                            <td style={{ padding: '12px 18px' }}>${o.product_price.toFixed(2)}</td>
                            <td style={{ padding: '12px 18px' }}>{o.payment_method}</td>
                            <td style={{ padding: '12px 18px' }}>
                              <span
                                style={{
                                  color: o.status === 'approved' ? 'var(--success)' : o.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                                  fontWeight: 700,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {o.status === 'pending' ? '⌛ Pending Approval' : o.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleTriggerDownload(o)}
                                disabled={!isApproved}
                                className="btn btn-sm btn-primary"
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '0.75rem',
                                  backgroundColor: isApproved ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                  color: isApproved ? 'white' : 'var(--text-muted)',
                                  border: isApproved ? 'none' : '1px solid var(--border)',
                                  cursor: isApproved ? 'pointer' : 'not-allowed'
                                }}
                              >
                                {isApproved ? '📥 Download File' : '🔒 Pending Release'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* View Proof Modal */}
      {selectedProofOrder && (
        <Modal
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          title={`🔍 Verify Payment - ${selectedProofOrder.buyer_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <p className="body-small" style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}><strong>Product:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedProofOrder.product_title}</span></p>
              <p className="body-small" style={{ marginBottom: '4px', color: 'var(--text-secondary)' }}><strong>Price:</strong> <span style={{ color: 'var(--text-primary)' }}>${selectedProofOrder.product_price.toFixed(2)}</span></p>
              <p className="body-small" style={{ color: 'var(--text-secondary)' }}><strong>Payment Method:</strong> <span style={{ color: 'var(--text-primary)' }}>{selectedProofOrder.payment_method}</span></p>
            </div>
            <div>
              <p className="body-small" style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Uploaded Receipt / Proof of Payment:</p>
              <div style={{ width: '100%', maxHeight: '360px', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', padding: '8px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={selectedProofOrder.payment_proof_url}
                  alt="Payment Proof Receipt"
                  style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '8px 16px' }}
              >
                Close
              </button>
              {selectedProofOrder.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleOrderAction(selectedProofOrder.id, 'rejected', selectedProofOrder.buyer_name);
                      setSelectedProofOrder(null);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 16px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleOrderAction(selectedProofOrder.id, 'approved', selectedProofOrder.buyer_name);
                      setSelectedProofOrder(null);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: 'var(--success)', color: 'white', border: 'none', padding: '8px 16px', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
