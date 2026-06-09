"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { mockSamples, Sample } from '../../data/mockData';
import { interactionService } from '../../lib/supabase';
import SampleCard from '../../components/SampleCard';

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<'downloads' | 'bookmarks'>('downloads');
  const [query, setQuery] = useState('');
  
  const [downloadedSamples, setDownloadedSamples] = useState<Sample[]>([]);
  const [bookmarkedSamples, setBookmarkedSamples] = useState<Sample[]>([]);

  // Load user dynamic data
  useEffect(() => {
    const downloadedIds = interactionService.getDownloadedIds();
    const likedIds = interactionService.getLikedIds();

    // Map mock samples matching these IDs
    const downloads = mockSamples.filter(s => downloadedIds.includes(s.id));
    const bookmarks = mockSamples.filter(s => likedIds.includes(s.id));

    setDownloadedSamples(downloads);
    setBookmarkedSamples(bookmarks);
  }, []);

  const getFilteredList = () => {
    const list = activeTab === 'downloads' ? downloadedSamples : bookmarkedSamples;
    if (!query.trim()) return list;
    return list.filter(
      s => s.title.toLowerCase().includes(query.toLowerCase()) || 
           s.creator.toLowerCase().includes(query.toLowerCase())
    );
  };

  const visibleList = getFilteredList();

  return (
    <div className="container main-content">
      
      {/* Title */}
      <div style={{ marginTop: '20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>My Library</h1>
        <p className="body-small">
          Access your saved waveforms and download history.
        </p>
      </div>

      {/* Toolbar: Tabs & Search */}
      <div
        className="browse-toolbar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`btn btn-sm ${activeTab === 'downloads' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            📥 Downloads ({downloadedSamples.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`btn btn-sm ${activeTab === 'bookmarks' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            🤍 Bookmarks ({bookmarkedSamples.length})
          </button>
        </div>

        {/* Local library filter */}
        <div style={{ position: 'relative', width: '240px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Search my library..."
            className="form-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ height: '36px', borderRadius: 'var(--radius-md)', paddingLeft: '32px' }}
          />
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>🔍</span>
        </div>
      </div>

      {/* Grid of Cards */}
      {visibleList.length === 0 ? (
        <div className="empty-state" style={{ minHeight: '35vh' }}>
          <span className="empty-state-icon">📂</span>
          <h3>Your {activeTab} list is empty</h3>
          <p className="body-small" style={{ maxWidth: '300px' }}>
            {activeTab === 'downloads'
              ? 'Find and download sounds from the explore catalog to build your history.'
              : 'Save loops or one-shots by hitting the heart icon on any card.'}
          </p>
          <Link href="/browse" className="btn btn-primary btn-sm">
            Explore Audio Library
          </Link>
        </div>
      ) : (
        <div className="grid-cards" style={{ paddingBottom: '40px' }}>
          {visibleList.map((sample) => (
            <SampleCard sample={sample} key={sample.id} />
          ))}
        </div>
      )}

    </div>
  );
}
