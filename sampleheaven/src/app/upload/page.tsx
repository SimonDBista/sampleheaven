"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { authService, productService, User, supabase, isRealSupabaseConfigured } from '../../lib/supabase';
import '../../styles/pages/upload.css';

export default function UploadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Authentication State
  const { user, isLoading: authLoading } = useAuth();

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productType, setProductType] = useState<'Beat' | 'Pack' | 'One-Shot'>('Beat');
  const [price, setPrice] = useState<string>('0.00');
  const [files, setFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Trap');
  const [bpm, setBpm] = useState('140');
  const [scaleKey, setScaleKey] = useState('C');
  const [tags, setTags] = useState<string[]>(['drums', '808', 'hard']);
  const [tagInput, setTagInput] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check auth and user role on mount
  useEffect(() => {
    // Load Draft from LocalStorage if exists
    const draft = localStorage.getItem('samplegoldmine_upload_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setTitle(data.title || '');
        setDescription(data.description || '');
        setProductType(data.productType || 'Beat');
        setSelectedGenre(data.selectedGenre || 'Trap');
        setBpm(data.bpm || '140');
        setScaleKey(data.scaleKey || 'C');
        setTags(data.tags || ['drums']);
        setPrice(data.price || '0.00');
      } catch (e) {
        console.error('Error parsing draft:', e);
      }
    }
  }, []);

  // Save Draft to LocalStorage automatically
  useEffect(() => {
    if (title || description) {
      const draft = { title, description, productType, selectedGenre, bpm, scaleKey, tags, price };
      localStorage.setItem('samplegoldmine_upload_draft', JSON.stringify(draft));
    }
  }, [title, description, productType, selectedGenre, bpm, scaleKey, tags, price]);

  // Adjust price when product type changes
  useEffect(() => {
    if (productType === 'One-Shot') {
      setPrice('0.00');
    }
  }, [productType]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFilesAdded = (fileList: FileList) => {
    const allowedExtensions = productType === 'Pack'
      ? ['ZIP', 'RAR']
      : ['WAV', 'MP3', 'FLAC', 'AIFF', 'MID', 'MIDI'];

    const newFiles: { name: string; size: string; type: string }[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      
      if (!allowedExtensions.includes(ext)) {
        addToast(`Invalid file type. Please upload ${productType === 'Pack' ? 'compressed archives (.zip, .rar)' : 'audio files (WAV, MP3, etc.)'} for this product type.`, 'error');
        return;
      }
      
      newFiles.push({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: ext
      });
    }

    // Lock to 1 file upload
    setSelectedFile(fileList[0]);
    setFiles(newFiles.slice(0, 1));
    if (newFiles[0] && !title) {
      const baseName = newFiles[0].name.split('.').slice(0, -1).join('.');
      setTitle(baseName.replace(/[-_]/g, ' '));
    }
    
    addToast(`File "${newFiles[0].name}" added successfully.`, 'info');
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setSelectedFile(null);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags(prev => [...prev, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverArtFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverArt(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'Seller') {
      addToast('Only Sellers are authorized to publish products.', 'error');
      return;
    }
    if (files.length === 0) {
      addToast('Please upload a product file.', 'error');
      return;
    }
    if (!title.trim()) {
      addToast('Title is required.', 'error');
      return;
    }
    if (productType === 'One-Shot' && parseFloat(price) > 0) {
      addToast('One-Shot sounds must be offered for free (0.00) only.', 'error');
      return;
    }
    if (!hasAgreed) {
      addToast('You must confirm ownership rights to upload.', 'error');
      return;
    }

    setIsPublishing(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    try {
      const productPrice = productType === 'One-Shot' ? 0 : parseFloat(price) || 0;
      
      let finalFileUrl = files[0].name;
      let coverArtUrl = '';
      
      if (isRealSupabaseConfigured && supabase && user) {
        // 1. Upload Product Audio File
        if (selectedFile) {
          const filePath = `${user.id}/${selectedFile.name}`;
          const { error: storageError } = await supabase.storage
            .from('samples')
            .upload(filePath, selectedFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (storageError) {
            throw new Error(`File upload failed: ${storageError.message}`);
          }
          finalFileUrl = selectedFile.name;
        }

        // 2. Upload Cover Art Image
        if (coverArtFile) {
          const coverPath = `${user.id}/cover_${Date.now()}_${coverArtFile.name}`;
          const { error: coverError } = await supabase.storage
            .from('samples')
            .upload(coverPath, coverArtFile, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (coverError) {
            console.error("Cover image upload failed:", coverError);
          } else {
            coverArtUrl = coverPath;
          }
        }
      } else {
        // Offline / Mock fallback
        if (coverArt) {
          coverArtUrl = coverArt;
        }
      }

      await productService.uploadProduct({
        seller_id: user.id,
        title,
        description,
        type: productType,
        genre: selectedGenre,
        price: productPrice,
        file_url: finalFileUrl,
        tags,
        bpm: productType !== 'Pack' && bpm ? parseInt(bpm) : null,
        scale_key: productType !== 'Pack' && scaleKey ? scaleKey : null,
        cover_art_url: coverArtUrl
      });

      clearInterval(interval);
      setUploadProgress(100);
      localStorage.removeItem('samplegoldmine_upload_draft');
      
      setTimeout(() => {
        setIsPublishing(false);
        addToast('🎉 Product published successfully to the marketplace!', 'success');
        router.push('/dashboard');
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsPublishing(false);
      addToast(err.message || 'Failed to upload product.', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '55vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Intercept users without Seller Role
  if (!user || user.role !== 'Seller') {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4.5rem' }}>🔒</div>
        <h2>Seller Authorization Required</h2>
        <p style={{ maxWidth: '440px', color: 'var(--text-secondary)' }}>
          To upload and sell beats, sample packs, and sound design files, you must configure your account role as a <b>Seller</b>.
        </p>
        <button onClick={() => router.push('/role-selection')} className="btn btn-primary">
          Select Seller Role
        </button>
      </div>
    );
  }

  return (
    <div className="container main-content">
      <div className="upload-container">
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Upload Your Sound Assets</h1>
          <p className="body-small" style={{ color: 'var(--text-muted)' }}>
            Publish beats, sample packs, or one-shots. Buyers will pay manually via your uploaded QR code.
          </p>
        </div>

        {/* Upload Overlay loader */}
        {isPublishing && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(10,10,12,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10005,
              gap: '16px'
            }}
          >
            <div className="spinner"></div>
            <h3 style={{ color: 'white' }}>Publishing product to marketplace...</h3>
            <div style={{ width: '280px', height: '6px', backgroundColor: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.1s ease' }} />
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{uploadProgress}% completed</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Product Type Selector */}
          <div className="form-group">
            <label className="form-label">Product Type</label>
            <div className="segmented-control">
              <button
                type="button"
                className={`segment-btn ${productType === 'Beat' ? 'segment-btn--active' : ''}`}
                onClick={() => {
                  setProductType('Beat');
                  setFiles([]);
                }}
              >
                🎹 Beat (Paid/Free)
              </button>
              <button
                type="button"
                className={`segment-btn ${productType === 'Pack' ? 'segment-btn--active' : ''}`}
                onClick={() => {
                  setProductType('Pack');
                  setFiles([]);
                }}
              >
                📦 Sample Pack (Paid/Free)
              </button>
              <button
                type="button"
                className={`segment-btn ${productType === 'One-Shot' ? 'segment-btn--active' : ''}`}
                onClick={() => {
                  setProductType('One-Shot');
                  setFiles([]);
                }}
              >
                🎯 One-Shot (Free Only)
              </button>
            </div>
          </div>

          {/* File dropzone */}
          <div
            className={`dropzone ${dragActive ? 'dropzone-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept={productType === 'Pack' ? ".zip,.rar" : ".wav,.mp3,.flac,.aiff,.mid,.midi"}
              onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            />
            <span className="dropzone-icon">📤</span>
            <h4 style={{ color: 'var(--text-primary)' }}>
              {productType === 'Pack' ? 'Upload compressed kit bundle' : 'Upload audio product file'}
            </h4>
            <p className="caption" style={{ color: 'var(--text-muted)' }}>
              {productType === 'Pack'
                ? 'Supports ZIP or RAR files containing multiple sounds (up to 200MB)'
                : 'Supports WAV, MP3, FLAC, or MIDI formats (up to 40MB)'}
            </p>
          </div>

          {/* File Row details */}
          {files.length > 0 && (
            <div className="upload-file-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span>📦</span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{files[0].name}</span>
                <span className="caption" style={{ color: 'var(--text-muted)' }}>({files[0].size})</span>
              </div>
              <button type="button" onClick={handleRemoveFile} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                ✕
              </button>
            </div>
          )}

          {/* Product Title */}
          <div className="form-group">
            <label className="form-label">Product Name <span style={{ color: 'var(--error)' }}>*</span></label>
            <input
              type="text"
              placeholder={productType === 'Beat' ? "e.g. Midnight 808 Drill Beat" : productType === 'Pack' ? "e.g. Vintage Synth Keys Pack" : "e.g. Cyberpunk Kick One-Shot"}
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              placeholder="Describe details like style, plugins, instrument loops, or composition terms..."
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Genre & Parameters Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Genre <span style={{ color: 'var(--error)' }}>*</span></label>
              <select className="form-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                {['Hip-Hop', 'Electronic', 'Lo-Fi', 'Cinematic', 'Pop', 'R&B', 'Trap', 'Ambient', 'Jazz', 'Rock'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {productType !== 'Pack' && (
              <>
                <div className="form-group">
                  <label className="form-label">BPM (Tempo)</label>
                  <input
                    type="number"
                    min="40"
                    max="250"
                    className="form-input"
                    value={bpm}
                    onChange={(e) => setBpm(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Scale</label>
                  <select className="form-select" value={scaleKey} onChange={(e) => setScaleKey(e.target.value)}>
                    {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'Cm', 'Dm', 'Em', 'Am', 'Gm'].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags (Press enter to add)</label>
            <div className="tag-input-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
              {tags.map((tag) => (
                <span className="tag tag-accent" key={tag} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '0.75rem' }}>
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "add tag and press Enter..." : ""}
                style={{ flexGrow: 1, border: 'none', background: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Pricing & Cover */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'flex-start' }} className="grid-2col">
            
            {/* Price */}
            <div className="form-group">
              <label className="form-label">Product Pricing ($) <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={productType === 'One-Shot' ? "0.00 (Locked)" : "0.00 for Free, or amount (e.g. 19.99)"}
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={productType === 'One-Shot'}
                required
              />
              <p className="caption" style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                {productType === 'One-Shot'
                  ? '🔒 One-Shot sounds are strictly promotional assets and must be offered for free.'
                  : 'Sellers receive payment notice approvals directly on their dashboard before grant access.'}
              </p>
            </div>

            {/* Cover artwork */}
            <div className="form-group">
              <label className="form-label">Cover Artwork</label>
              <div className="cover-art-zone" onClick={() => coverInputRef.current?.click()} style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                <input
                  type="file"
                  ref={coverInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleCoverUpload}
                />
                {coverArt ? (
                  <img src={coverArt} alt="Artwork preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                    <span className="body-small">Upload Image</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Agreements */}
          <div style={{ marginTop: '10px' }}>
            <label className="form-checkbox-label" style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                className="form-checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                required
              />
              <span className="body-small">
                I confirm that I own or control all rights to this audio and artwork, and agree to license it under SampleGoldmine royalty-free rules.
              </span>
            </label>
          </div>

          {/* Submit buttons */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flexGrow: 1 }}
              onClick={() => addToast('Draft saved successfully to localStorage.', 'success')}
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flexGrow: 2, background: 'var(--accent-gradient)' }}
              disabled={files.length === 0 || !title || !hasAgreed}
            >
              Publish {productType}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
