"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mockSamples, mockPacks, mockCreators, Sample, Pack, Creator } from '../data/mockData';

interface SearchBarProps {
  heroVariant?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ heroVariant = false }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<{
    samples: Sample[];
    packs: Pack[];
    creators: Creator[];
  }>({ samples: [], packs: [], creators: [] });
  
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter mock data based on search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ samples: [], packs: [], creators: [] });
      return;
    }

    const q = query.toLowerCase();

    const filteredSamples = mockSamples
      .filter(s => s.title.toLowerCase().includes(q) || s.genre.toLowerCase().includes(q))
      .slice(0, 4);

    const filteredPacks = mockPacks
      .filter(p => p.title.toLowerCase().includes(q) || p.genre.toLowerCase().includes(q))
      .slice(0, 2);

    const filteredCreators = mockCreators
      .filter(c => c.username.toLowerCase().includes(q))
      .slice(0, 2);

    setResults({
      samples: filteredSamples,
      packs: filteredPacks,
      creators: filteredCreators
    });
    setSelectedIndex(-1);
  }, [query]);

  // Combine items to list them for keyboard navigation
  const getFlatList = () => {
    const list: { type: 'sample' | 'pack' | 'creator'; id: string; name: string; url: string }[] = [];
    results.samples.forEach(s => list.push({ type: 'sample', id: s.id, name: s.title, url: `/sample/${s.id}` }));
    results.packs.forEach(p => list.push({ type: 'pack', id: p.id, name: p.title, url: `/pricing` }));
    results.creators.forEach(c => list.push({ type: 'creator', id: c.username, name: c.username, url: `/creator/${c.username}` }));
    return list;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const flatList = getFlatList();
    if (flatList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatList.length) % flatList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatList.length) {
        const item = flatList[selectedIndex];
        router.push(item.url);
        setIsOpen(false);
      } else {
        router.push(`/browse?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasResults = results.samples.length > 0 || results.packs.length > 0 || results.creators.length > 0;

  return (
    <div
      ref={containerRef}
      className="search-container"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: heroVariant ? '680px' : '360px',
        margin: heroVariant ? '0 auto' : '0'
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search samples, loops, creators..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            height: heroVariant ? '56px' : '44px',
            borderRadius: 'var(--radius-full)',
            paddingLeft: '48px',
            paddingRight: '16px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            fontSize: heroVariant ? '1.05rem' : '0.875rem'
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: '18px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            fontSize: '1.1rem',
            pointerEvents: 'none'
          }}
        >
          🔍
        </span>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults({ samples: [], packs: [], creators: [] });
            }}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && hasResults && (
        <div
          className="search-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1100,
            overflow: 'hidden',
            padding: '8px 0'
          }}
        >
          {/* Samples Section */}
          {results.samples.length > 0 && (
            <div>
              <div style={{ padding: '6px 16px', fontSize: '0.75rem', color: 'var(--accent-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Samples
              </div>
              {results.samples.map((sample, idx) => {
                const globalIdx = idx;
                const isSelected = selectedIndex === globalIdx;
                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      router.push(`/sample/${sample.id}`);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sample.title}</span>
                      <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: 'var(--text-muted)' }}>by {sample.creator}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }} className="tag">
                      {sample.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Packs Section */}
          {results.packs.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
              <div style={{ padding: '6px 16px', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sample Packs
              </div>
              {results.packs.map((pack, idx) => {
                const globalIdx = results.samples.length + idx;
                const isSelected = selectedIndex === globalIdx;
                return (
                  <div
                    key={pack.id}
                    onClick={() => {
                      router.push(`/pricing`);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pack.title}</span>
                    <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: 'var(--text-muted)' }}>{pack.samplesCount} loops · {pack.genre}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Creators Section */}
          {results.creators.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
              <div style={{ padding: '6px 16px', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Creators
              </div>
              {results.creators.map((creator, idx) => {
                const globalIdx = results.samples.length + results.packs.length + idx;
                const isSelected = selectedIndex === globalIdx;
                return (
                  <div
                    key={creator.username}
                    onClick={() => {
                      router.push(`/creator/${creator.username}`);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{creator.username}</span>
                    <span style={{ fontSize: '0.75rem', marginLeft: '8px', color: 'var(--text-muted)' }}>{creator.samplesCount} samples · {creator.followersCount} followers</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

