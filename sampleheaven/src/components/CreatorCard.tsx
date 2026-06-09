"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Creator } from '../data/mockData';
import { interactionService, profileService } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(creator.followersCount);
  const [profilePic, setProfilePic] = useState<string>('');
  const { addToast } = useToast();

  useEffect(() => {
    const following = interactionService.getFollowedCreators();
    setIsFollowing(following.includes(creator.username));

    const loadProfilePic = async () => {
      try {
        const { profile } = await profileService.getSellerProfileByUsername(creator.username);
        if (profile?.profile_picture_url) {
          setProfilePic(profile.profile_picture_url);
        }
      } catch (err) {
        console.error("Failed to load creator card picture:", err);
      }
    };
    loadProfilePic();
  }, [creator.username]);

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const following = interactionService.toggleFollow(creator.username);
    setIsFollowing(following);
    setFollowers(prev => following ? prev + 1 : prev - 1);
    addToast(
      following ? `You are now following ${creator.username}` : `Unfollowed ${creator.username}`,
      'success'
    );
  };

  return (
    <Link
      href={`/creator/${creator.username}`}
      className="creator-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '24px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        transition: 'var(--transition-default)'
      }}
    >
      <div
        className="creator-avatar-container"
        style={{
          width: '80px',
          height: '80px',
          borderRadius: 'var(--radius-full)',
          background: profilePic ? 'none' : 'var(--accent-gradient)',
          color: 'white',
          fontWeight: 700,
          fontSize: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid var(--border)',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-default)',
          overflow: 'hidden'
        }}
      >
        {profilePic ? (
          <img src={profilePic} alt={creator.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          creator.avatarLetter
        )}
      </div>

      {/* 2. Info */}
      <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{creator.username}</h4>
      
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          height: '42px',
          marginBottom: '12px'
        }}
      >
        {creator.bio}
      </p>

      {/* 3. Stats */}
      <div
        className="caption"
        style={{
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}
      >
        {creator.samplesCount} Samples · {followers.toLocaleString()} Followers
      </div>

      {/* 4. Follow Button */}
      <button
        onClick={handleFollow}
        className={`btn btn-sm ${isFollowing ? 'btn-primary' : 'btn-secondary'}`}
        style={{ width: '100%', marginTop: 'auto' }}
      >
        {isFollowing ? 'Following ✓' : 'Follow'}
      </button>

      {/* Hover visual adjustments */}
      <style jsx>{`
        .creator-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: hsla(265, 90%, 65%, 0.3);
        }
        .creator-card:hover .creator-avatar-container {
          transform: scale(1.05);
          border-color: var(--accent-primary);
        }
      `}</style>
    </Link>
  );
};

export default CreatorCard;
