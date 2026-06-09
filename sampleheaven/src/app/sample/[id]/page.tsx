"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { mockSamples, mockCreators, Sample } from '../../../data/mockData';
import { commentService, authService, interactionService, productService, supabaseUrl, isRealSupabaseConfigured, MockComment, getCoverArtUrl, profileService } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useAudio } from '../../../context/AudioContext';
import { useToast } from '../../../context/ToastContext';
import WaveformPlayer from '../../../components/WaveformPlayer';
import '../../../styles/pages/sample-detail.css';

export default function SampleDetail() {
  const params = useParams();
  const router = useRouter();
  const sampleId = params.id as string;
  const { currentSample, isPlaying, togglePlay } = useAudio();
  const { addToast } = useToast();

  const { user } = useAuth();
  const [sample, setSample] = useState<Sample | null>(null);
  const [creator, setCreator] = useState<any>(null);
  const [comments, setComments] = useState<MockComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  
  // Load sample data, comments, and creator
  useEffect(() => {
    const loadSampleData = async () => {
      let foundSample = mockSamples.find(s => s.id === sampleId);
      
      if (!foundSample) {
        try {
          const dbProducts = await productService.getProducts();
          const p = dbProducts.find(prod => prod.id === sampleId);
          if (p) {
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

            foundSample = {
              id: p.id,
              title: p.title,
              creator: p.seller_name,
              type: (p.type === 'Kit' ? 'Pack' : p.type) as any,
              genre: p.genre,
              bpm: p.bpm || null,
              key: p.scale_key || null,
              format,
              downloads: p.downloads || 0,
              duration,
              fileSize,
              audioUrl,
              coverArt: getCoverArtUrl(p.cover_art_url)
            };
          }
        } catch (err) {
          console.error("Failed to load sample details from database:", err);
        }
      }

      if (foundSample) {
        setSample(foundSample);
        
        // Load corresponding creator
        let profilePicUrl = '';
        try {
          const { profile: creatorProf } = await profileService.getSellerProfileByUsername(foundSample.creator);
          if (creatorProf && creatorProf.profile_picture_url) {
            profilePicUrl = creatorProf.profile_picture_url;
          }
        } catch (err) {
          console.error("Failed to load creator profile picture:", err);
        }

        const foundCreator = mockCreators.find(c => c.username === foundSample.creator) || {
          username: foundSample.creator,
          samplesCount: 14,
          followersCount: 380,
          bio: "Music producer & sound designer sharing premium sound elements.",
          avatarLetter: foundSample.creator.charAt(0).toUpperCase()
        };
        setCreator({
          ...foundCreator,
          profilePictureUrl: profilePicUrl
        });

        // Load comments
        commentService.getCommentsForSample(foundSample.id).then(data => {
          setComments(data);
        });
        
        // Load follow state
        const following = interactionService.getFollowedCreators();
        setIsFollowing(following.includes(foundSample.creator));
      } else {
        setSample(null);
      }
    };

    loadSampleData();
    
    // Load likes
    setLikedIds(interactionService.getLikedIds());
  }, [sampleId, user?.id]);

  if (!sample) {
    return (
      <div className="container main-content flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
        <h2>Sample Not Found</h2>
        <p>The sound asset you are looking for does not exist or has been removed.</p>
        <Link href="/browse" className="btn btn-primary">
          Back to Browse
        </Link>
      </div>
    );
  }

  const handleFollowToggle = () => {
    const following = interactionService.toggleFollow(sample.creator);
    setIsFollowing(following);
    if (creator) {
      setCreator({
        ...creator,
        followersCount: following ? creator.followersCount + 1 : creator.followersCount - 1
      });
    }
    addToast(following ? `Following ${sample.creator}` : `Unfollowed ${sample.creator}`, 'success');
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // Check if user is logged in
    if (!user) {
      addToast('Please sign in to post comments.', 'error');
      router.push('/login');
      return;
    }

    const comment = await commentService.addComment(sample.id, newCommentText);
    if (comment) {
      const freshComments = await commentService.getCommentsForSample(sample.id);
      setComments(freshComments);
      setNewCommentText('');
      addToast('Comment posted successfully!', 'success');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    const res = await commentService.likeComment(commentId);
    const freshComments = await commentService.getCommentsForSample(sample.id);
    setComments(freshComments);
  };

  const isLiked = likedIds.includes(sample.id);

  const handleLikeSample = () => {
    const liked = interactionService.toggleLike(sample.id);
    setLikedIds(interactionService.getLikedIds());
    addToast(liked ? 'Saved to library!' : 'Removed from library', 'info');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Link copied to clipboard!', 'success');
  };

  // Find other samples by this creator
  const moreByCreator = mockSamples
    .filter(s => s.creator === sample.creator && s.id !== sample.id)
    .slice(0, 3);

  // Find related samples by genre
  const relatedSamples = mockSamples
    .filter(s => s.genre === sample.genre && s.id !== sample.id)
    .slice(0, 4);

  return (
    <div className="container main-content">
      {/* AEO Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MusicRecording",
            "name": sample.title,
            "byArtist": {
              "@type": "MusicGroup",
              "name": sample.creator,
              "url": `http://localhost:3000/creator/${encodeURIComponent(sample.creator)}`
            },
            "genre": sample.genre,
            "audio": {
              "@type": "AudioObject",
              "contentUrl": `http://localhost:3000/audio/${sample.id}.wav`,
              "encodingFormat": "audio/wav"
            }
          })
        }}
      />
      {/* Breadcrumb navigation */}
      <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <Link href="/" className="footer-link">Home</Link> &gt;{' '}
        <Link href="/browse" className="footer-link">Browse</Link> &gt;{' '}
        <span style={{ color: 'var(--text-primary)' }}>{sample.title}</span>
      </div>

      {/* Hero Header waveform area */}
      <section className="detail-hero">
        <div className="detail-title-row" style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {sample.coverArt && (
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border)'
            }}>
              <img src={sample.coverArt} alt={sample.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ flexGrow: 1 }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{sample.title}</h1>
            <Link href={`/creator/${sample.creator}`} className="detail-creator-link">
              <span className="sample-card-creator-avatar" style={{ overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {creator?.profilePictureUrl ? (
                  <img src={creator.profilePictureUrl} alt={sample.creator} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  sample.creator.charAt(0).toUpperCase()
                )}
              </span>
              <span>by <b>{sample.creator}</b></span>
            </Link>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button onClick={handleLikeSample} className="btn btn-secondary">
              {isLiked ? '❤️ Saved' : '🤍 Save'}
            </button>
            <button onClick={handleShare} className="btn btn-ghost" aria-label="Share">
              🔗 Share
            </button>
            <button
              onClick={() => addToast('Thank you for reporting. Our moderators will review this file.', 'info')}
              className="btn btn-ghost"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Report"
            >
              ⚠️ Report
            </button>
          </div>
        </div>

        {/* Wavesurfer canvas visualizer */}
        <WaveformPlayer sample={sample} />
      </section>

      {/* Main Double Column layout */}
      <div className="detail-layout">
        
        {/* Left Column: Description & Metadata */}
        <div>
          <div style={{ padding: '4px 0' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Description</h3>
            <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              This high-quality audio sample was designed by {sample.creator} using state-of-the-art synthesizers and sound processors. It is 100% royalty-free and ready for placement in any commercial or personal music production, sound track scoring, or game audio project.
            </p>
          </div>

          {/* Key metadata grid */}
          <div className="metadata-grid">
            <div className="metadata-item">
              <span className="metadata-key">Type</span>
              <span className="metadata-value">{sample.type}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Genre</span>
              <span className="metadata-value">{sample.genre}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">BPM</span>
              <span className="metadata-value">{sample.bpm || '—'}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Key</span>
              <span className="metadata-value">{sample.key || '—'}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Format</span>
              <span className="metadata-value">{sample.format}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">File Size</span>
              <span className="metadata-value">{sample.fileSize}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Duration</span>
              <span className="metadata-value">{sample.duration}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Sample Rate</span>
              <span className="metadata-value">44.1 kHz</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">Bit Depth</span>
              <span className="metadata-value">24-bit</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-key">License</span>
              <span className="metadata-value">Royalty-Free (Free Use)</span>
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '10px' }}>TAGS</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link href={`/browse?q=${encodeURIComponent(sample.genre)}`} className="tag tag-interactive">#{sample.genre}</Link>
              <Link href={`/browse?q=${encodeURIComponent(sample.type)}`} className="tag tag-interactive">#{sample.type}</Link>
              {sample.key && <Link href={`/browse?q=${encodeURIComponent(sample.key)}`} className="tag tag-interactive">#Key-{sample.key}</Link>}
              {sample.bpm && <Link href={`/browse?q=${encodeURIComponent(sample.bpm)}`} className="tag tag-interactive">#{sample.bpm}BPM</Link>}
              <Link href="/browse" className="tag tag-interactive">#RoyaltyFree</Link>
              <Link href="/browse" className="tag tag-interactive">#MusicProducer</Link>
            </div>
          </div>

          {/* Comments Section */}
          <section className="comments-section">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>💬 Discussion ({comments.length})</h3>

            {/* Comment Form input */}
            <form onSubmit={handlePostComment} className="comment-input-area">
              <div className="comment-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {user?.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt={user?.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.username.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="comment-box">
                <textarea
                  className="form-textarea"
                  placeholder="Ask a question or leave feedback about this sound..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  style={{ minHeight: '80px', padding: '12px' }}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
                  Post Comment
                </button>
              </div>
            </form>

            {/* Comments Feed List */}
            {comments.length === 0 ? (
              <p className="body-small" style={{ fontStyle: 'italic', padding: '16px 0' }}>
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {comment.profilePictureUrl ? (
                        <img src={comment.profilePictureUrl} alt={comment.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        comment.avatarLetter
                      )}
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div className="comment-header">
                        <span className="comment-author">{comment.username}</span>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <div className="comment-text">{comment.text}</div>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className={`comment-like-btn ${comment.likedByCurrentUser ? 'comment-like-btn--active' : ''}`}
                        >
                          👍 {comment.likes} {comment.likes === 1 ? 'Like' : 'Likes'}
                        </button>
                        <button
                          onClick={() => addToast('Reply action placeholder', 'info')}
                          style={{ cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <aside>
          {/* Creator Profile Summary Block */}
          {creator && (
            <div className="sidebar-block">
              <h4 className="sidebar-title">Creator Info</h4>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-full)',
                    background: creator?.profilePictureUrl ? 'none' : 'var(--accent-gradient)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '2px solid var(--border)',
                    padding: 0
                  }}
                >
                  {creator?.profilePictureUrl ? (
                    <img src={creator.profilePictureUrl} alt={creator.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    creator.avatarLetter
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{creator.username}</h4>
                  <span className="caption" style={{ color: 'var(--text-muted)' }}>
                    {creator.samplesCount} Samples · {creator.followersCount.toLocaleString()} Followers
                  </span>
                </div>
              </div>
              <p className="body-small" style={{ marginBottom: '16px', lineHeight: 1.5 }}>
                {creator.bio}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleFollowToggle}
                  className={`btn btn-sm ${isFollowing ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flexGrow: 1 }}
                >
                  {isFollowing ? 'Following ✓' : 'Follow'}
                </button>
                <Link
                  href={`/creator/${sample.creator}`}
                  className="btn btn-sm btn-ghost"
                  style={{ border: '1px solid var(--border)' }}
                >
                  Profile
                </Link>
              </div>
            </div>
          )}

          {/* More by Creator */}
          {moreByCreator.length > 0 && (
            <div className="sidebar-block">
              <h4 className="sidebar-title">More by {sample.creator}</h4>
              <div>
                {moreByCreator.map((s) => {
                  const isCurrentRow = currentSample?.id === s.id;
                  const isRowPlaying = isCurrentRow && isPlaying;
                  return (
                    <div
                      key={s.id}
                      className={`compact-sample-row ${isRowPlaying ? 'compact-sample-row-playing' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {s.type === 'Pack' || s.type === 'Kit' ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📦</span>
                        ) : (
                          <button
                            onClick={() => togglePlay(s)}
                            style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            {isRowPlaying ? '⏸' : '▶'}
                          </button>
                        )}
                        <Link href={`/sample/${s.id}`} className="compact-sample-title" title={s.title}>
                          {s.title}
                        </Link>
                      </div>
                      <span className="tag" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {s.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Related Samples */}
          {relatedSamples.length > 0 && (
            <div className="sidebar-block">
              <h4 className="sidebar-title">Related Sounds</h4>
              <div>
                {relatedSamples.map((s) => {
                  const isCurrentRow = currentSample?.id === s.id;
                  const isRowPlaying = isCurrentRow && isPlaying;
                  return (
                    <div
                      key={s.id}
                      className={`compact-sample-row ${isRowPlaying ? 'compact-sample-row-playing' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {s.type === 'Pack' || s.type === 'Kit' ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📦</span>
                        ) : (
                          <button
                            onClick={() => togglePlay(s)}
                            style={{ color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            {isRowPlaying ? '⏸' : '▶'}
                          </button>
                        )}
                        <div style={{ overflow: 'hidden' }}>
                          <Link href={`/sample/${s.id}`} className="compact-sample-title" title={s.title}>
                            {s.title}
                          </Link>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            by {s.creator}
                          </div>
                        </div>
                      </div>
                      <span className="tag" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                        {s.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
