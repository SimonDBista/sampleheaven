"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { mockCreators, mockSamples, mockPacks } from '../../../data/mockData';
import { authService, profileService, productService, interactionService, SellerProfile, User, Product, getCoverArtUrl, supabaseUrl, isRealSupabaseConfigured } from '../../../lib/supabase';
import { useToast } from '../../../context/ToastContext';
import SampleCard from '../../../components/SampleCard';
import PackCard from '../../../components/PackCard';
import '../../../styles/pages/profile.css';

export default function CreatorProfile() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  const { addToast } = useToast();

  const [creatorProfile, setCreatorProfile] = useState<SellerProfile | null>(null);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  
  const [activeTab, setActiveTab] = useState<'samples' | 'packs' | 'favorites' | 'about'>('samples');
  
  // Mapped list states
  const [uploadedSamples, setUploadedSamples] = useState<any[]>([]);
  const [creatorPacks, setCreatorPacks] = useState<any[]>([]);
  const [favoriteSamples, setFavoriteSamples] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreatorData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Creator and Seller profile
        const { profile, user } = await profileService.getSellerProfileByUsername(username);
        setCreatorProfile(profile);
        setCreatorUser(user);

        // Fallback follower count
        const seedCreator = mockCreators.find(c => c.username.toLowerCase() === username.toLowerCase());
        setFollowers(seedCreator?.followersCount || 120);

        // 2. Fetch products
        let sellerProducts: Product[] = [];
        if (user) {
          sellerProducts = await productService.getSellerProducts(user.id);
        }

        // Map Beats and One-Shots to SampleCard structure
        const samplesMapped = sellerProducts
          .filter(p => p.type === 'Beat' || p.type === 'One-Shot')
          .map(p => ({
            id: p.id,
            title: p.title,
            creator: p.seller_name,
            type: p.type === 'Beat' ? 'Loop' : 'One-Shot',
            genre: p.genre,
            bpm: p.bpm || null,
            key: p.scale_key || null,
            format: 'WAV',
            downloads: 0,
            duration: '0:02',
            fileSize: '1.5 MB',
            coverArt: getCoverArtUrl(p.cover_art_url)
          }));

        // Seed data fallbacks if empty to keep page looking filled
        const seedSamples = mockSamples.filter(s => s.creator.toLowerCase() === username.toLowerCase());
        setUploadedSamples([...samplesMapped, ...seedSamples]);

        // Map Packs to PackCard structure
        const packsMapped = sellerProducts
          .filter(p => p.type === 'Pack')
          .map(p => ({
            id: p.id,
            title: p.title,
            creator: p.seller_name,
            samplesCount: 24,
            downloadsCount: 0,
            genre: p.genre,
            description: p.description,
            price: p.price,
            coverArt: getCoverArtUrl(p.cover_art_url),
            fileUrl: isRealSupabaseConfigured && p.file_url
              ? `${supabaseUrl}/storage/v1/object/public/samples/${p.seller_id}/${encodeURIComponent(p.file_url)}`
              : undefined
          }));
        
        const seedPacks = mockPacks.filter(p => p.creator.toLowerCase() === username.toLowerCase());
        setCreatorPacks([...packsMapped, ...seedPacks]);

        // 3. Fetch Favorites
        const likedIds = interactionService.getLikedIds();
        setFavoriteSamples(mockSamples.filter(s => likedIds.includes(s.id)));

        // 4. Followed status
        setIsFollowing(interactionService.getFollowedCreators().includes(username));
      } catch (err) {
        console.error("Failed to load creator profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [username]);

  const handleFollowToggle = () => {
    const following = interactionService.toggleFollow(username);
    setIsFollowing(following);
    setFollowers(prev => following ? prev + 1 : prev - 1);
    addToast(following ? `You are now following ${username}` : `Unfollowed ${username}`, 'success');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Profile link copied to clipboard!', 'success');
  };

  if (loading) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const bioText = creatorProfile?.instagram_username
    ? `Welcome to my profile. Check out my exclusive loops, samples, and beats. For custom work or direct support, message me on Instagram @${creatorProfile.instagram_username}!`
    : `Sound designer and music collaborator building custom sound assets and high-quality kits on SampleGoldmine.`;

  return (
    <div className="container main-content">
      {/* AEO Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            "name": creatorProfile?.display_name || username,
            "description": bioText,
            "url": `http://localhost:3000/creator/${encodeURIComponent(username)}`,
            "genre": "Hip-Hop, Trap, Lo-Fi, Electronic"
          })
        }}
      />
      
      {/* 1. Header Banner */}
      <section className="profile-header">
        <div className="profile-header-glow" />
        <div className="profile-identity">
          
          {/* Large Avatar */}
          <div className="profile-avatar-large">
            {creatorProfile?.profile_picture_url ? (
              <img 
                src={creatorProfile.profile_picture_url} 
                alt="Profile Pic" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              (creatorProfile?.display_name || username).charAt(0).toUpperCase()
            )}
          </div>

          {/* Identity details */}
          <div className="profile-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '2.25rem' }}>{creatorProfile?.display_name || username}</h1>
              <span className="tag tag-accent">👑 PRO SELLER</span>
            </div>
            
            <p className="body-small" style={{ marginTop: '8px', maxWidth: '600px', lineHeight: 1.5 }}>
              {bioText}
            </p>

            {/* Stats row */}
            <div className="caption" style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.85rem' }}>
              🔊 <b>{uploadedSamples.length}</b> Samples · 💿 <b>{creatorPacks.length}</b> Packs · 👤 <b>{followers.toLocaleString()}</b> Followers
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="profile-actions-row">
          <button
            onClick={handleFollowToggle}
            className={`btn ${isFollowing ? 'btn-primary' : 'btn-secondary'}`}
          >
            {isFollowing ? 'Following ✓' : 'Follow Creator'}
          </button>
          
          <button onClick={handleShare} className="btn btn-ghost" style={{ border: '1px solid var(--border)' }}>
            🔗 Share Profile
          </button>
          
          {creatorProfile?.instagram_username && (
            <a
              href={`https://instagram.com/${creatorProfile.instagram_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
            >
              📸 Instagram
            </a>
          )}
        </div>
      </section>

      {/* 2. Tabs system navigation */}
      <div className="profile-tabs-bar">
        <button
          className={`profile-tab ${activeTab === 'samples' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('samples')}
        >
          Sounds ({uploadedSamples.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'packs' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('packs')}
        >
          Sample Packs ({creatorPacks.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'favorites' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favoriteSamples.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'about' ? 'profile-tab--active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      {/* 3. Tab content display */}
      <section style={{ paddingBottom: '40px' }}>
        
        {/* SAMPLES TAB */}
        {activeTab === 'samples' && (
          uploadedSamples.length === 0 ? (
            <div className="empty-state">
              <span>🏜️</span>
              <h4>No samples uploaded yet</h4>
              <p className="body-small">This creator hasn't published any individual loops or one-shots.</p>
            </div>
          ) : (
            <div className="grid-cards">
              {uploadedSamples.map((sample) => (
                <SampleCard sample={sample} key={sample.id} />
              ))}
            </div>
          )
        )}

        {/* PACKS TAB */}
        {activeTab === 'packs' && (
          creatorPacks.length === 0 ? (
            <div className="empty-state">
              <span>🏜️</span>
              <h4>No sample packs yet</h4>
              <p className="body-small">This creator hasn't compiled any curated sample packs.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              {creatorPacks.map((pack) => (
                <PackCard pack={pack} key={pack.id} />
              ))}
            </div>
          )
        )}

        {/* FAVORITES TAB */}
        {activeTab === 'favorites' && (
          favoriteSamples.length === 0 ? (
            <div className="empty-state">
              <span>❤️</span>
              <h4>No favorites selected</h4>
              <p className="body-small">Click the heart button on browse cards to save favorite loops here.</p>
            </div>
          ) : (
            <div className="grid-cards">
              {favoriteSamples.map((sample) => (
                <SampleCard sample={sample} key={sample.id} />
              ))}
            </div>
          )
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Biography</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Sound designer and music collaborator building custom sound assets and high-quality kits on SampleGoldmine. I specialize in crafting pristine drum grooves, detuned keyboard progressions, and warm analog basslines.
              </p>
            </div>

            {creatorProfile?.instagram_username && (
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Instagram Contact</h3>
                <p className="body-small">
                  Contact me directly at <a href={`https://instagram.com/${creatorProfile.instagram_username}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)' }}>@{creatorProfile.instagram_username}</a> for beats custom requests or licensing questions.
                </p>
              </div>
            )}

            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Collaborative Terms</h3>
              <p className="body-small" style={{ color: 'var(--text-muted)' }}>
                Open to co-production, custom sound design requests, and remixing. Please message directly with brief descriptions of your projects and scheduling timelines.
              </p>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
