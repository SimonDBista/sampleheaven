"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockSamples, Sample } from '../../data/mockData';
import { useAudio } from '../../context/AudioContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { interactionService, productService, supabaseUrl, isRealSupabaseConfigured, getCoverArtUrl } from '../../lib/supabase';
import SampleCard from '../../components/SampleCard';
import '../../styles/pages/browse.css';

// Separate Client Component that reads search parameters
const BrowseContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentSample, isPlaying, togglePlay } = useAudio();
  const { addToast } = useToast();

  // Search parameters
  const initialGenre = searchParams.get('genre') || '';
  const initialType = searchParams.get('type') || '';
  const initialQuery = searchParams.get('q') || '';

  const { user: currentUser } = useAuth();
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  // States
  const [query, setQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [allSamplesList, setAllSamplesList] = useState<Sample[]>([]);

  // Filter States
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialType ? [initialType] : []);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenre ? [initialGenre] : []);
  const [maxBpm, setMaxBpm] = useState<number>(200);
  const [selectedKey, setSelectedKey] = useState<string>('All');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [licenseType, setLicenseType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Newest');

  // Load likes, purchases & dynamic products list
  useEffect(() => {
    setLikedIds(interactionService.getLikedIds());
    setPurchasedIds(interactionService.getPurchasedKitIds());
    setPendingIds(interactionService.getPendingKitIds());
    
    const loadDynamicProducts = async () => {
      try {
        const dbProducts = await productService.getProducts();
        const mapped: Sample[] = dbProducts.map(p => {
          let duration = '0:05';
          let fileSize = '4.5 MB';
          let format = 'WAV';

          if (p.type === 'Beat') {
            duration = '3:15';
            fileSize = '7.8 MB';
          } else if (p.type === 'Pack') {
            duration = 'Pack';
            fileSize = '45 MB';
            format = 'ZIP';
          } else if (p.type === 'One-Shot') {
            duration = '0:02';
            fileSize = '1.1 MB';
          } else if (p.type === 'Loop') {
            duration = '0:08';
            fileSize = '3.5 MB';
          }

          const audioUrl = isRealSupabaseConfigured && p.file_url
            ? `${supabaseUrl}/storage/v1/object/public/samples/${p.seller_id}/${encodeURIComponent(p.file_url)}`
            : undefined;

          return {
            id: p.id,
            title: p.title,
            creator: p.seller_name,
            type: p.type as any,
            genre: p.genre,
            bpm: p.bpm || null,
            key: p.scale_key || null,
            format,
            downloads: p.downloads || 0,
            duration,
            fileSize,
            audioUrl,
            coverArt: getCoverArtUrl(p.cover_art_url),
            price: p.price
          };
        });
        
        const combined = [...mapped];
        mockSamples.forEach(ms => {
          if (!combined.some(c => c.id === ms.id || c.title.toLowerCase() === ms.title.toLowerCase())) {
            combined.push(ms);
          }
        });
        setAllSamplesList(combined);
      } catch (err) {
        console.error("Failed to merge products:", err);
        setAllSamplesList(mockSamples);
      }
    };
    loadDynamicProducts();
  }, [currentUser?.id]);

  // Update states if URL parameters change
  useEffect(() => {
    if (initialGenre) setSelectedGenres([initialGenre]);
    if (initialType) setSelectedTypes([initialType]);
    if (initialQuery) setQuery(initialQuery);
  }, [initialGenre, initialType, initialQuery]);

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedGenres([]);
    setMaxBpm(200);
    setSelectedKey('All');
    setSelectedFormats([]);
    setLicenseType('All');
    setSortBy('Newest');
    setQuery('');
    router.replace('/browse');
  };

  const handleLike = (e: React.MouseEvent, sampleId: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    const liked = interactionService.toggleLike(sampleId);
    setLikedIds(interactionService.getLikedIds());
    addToast(liked ? `Saved "${title}" to library!` : `Removed "${title}" from library`, 'info');
  };

  const handleDownload = (e: React.MouseEvent, sample: Sample) => {
    e.stopPropagation();
    e.preventDefault();

    const price = sample.price || 0;
    const isOwner = currentUser?.username === sample.creator;
    const isUnlocked = price === 0 || isOwner || purchasedIds.includes(sample.id);
    const isPending = pendingIds.includes(sample.id);

    if (isPending) {
      addToast('Your payment notice is currently pending verification from the seller/admin.', 'info');
      return;
    }

    if (!isUnlocked) {
      addToast(`Please purchase "${sample.title}" to download it.`, 'info');
      router.push(`/sample/${sample.id}`);
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

  // 1. FILTER FUNCTION
  const filteredSamples = allSamplesList.filter((sample) => {
    // A. Query text match
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchTitle = sample.title.toLowerCase().includes(q);
      const matchCreator = sample.creator.toLowerCase().includes(q);
      const matchGenre = sample.genre.toLowerCase().includes(q);
      const matchType = sample.type.toLowerCase().includes(q);
      if (!matchTitle && !matchCreator && !matchGenre && !matchType) return false;
    }

    // B. Type matches
    if (selectedTypes.length > 0 && !selectedTypes.includes(sample.type)) {
      return false;
    }

    // C. Genre matches
    if (selectedGenres.length > 0 && !selectedGenres.includes(sample.genre)) {
      return false;
    }

    // D. BPM range match
    if (sample.bpm && sample.bpm > maxBpm) {
      return false;
    }

    // E. Key scale match
    if (selectedKey !== 'All') {
      if (sample.key !== selectedKey) return false;
    }

    // F. Format match
    if (selectedFormats.length > 0 && !selectedFormats.includes(sample.format)) {
      return false;
    }

    // G. License match
    if (licenseType !== 'All') {
      const isFree = sample.downloads > 8000; // mock license differentiator
      if (licenseType === 'Free' && !isFree) return false;
      if (licenseType === 'Premium' && isFree) return false;
    }

    return true;
  });

  // 2. SORT FUNCTION
  const sortedSamples = [...filteredSamples].sort((a, b) => {
    if (sortBy === 'Most Downloaded') {
      return b.downloads - a.downloads;
    }
    if (sortBy === 'Trending') {
      return b.downloads * Math.random() - a.downloads * Math.random(); // mock trend index
    }
    // Default: Newest (arbitrary by ID sorting)
    return b.id.localeCompare(a.id);
  });

  const availableKeys = ['C', 'Dm', 'Gm', 'Eb', 'Ab', 'F', 'Am', 'Bb', 'Cm', 'G', 'Em'];

  const filterSidebarElement = (
    <>
      {/* Types collapsible section */}
      <div className="filter-section">
        <h4 className="filter-title">Sample Type</h4>
        <div className="filter-options">
          {['Loop', 'One-Shot', 'SFX', 'MIDI', 'Beat', 'Pack'].map(type => (
            <label key={type} className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
              />
              {type === 'Beat' ? 'Beats' : type === 'Pack' ? 'Sample Kits' : `${type}s`}
            </label>
          ))}
        </div>
      </div>

      {/* Genres Section */}
      <div className="filter-section">
        <h4 className="filter-title">Genres</h4>
        <div className="filter-options">
          {['Hip-Hop', 'Electronic', 'Lo-Fi', 'Cinematic', 'Pop', 'R&B', 'Trap', 'Ambient', 'Jazz', 'Rock'].map(genre => (
            <label key={genre} className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreChange(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
      </div>

      {/* BPM Section */}
      <div className="filter-section">
        <h4 className="filter-title">BPM Range</h4>
        <div className="range-slider-container">
          <div className="range-slider-values">
            <span>60 BPM</span>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>Max: {maxBpm} BPM</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            step="5"
            value={maxBpm}
            onChange={(e) => setMaxBpm(parseInt(e.target.value))}
            className="dual-slider"
          />
        </div>
      </div>

      {/* Keys Section */}
      <div className="filter-section">
        <h4 className="filter-title">Musical Key</h4>
        <select
          className="form-select"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          style={{ height: '40px', padding: '0 12px' }}
        >
          <option value="All">All Keys</option>
          {availableKeys.map(k => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>

      {/* Format Section */}
      <div className="filter-section">
        <h4 className="filter-title">Format</h4>
        <div className="filter-options">
          {['WAV', 'MP3', 'MIDI', 'FLAC'].map(format => (
            <label key={format} className="form-checkbox-label">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={selectedFormats.includes(format)}
                onChange={() => handleFormatChange(format)}
              />
              {format}
            </label>
          ))}
        </div>
      </div>

      {/* License Section */}
      <div className="filter-section">
        <h4 className="filter-title">License Tier</h4>
        <div className="filter-options">
          {['All', 'Free', 'Premium'].map(type => (
            <label key={type} className="form-checkbox-label" style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="license"
                className="form-checkbox"
                style={{ borderRadius: 'var(--radius-full)' }}
                checked={licenseType === type}
                onChange={() => setLicenseType(type)}
              />
              {type === 'All' ? 'All Licenses' : type}
            </label>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <button onClick={handleResetFilters} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
        Reset Filters
      </button>
    </>
  );

  return (
    <div className="container main-content">
      {/* Top Banner details */}
      <div style={{ marginTop: '20px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Explore Sounds</h1>
        <p className="body-small">
          Search and filter the library. Click play to listen.
        </p>
      </div>

      {/* Mobile drawer and quick buttons */}
      <div className="mobile-filter-bar">
        <button
          onClick={() => setShowMobileDrawer(true)}
          className="btn btn-secondary btn-sm"
          style={{ flexGrow: 1 }}
        >
          ⚙️ Filter Parameters
        </button>
        <button onClick={handleResetFilters} className="btn btn-ghost btn-sm">
          Reset
        </button>
      </div>

      {/* Layout wrapper */}
      <div className="browse-layout">
        
        {/* Left Side: Desktop Sidebar Filters */}
        <aside className="filter-sidebar">
          {filterSidebarElement}
        </aside>

        {/* Right Side: Main Content */}
        <div className="browse-content">
          
          {/* Main Toolbar */}
          <div className="browse-toolbar">
            
            {/* Inline search box */}
            <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
              <input
                type="text"
                placeholder="Filter results..."
                className="form-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ height: '38px', borderRadius: 'var(--radius-md)', paddingLeft: '32px' }}
              />
              <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {sortedSamples.length} matches
              </span>

              {/* Sort by select */}
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '36px', padding: '0 12px', minWidth: '150px' }}
              >
                <option value="Newest">Newest</option>
                <option value="Most Downloaded">Most Popular</option>
                <option value="Trending">Trending</option>
              </select>

              {/* View Mode Toggle */}
              <div className="view-toggles">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  田
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          {/* Results Area */}
          {sortedSamples.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🏜️</span>
              <h3>No samples match your filters</h3>
              <p className="body-small">
                Try loosening your parameters or typing a different query.
              </p>
              <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
                View All Samples
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid-cards">
              {sortedSamples.map((sample) => (
                <SampleCard sample={sample} key={sample.id} />
              ))}
            </div>
          ) : (
            /* List View */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sortedSamples.map((sample) => {
                const isCurrent = currentSample?.id === sample.id;
                const isCurrentlyPlaying = isCurrent && isPlaying;
                const liked = likedIds.includes(sample.id);

                return (
                  <div
                    key={sample.id}
                    className={`sample-list-row ${isCurrentlyPlaying ? 'sample-list-row--playing' : ''}`}
                    onClick={() => router.push(`/sample/${sample.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Play & Title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '35%', overflow: 'hidden' }}>
                      {sample.type === 'Pack' || sample.type === 'Kit' ? (
                        <span style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'var(--text-muted)' }}>
                          📦
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(sample);
                          }}
                          className="list-play-btn"
                          aria-label="Play"
                        >
                          {isCurrentlyPlaying ? '⏸' : '▶'}
                        </button>
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sample.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {sample.creator}
                        </div>
                      </div>
                    </div>

                    {/* Metadata tags */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '40%' }}>
                      <span className="tag">{sample.type}</span>
                      <span className="tag">{sample.genre}</span>
                      {sample.bpm && <span className="tag">{sample.bpm} BPM</span>}
                      {sample.key && <span className="tag">{sample.key}</span>}
                    </div>

                    {/* Action controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '20%', justifyContent: 'flex-end' }}>
                      <span className="caption" style={{ color: 'var(--text-muted)' }}>
                        📥 {sample.downloads.toLocaleString()}
                      </span>
                      <button
                        onClick={(e) => handleLike(e, sample.id, sample.title)}
                        style={{ color: liked ? 'var(--error)' : 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer' }}
                      >
                        {liked ? '❤️' : '🤍'}
                      </button>
                      {(() => {
                        const price = sample.price || 0;
                        const isOwner = currentUser?.username === sample.creator;
                        const isUnlocked = price === 0 || isOwner || purchasedIds.includes(sample.id);
                        const isPending = pendingIds.includes(sample.id);

                        return (
                          <button
                            onClick={(e) => handleDownload(e, sample)}
                            disabled={isPending}
                            className="btn btn-sm btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              background: isPending ? 'var(--bg-secondary)' : (!isUnlocked ? 'var(--accent-gradient)' : 'var(--bg-tertiary)'),
                              color: isPending ? 'var(--text-muted)' : (!isUnlocked ? 'white' : 'var(--text-primary)'),
                              border: isPending ? '1px solid var(--border)' : (!isUnlocked ? 'none' : '1px solid var(--border)'),
                              cursor: isPending ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {isUnlocked ? 'Download' : (isPending ? 'Pending' : `Buy ($${price.toFixed(2)})`)}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile slide-in filter drawer */}
      {showMobileDrawer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10002,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              width: '85%',
              maxWidth: '340px',
              backgroundColor: 'var(--bg-secondary)',
              height: '100%',
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
              <h3>Filter Options</h3>
              <button
                onClick={() => setShowMobileDrawer(false)}
                style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            
            {filterSidebarElement}
            
            <button
              onClick={() => setShowMobileDrawer(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'auto' }}
            >
              Apply Filter Parameters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Browse() {
  return (
    <Suspense fallback={
      <div className="container main-content flex-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
