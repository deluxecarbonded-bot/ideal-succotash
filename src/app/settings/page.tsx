'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { SunIcon, MoonIcon } from '@/components/Icons';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const handleSaveBio = () => {
    if (user) {
      setSaving(true);
      const updatedUser = { ...user, bio };
      localStorage.setItem('exotic-user', JSON.stringify(updatedUser));
      setTimeout(() => setSaving(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl space-y-4"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid rgba(128,128,128,0.15)'
        }}
      >
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <span className="opacity-70" style={{ color: 'var(--text-primary)' }}>
            Theme
          </span>
          <motion.button
            onClick={toggleTheme}
            className="p-3 rounded-xl"
            style={{ 
              backgroundColor: 'rgba(128,128,128,0.15)',
              color: 'var(--text-primary)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </motion.button>
        </div>
      </motion.div>

      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl space-y-4"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid rgba(128,128,128,0.15)'
          }}
        >
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Profile
          </h2>

          <div className="space-y-2">
            <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
              Username
            </label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full p-3 rounded-xl text-base opacity-60"
              style={{ 
                backgroundColor: 'rgba(128,128,128,0.1)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              className="w-full p-3 rounded-xl text-base resize-none"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(128,128,128,0.2)'
              }}
              rows={3}
            />
          </div>

          <motion.button
            onClick={handleSaveBio}
            disabled={saving}
            className="px-6 py-2 rounded-xl font-medium disabled:opacity-50"
            style={{ 
              backgroundColor: 'var(--btn-bg)', 
              color: 'var(--btn-text)' 
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </motion.button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-2xl"
        style={{ 
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid rgba(128,128,128,0.15)'
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Account
        </h2>

        {user ? (
          <motion.button
            onClick={logout}
            className="w-full px-6 py-3 rounded-xl font-medium"
            style={{ 
              backgroundColor: 'rgba(239,68,68,0.1)', 
              color: '#ef4444'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        ) : (
          <div className="space-y-3">
            <a href="/login">
              <motion.button
                className="w-full px-6 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: 'var(--btn-bg)', 
                  color: 'var(--btn-text)' 
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </a>
            <a href="/signup">
              <motion.button
                className="w-full px-6 py-3 rounded-xl font-medium"
                style={{ 
                  backgroundColor: 'var(--btn-bg)', 
                  color: 'var(--btn-text)' 
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
