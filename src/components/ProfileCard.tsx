'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Profile } from '@/types';
import { LinkIcon, EditIcon, CheckIcon, CloseIcon } from './Icons';
import { useTheme } from '@/context/ThemeContext';

interface ProfileCardProps {
  user: User | Profile;
  stats: {
    questionsReceived: number;
    questionsAnswered: number;
    likes: number;
  };
  isOwner?: boolean;
  onEditProfile?: () => void;
  onUpdate?: (updates: Partial<Profile>) => void | Promise<void>;
}

export default function ProfileCard({ user, stats, isOwner, onEditProfile, onUpdate }: ProfileCardProps) {
  const { theme } = useTheme();
  const fillColor = theme === 'dark' ? '#ffffff' : '#000000';
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState(user.bio || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyLink = () => {
    const url = `${window.location.origin}/profile/${user.username}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate({ bio: editBio });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditBio(user.bio || '');
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid rgba(128,128,128,0.15)'
      }}
    >
      <div className="flex items-start gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !isOwner) return;
            
            setUploadingAvatar(true);
            try {
              const { uploadAvatar } = await import('@/lib/database');
              await uploadAvatar(user.id, file);
              if (onUpdate) {
                onUpdate({});
              }
            } finally {
              setUploadingAvatar(false);
            }
          }}
        />
        <div 
          onClick={() => isOwner && fileInputRef.current?.click()}
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold cursor-pointer overflow-hidden relative"
          style={{ 
            backgroundColor: 'rgba(128,128,128,0.15)',
            color: 'var(--text-primary)'
          }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover rounded-full" />
          ) : (
            user.username.charAt(0).toUpperCase()
          )}
          {isOwner && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-full">
              {uploadingAvatar ? (
                <span className="text-white text-sm">Uploading...</span>
              ) : (
                <span className="text-white text-xs">Change</span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {user.username}
              </h1>
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Write your bio..."
                    className="w-full p-2 rounded-lg text-sm resize-none"
                    style={{ 
                      backgroundColor: 'rgba(128,128,128,0.1)',
                      color: 'var(--text-primary)',
                      border: '1px solid rgba(128,128,128,0.2)'
                    }}
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <motion.button
                      onClick={handleSave}
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: 'var(--btn-bg)', color: 'var(--btn-text)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckIcon />
                    </motion.button>
                    <motion.button
                      onClick={handleCancel}
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: 'rgba(128,128,128,0.2)', color: 'var(--text-primary)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CloseIcon />
                    </motion.button>
                  </div>
                </div>
              ) : user.bio ? (
                <p className="mt-1 opacity-70" style={{ color: 'var(--text-primary)' }}>
                  {user.bio}
                </p>
              ) : isOwner ? (
                <p className="mt-1 opacity-50" style={{ color: 'var(--text-primary)' }}>
                  Add a bio...
                </p>
              ) : null}
            </div>

            {isOwner && !isEditing && (
              <motion.button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-lg"
                style={{ color: 'var(--text-primary)', opacity: 0.6 }}
                whileHover={{ scale: 1.05, opacity: 1 }}
                whileTap={{ scale: 0.95 }}
              >
                <EditIcon />
              </motion.button>
            )}
          </div>

          <motion.button
            onClick={copyLink}
            className="flex items-center gap-2 mt-3 text-sm opacity-60 hover:opacity-100"
            style={{ color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.95 }}
          >
            <LinkIcon />
            Copy profile link
          </motion.button>
        </div>
      </div>

      <div className="flex justify-around mt-6 pt-4" style={{ borderTop: '1px solid rgba(128,128,128,0.15)' }}>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.questionsReceived}</p>
          <p className="text-sm opacity-50" style={{ color: 'var(--text-primary)' }}>Received</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.questionsAnswered}</p>
          <p className="text-sm opacity-50" style={{ color: 'var(--text-primary)' }}>Answered</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.likes}</p>
          <p className="text-sm opacity-50" style={{ color: 'var(--text-primary)' }}>Likes</p>
        </div>
      </div>
    </motion.div>
  );
}
