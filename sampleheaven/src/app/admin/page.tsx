"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService, MockUser, orderService, productService, Order, isRealSupabaseConfigured, supabase, getCoverArtUrl, Product } from '../../lib/supabase';
import Modal from '../../components/Modal';
import '../../styles/pages/admin.css';

export default function AdminPage() {
  const { addToast } = useToast();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Dashboard navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sounds' | 'geo' | 'settings' | 'upload' | 'orders'>('overview');
  
  // Platform States
  const [users, setUsers] = useState<MockUser[]>([]);
  const [moderationList, setModerationList] = useState<any[]>([]);
  const [selectedGeo, setSelectedGeo] = useState('US');

  // Admin Store branding & payment settings states
  const [storeName, setStoreName] = useState('');
  const [storeInstagram, setStoreInstagram] = useState('');
  const [storeQrCode, setStoreQrCode] = useState('');
  const [isSavingStoreProfile, setIsSavingStoreProfile] = useState(false);
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);

  // Admin Product Upload Form States
  const [kitTitle, setKitTitle] = useState('');
  const [kitDescription, setKitDescription] = useState('');
  const [kitGenre, setKitGenre] = useState('Trap');
  const [kitPrice, setKitPrice] = useState('14.99');
  const [kitFileName, setKitFileName] = useState('');
  const [isPublishingKit, setIsPublishingKit] = useState(false);
  const [publishingProgress, setPublishingProgress] = useState(0);
  const [kitFile, setKitFile] = useState<File | null>(null);
  const [kitCoverArt, setKitCoverArt] = useState<string | null>(null);
  const [kitCoverArtFile, setKitCoverArtFile] = useState<File | null>(null);
  const kitCoverInputRef = useRef<HTMLInputElement>(null);
  const [adminKits, setAdminKits] = useState<Product[]>([]);

  const loadAdminStoreData = async () => {
    try {
      let store_name = '';
      let instagram_username = '';
      let qr_image_url = '';

      if (isRealSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          store_name = data.display_name;
          instagram_username = data.instagram_username || '';
          qr_image_url = data.qr_image_url || '';
        }
      }

      // Fallback to local storage if not found in Supabase or in mock mode
      if (!store_name) {
        const adminProfile = adminService.getAdminProfile();
        store_name = adminProfile.store_name;
        instagram_username = adminProfile.instagram_username;
        qr_image_url = adminProfile.qr_image_url;
      }

      setStoreName(store_name);
      setStoreInstagram(instagram_username);
      setStoreQrCode(qr_image_url);

      const sellerId = user?.id || 'usr-admin';
      const orders = await orderService.getSellerOrders(sellerId);
      setAdminOrders(orders);
    } catch (err) {
      console.error("Failed to load admin store data:", err);
    }
  };

  const loadAdminKits = async () => {
    if (!user) return;
    try {
      const allProds = await productService.getSellerProducts(user.id);
      const packs = allProds.filter(p => p.type === 'Pack');
      setAdminKits(packs);
    } catch (err) {
      console.error("Failed to load admin kits:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await adminService.getGlobalUsers();
        setUsers(u);
        const m = await adminService.getGlobalModerationList();
        setModerationList(m);
      } catch (err) {
        console.error("Failed to load admin global list:", err);
      }
    };
    loadData();
    setSelectedGeo(adminService.getSimulatedGeoCountry());
  }, []);

  useEffect(() => {
    if (user) {
      loadAdminStoreData();
      loadAdminKits();
    }
  }, [user]);

  // Handlers
  const handleToggleVerification = async (userId: string, username: string) => {
    try {
      const updated = await adminService.toggleUserVerification(userId);
      setUsers(updated);
      addToast(`Verification status updated for creator "${username}".`, 'success');
    } catch (err) {
      addToast('Failed to update verification status.', 'error');
    }
  };

  const handleToggleSuspension = async (userId: string, username: string) => {
    try {
      const updated = await adminService.toggleUserSuspension(userId);
      setUsers(updated);
      addToast(`Suspension status toggled for user "${username}".`, 'info');
    } catch (err) {
      addToast('Failed to update suspension status.', 'error');
    }
  };

  const handleDeleteAsset = async (id: string, title: string, type: string) => {
    try {
      await adminService.deleteAnyAsset(id, type);
      const m = await adminService.getGlobalModerationList();
      setModerationList(m);
      addToast(`Successfully deleted ${type} asset "${title}" from platform.`, 'success');
    } catch (err) {
      addToast('Failed to delete asset.', 'error');
    }
  };

  const handleGeoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setSelectedGeo(countryCode);
    adminService.setSimulatedGeoCountry(countryCode);
    addToast(`Simulated country changed to ${countryCode}. All prices localizing.`, 'info');
  };

  // Admin Settings Handlers
  const handleSaveStoreProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStoreProfile(true);
    try {
      await adminService.updateAdminProfile({
        store_name: storeName,
        instagram_username: storeInstagram,
        qr_image_url: storeQrCode
      }, user?.id);
      addToast('🎉 Admin store settings updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update admin store settings.', 'error');
    } finally {
      setIsSavingStoreProfile(false);
    }
  };

  const handleStoreQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setStoreQrCode(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAdminOrderAction = async (orderId: string, status: 'approved' | 'rejected', buyerName: string) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      if (updated) {
        setAdminOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        addToast(`Admin Store Order has been marked as ${status}. Access granted to ${buyerName}.`, 'success');
      }
    } catch (err) {
      addToast('Failed to update order status.', 'error');
    }
  };

  const handleKitCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setKitCoverArtFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setKitCoverArt(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishAdminKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kitTitle.trim()) {
      addToast('Kit title is required.', 'error');
      return;
    }
    if (!kitFileName) {
      addToast('Please upload a zip/rar file.', 'error');
      return;
    }

    setIsPublishingKit(true);
    setPublishingProgress(0);

    const interval = setInterval(() => {
      setPublishingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    try {
      let finalFileUrl = kitFileName;
      let coverArtUrl = '';

      if (isRealSupabaseConfigured && supabase && user) {
        // 1. Upload Kit Zip/Rar File to Storage
        if (kitFile) {
          const filePath = `${user.id}/${kitFile.name}`;
          const { error: storageError } = await supabase.storage
            .from('samples')
            .upload(filePath, kitFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (storageError) {
            throw new Error(`Kit file upload failed: ${storageError.message}`);
          }
          finalFileUrl = kitFile.name;
        }

        // 2. Upload Cover Art Image to Storage
        if (kitCoverArtFile) {
          const coverPath = `${user.id}/cover_${Date.now()}_${kitCoverArtFile.name}`;
          const { error: coverError } = await supabase.storage
            .from('samples')
            .upload(coverPath, kitCoverArtFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (coverError) {
            console.error("Kit cover upload failed:", coverError);
          } else {
            coverArtUrl = coverPath;
          }
        }
      } else {
        // Offline / Mock fallback
        if (kitCoverArt) {
          coverArtUrl = kitCoverArt;
        }
      }

      await productService.uploadProduct({
        seller_id: user ? user.id : 'usr-admin',
        title: kitTitle,
        description: kitDescription,
        type: 'Pack', // Locked to Pack (Sample Kit)
        genre: kitGenre,
        price: parseFloat(kitPrice) || 0,
        file_url: finalFileUrl,
        tags: ['kit', 'admin', 'pack', kitGenre.toLowerCase()],
        cover_art_url: coverArtUrl
      });

      clearInterval(interval);
      setPublishingProgress(100);
      
      setTimeout(() => {
        setIsPublishingKit(false);
        setKitTitle('');
        setKitDescription('');
        setKitFileName('');
        setKitFile(null);
        setKitCoverArt(null);
        setKitCoverArtFile(null);
        addToast('🎉 Admin Sample Kit published successfully!', 'success');
        // Refresh moderation lists
        adminService.getGlobalModerationList().then(m => setModerationList(m));
        loadAdminKits();
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsPublishingKit(false);
      addToast(err.message || 'Failed to upload admin kit.', 'error');
    }
  };

  const handleDeleteAdminKit = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the kit "${title}"?`)) return;
    try {
      await adminService.deleteAnyAsset(id, 'Pack');
      addToast(`Successfully deleted kit "${title}".`, 'success');
      loadAdminKits();
      // Also update global moderation list
      const m = await adminService.getGlobalModerationList();
      setModerationList(m);
    } catch (err) {
      addToast('Failed to delete kit.', 'error');
    }
  };

  // Calculations
  const geoAnalytics = adminService.getGeoAnalytics();
  const totalRevenue = geoAnalytics.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalDownloads = geoAnalytics.reduce((acc, curr) => acc + curr.downloads, 0);
  const creatorCount = users.filter(u => u.role === 'Seller').length;
  if (isLoading) {
    return (
      <div className="container main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || user.role !== 'Admin') {
    return (
      <div className="container main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🔒</div>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px', fontFamily: 'var(--font-outfit)', fontWeight: 700 }}>Access Denied</h2>
        <p className="body" style={{ color: 'var(--text-secondary)', maxWidth: '480px', marginBottom: '24px', lineHeight: 1.6 }}>
          This page is restricted to administrators. Please sign in with an administrator account to access the console.
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            Sign In as Admin
          </Link>
          <Link href="/" className="btn btn-secondary" style={{ padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container main-content admin-container">
      
      {/* Admin Notice Banner */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid var(--accent-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          color: 'var(--text-primary)',
          fontSize: '0.85rem',
          marginBottom: '28px'
        }}
      >
        <span>🛠️</span>
        <div>
          <strong>Evaluation Admin Console Access Enabled</strong> — Use this simulator dashboard to manage user accounts, flag sound uploads, and configure global localization parameters.
        </div>
      </div>

      {/* Header */}
      <header className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '6px' }}>Platform Admin Panel</h1>
          <p className="body-small" style={{ color: 'var(--text-muted)' }}>
            Monitor users, moderate uploads, and configure global localization parameters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Simulated Location:</span>
          <select 
            className="form-select" 
            style={{ width: '160px', padding: '8px 12px', fontSize: '0.85rem' }}
            value={selectedGeo}
            onChange={handleGeoChange}
          >
            <option value="US">🇺🇸 United States (USD)</option>
            <option value="GB">🇬🇧 United Kingdom (GBP)</option>
            <option value="DE">🇩🇪 Germany (EUR)</option>
            <option value="CA">🇨🇦 Canada (CAD)</option>
          </select>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Total Users</span>
          <div className="admin-stat-val">{users.length}</div>
          <div className="body-small" style={{ color: 'var(--success)', marginTop: '8px' }}>
            👥 {creatorCount} Sellers
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Global Downloads</span>
          <div className="admin-stat-val">{totalDownloads.toLocaleString()}</div>
          <div className="body-small" style={{ color: 'var(--accent-secondary)', marginTop: '8px' }}>
            🔥 Real-time traffic active
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Audited Sound Assets</span>
          <div className="admin-stat-val">{moderationList.length}</div>
          <div className="body-small" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            📁 Loops, One-shots & Kits
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="caption" style={{ color: 'var(--text-muted)' }}>Accumulated Revenue</span>
          <div className="admin-stat-val" style={{ color: 'var(--success)' }}>
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="body-small" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            💳 Mock checkout transactions
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav className="admin-tabs-nav" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <button 
          className={`admin-tab-btn ${activeTab === 'overview' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Geo Traffic & Overview
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'users' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 User Moderation ({users.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'sounds' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('sounds')}
        >
          📦 Asset Moderation ({moderationList.length})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'geo' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('geo')}
        >
          🌍 GEO localization settings
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'settings' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Store Settings
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'upload' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload Kit
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'orders' ? 'admin-tab-btn--active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          💰 Store Orders ({adminOrders.filter(o => o.status === 'pending').length})
        </button>
      </nav>

      {/* Tab Panels */}
      <section style={{ minHeight: '30vh', position: 'relative' }}>
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="grid-2col">
            
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Geographical Traffic Analytics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {geoAnalytics.map(g => (
                  <div key={g.country} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>{g.code === 'US' ? '🇺🇸' : g.code === 'GB' ? '🇬🇧' : g.code === 'DE' ? '🇩🇪' : g.code === 'CA' ? '🇨🇦' : g.code === 'JP' ? '🇯🇵' : '🌍'} <b>{g.country}</b></span>
                      <span style={{ color: 'var(--text-muted)' }}>{g.downloads.toLocaleString()} DLs (<b>{g.percentage}%</b>)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${g.percentage}%`, height: '100%', backgroundColor: 'var(--accent-primary)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem' }}>System Health</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }} className="body-small">
                <span style={{ color: 'var(--text-muted)' }}>Database Server</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Operational (Mock DB)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }} className="body-small">
                <span style={{ color: 'var(--text-muted)' }}>Audio Processing Node</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Active (Web Audio API)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }} className="body-small">
                <span style={{ color: 'var(--text-muted)' }}>Stripe Simulator Gateway</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>● Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }} className="body-small">
                <span style={{ color: 'var(--text-muted)' }}>AEO Search Engine Schema</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>● Structured Data Enabled</span>
              </div>
            </div>

          </div>
        )}

        {/* USER MODERATION PANEL */}
        {activeTab === 'users' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Suspension</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                        {u.role === 'Seller' ? 'Creator' : u.role === 'Buyer' ? 'Listener' : u.role}
                      </span>
                    </td>
                    <td>
                      {u.isVerified ? (
                        <span className="badge-status badge-status--verified">Verified Creator</span>
                      ) : (
                        <span className="badge-status badge-status--pending">Standard User</span>
                      )}
                    </td>
                    <td>
                      {u.isSuspended ? (
                        <span className="badge-status badge-status--suspended">Suspended</span>
                      ) : (
                        <span className="badge-status badge-status--verified">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {u.role === 'Seller' && (
                        <button 
                          className="btn btn-sm btn-ghost" 
                          style={{ border: '1px solid var(--border)', padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleToggleVerification(u.id, u.username)}
                        >
                          {u.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      )}
                      <button 
                        className="btn btn-sm" 
                        style={{ 
                          backgroundColor: u.isSuspended ? 'var(--success)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.isSuspended ? 'white' : 'var(--error)',
                          border: u.isSuspended ? 'none' : '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '4px 10px', 
                          fontSize: '0.75rem'
                        }}
                        onClick={() => handleToggleSuspension(u.id, u.username)}
                      >
                        {u.isSuspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ASSET MODERATION PANEL */}
        {activeTab === 'sounds' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Genre</th>
                  <th>Asset Type</th>
                  <th>Pricing</th>
                  <th>Mock Archive File</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {moderationList.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</td>
                    <td>{item.creator}</td>
                    <td>{item.genre}</td>
                    <td>
                      <span className="tag" style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px',
                        borderColor: item.type === 'Kit' || item.type === 'Pack' ? 'var(--accent-secondary)' : 'var(--border)'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.price > 0 ? `$${item.price.toFixed(2)}` : 'Free'}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{item.file}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-sm" 
                        style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--error)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '4px 10px', 
                          fontSize: '0.75rem'
                        }}
                        onClick={() => handleDeleteAsset(item.id, item.title, item.type)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* GEO SIMULATION PANEL */}
        {activeTab === 'geo' && (
          <div className="geo-simulator-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>GEO localization & Currency Simulator</h3>
            <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
              Use this simulation panel to change the platform's geographical localization. Depending on the selected country, pricing conversions, currency symbols, and exchange rates adapt in real-time across the website.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              <div className="geo-sim-row">
                <div>
                  <strong>Simulated Country Location</strong>
                  <p className="caption" style={{ color: 'var(--text-muted)' }}>Sets the simulated visitor location</p>
                </div>
                <select 
                  className="form-select" 
                  style={{ width: '220px' }}
                  value={selectedGeo}
                  onChange={handleGeoChange}
                >
                  <option value="US">🇺🇸 United States (USD - $)</option>
                  <option value="GB">🇬🇧 United Kingdom (GBP - £)</option>
                  <option value="DE">🇩🇪 Germany (EUR - €)</option>
                  <option value="CA">🇨🇦 Canada (CAD - C$)</option>
                </select>
              </div>

              <div className="geo-sim-row body-small">
                <span style={{ color: 'var(--text-muted)' }}>Base Currency Unit</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>USD ($)</span>
              </div>

              <div className="geo-sim-row body-small">
                <span style={{ color: 'var(--text-muted)' }}>Converted Local Currency Unit</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  {selectedGeo === 'US' ? 'USD ($)' : selectedGeo === 'GB' ? 'GBP (£)' : selectedGeo === 'DE' ? 'EUR (€)' : 'CAD (C$)'}
                </span>
              </div>

              <div className="geo-sim-row body-small">
                <span style={{ color: 'var(--text-muted)' }}>Simulated Exchange Rate</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedGeo === 'US' ? '1.00 USD' : selectedGeo === 'GB' ? '0.78 GBP' : selectedGeo === 'DE' ? '0.92 EUR' : '1.36 CAD'} per $1.00
                </span>
              </div>

            </div>

            <div style={{ marginTop: '24px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }} className="caption">
              ℹ️ Localized prices are calculated dynamically using: <code>localPrice = usdPrice * exchangeRate</code>. Visit a sound kit card or check user dashboards to verify.
            </div>
          </div>
        )}

        {/* ADMIN STORE SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Admin Store Profile Setup</h3>
            <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Configure your store branding and payment receiver destination.
            </p>

            <form onSubmit={handleSaveStoreProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Store name / Display Owner Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. SampleGoldmine Store"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Instagram Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>@</span>
                  <input
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '32px' }}
                    value={storeInstagram}
                    onChange={(e) => setStoreInstagram(e.target.value)}
                    placeholder="samplegoldmine_official"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment QR Image (eSewa / Khalti / Bank QR)</label>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div
                    style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-md)',
                      width: '120px',
                      height: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      backgroundColor: 'var(--bg-tertiary)',
                      flexShrink: 0
                    }}
                  >
                    {storeQrCode ? (
                      <img src={storeQrCode} alt="Store QR" style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'white' }} />
                    ) : (
                      <span style={{ fontSize: '2rem' }}>📤</span>
                    )}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <input type="file" accept="image/*" onChange={handleStoreQrUpload} className="form-input" style={{ padding: '8px' }} />
                    <p className="caption" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                      Upload your payment QR image. Buyers purchasing products owned by the store will scan this image to pay.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingStoreProfile}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px', background: 'var(--accent-gradient)', marginTop: '8px' }}
              >
                {isSavingStoreProfile ? 'Saving Store Setup...' : '💾 Save Admin Store Profile'}
              </button>
            </form>
          </div>
        )}

        {/* ADMIN UPLOAD KIT PANEL */}
        {activeTab === 'upload' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }} className="grid-2col">
            {/* Left Column: Form */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px', position: 'relative' }}>
              {isPublishingKit && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(10,10,12,0.92)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-lg)',
                    zIndex: 1000,
                    gap: '16px'
                  }}
                >
                  <div className="spinner"></div>
                  <h4 style={{ color: 'white' }}>Publishing sample kit to store...</h4>
                  <div style={{ width: '220px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${publishingProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.1s ease' }} />
                  </div>
                </div>
              )}

              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Publish New Sample Kit</h3>
              <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Upload and sell sample kits (packs) directly under your website owner brand.
              </p>

              <form onSubmit={handlePublishAdminKit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Kit Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Infinite Trap Sample Kit Vol 1"
                    className="form-input"
                    value={kitTitle}
                    onChange={(e) => setKitTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    placeholder="Details about content inside the zip archive..."
                    className="form-textarea"
                    value={kitDescription}
                    onChange={(e) => setKitDescription(e.target.value)}
                    style={{ minHeight: '80px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2col">
                  <div className="form-group">
                    <label className="form-label">Genre</label>
                    <select className="form-select" value={kitGenre} onChange={(e) => setKitGenre(e.target.value)}>
                      {['Hip-Hop', 'Electronic', 'Lo-Fi', 'Cinematic', 'Pop', 'R&B', 'Trap', 'Ambient', 'Jazz', 'Rock'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kit Price ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={kitPrice}
                      onChange={(e) => setKitPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Kit Archive (.zip / .rar) *</label>
                  <input
                    type="file"
                    accept=".zip,.rar"
                    className="form-input"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setKitFile(file);
                        setKitFileName(file.name);
                      }
                    }}
                    required
                  />
                  {kitFileName && (
                    <p className="caption" style={{ color: 'var(--success)', marginTop: '4px' }}>
                      ✓ Selected archive: <b>{kitFileName}</b>
                    </p>
                  )}
                </div>

                {/* Cover artwork */}
                <div className="form-group">
                  <label className="form-label">Cover Artwork</label>
                  <div 
                    className="cover-art-zone" 
                    onClick={() => kitCoverInputRef.current?.click()} 
                    style={{ 
                      border: '2px dashed var(--border)', 
                      borderRadius: 'var(--radius-md)', 
                      height: '140px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      overflow: 'hidden' 
                    }}
                  >
                    <input
                      type="file"
                      ref={kitCoverInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleKitCoverUpload}
                    />
                    {kitCoverArt ? (
                      <img src={kitCoverArt} alt="Artwork preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                        <span className="body-small">Upload Image</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPublishingKit || !kitTitle || !kitFileName}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', background: 'var(--accent-gradient)', marginTop: '8px' }}
                >
                  🚀 Publish Sample Kit
                </button>
              </form>
            </div>

            {/* Right Column: List of Published Kits */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Your Published Kits</h3>
              <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Manage or delete the sample packs and kits you have uploaded.
              </p>

              {adminKits.length === 0 ? (
                <div className="empty-state" style={{ minHeight: '220px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <span>💿</span>
                  <h4 style={{ margin: '8px 0 4px' }}>No kits published yet</h4>
                  <p className="body-small">Use the form on the left to upload your first sample kit.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto', paddingRight: '8px' }}>
                  {adminKits.map(kit => (
                    <div 
                      key={kit.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 'var(--radius-md)' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '50px', 
                          height: '50px', 
                          borderRadius: 'var(--radius-sm)', 
                          background: kit.cover_art_url ? `url(${getCoverArtUrl(kit.cover_art_url)}) center center / cover no-repeat` : 'var(--accent-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}>
                          {!kit.cover_art_url && '💿'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={kit.title}>
                            {kit.title}
                          </span>
                          <span className="caption" style={{ color: 'var(--text-muted)' }}>
                            {kit.genre} · ${kit.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-sm"
                        style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: 'var(--error)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          padding: '6px 12px',
                          fontSize: '0.75rem'
                        }}
                        onClick={() => handleDeleteAdminKit(kit.id, kit.title)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ADMIN STORE ORDERS PANEL */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Store Incoming Orders</h3>
            <p className="body-small" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Approve or reject transfer validation requests submitted by buyers purchasing admin store kits.
            </p>

            {adminOrders.length === 0 ? (
              <div className="empty-state" style={{ minHeight: '30vh' }}>
                <span>💰</span>
                <h3>No store orders found</h3>
                <p className="body-small">Orders made on Admin products will appear here for verification.</p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Buyer</th>
                      <th>Product Kit</th>
                      <th>Price</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Payment Proof</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminOrders.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.buyer_name}</td>
                        <td>{o.product_title}</td>
                        <td style={{ fontWeight: 700 }}>${o.product_price.toFixed(2)}</td>
                        <td>{o.payment_method}</td>
                        <td>
                          <span
                            className="badge-status"
                            style={{
                              backgroundColor: o.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : o.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                              color: o.status === 'approved' ? 'var(--success)' : o.status === 'rejected' ? 'var(--error)' : 'var(--warning)',
                              borderColor: 'transparent'
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td>
                          {o.payment_proof_url ? (
                            <button
                              onClick={() => setSelectedProofOrder(o)}
                              className="btn btn-sm btn-ghost"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid var(--border)', cursor: 'pointer' }}
                            >
                              🖼️ View Proof
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Proof</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {o.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-sm btn-primary"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', backgroundColor: 'var(--success)', border: 'none' }}
                                onClick={() => handleAdminOrderAction(o.id, 'approved', o.buyer_name)}
                              >
                                Approve
                              </button>
                              <button
                                className="btn btn-sm btn-ghost"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--error)', color: 'var(--error)' }}
                                onClick={() => handleAdminOrderAction(o.id, 'rejected', o.buyer_name)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Completed</span>
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

      </section>

      {/* Admin View Proof Modal */}
      {selectedProofOrder && (
        <Modal
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          title={`🔍 Verify Store Payment - ${selectedProofOrder.buyer_name}`}
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
                      handleAdminOrderAction(selectedProofOrder.id, 'rejected', selectedProofOrder.buyer_name);
                      setSelectedProofOrder(null);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--error)', color: 'var(--error)', padding: '8px 16px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleAdminOrderAction(selectedProofOrder.id, 'approved', selectedProofOrder.buyer_name);
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
