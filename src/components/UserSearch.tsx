'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile } from '@/types';
import { searchUsers } from '@/lib/database';

interface UserSearchProps {
  onSelectUser: (profile: Profile) => void;
  selectedUser?: Profile | null;
  placeholder?: string;
}

export default function UserSearch({ onSelectUser, selectedUser, placeholder = "Search users..." }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const users = await searchUsers(searchQuery);
      setResults(users);
      setIsOpen(users.length > 0);
      setSelectedIndex(-1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timeout);
  }, [query, search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelectUser(results[selectedIndex]);
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (profile: Profile) => {
    onSelectUser(profile);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  if (selectedUser) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(128, 128, 128, 0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'rgba(128, 128, 128, 0.15)', color: 'var(--text-primary)' }}>
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <span style={{ color: 'var(--text-primary)' }}>@{selectedUser.username}</span>
        </div>
        <button
          onClick={() => {
            onSelectUser(null as unknown as Profile);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="text-sm opacity-60 hover:opacity-100"
          style={{ color: 'var(--text-primary)' }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-3 rounded-xl text-sm"
        style={{
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(128, 128, 128, 0.2)',
        }}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid rgba(128, 128, 128, 0.2)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
          >
            {loading ? (
              <div className="p-4 text-center opacity-50" style={{ color: 'var(--text-primary)' }}>
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center opacity-50" style={{ color: 'var(--text-primary)' }}>
                No users found
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {results.map((profile, index) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelect(profile)}
                    className={`w-full p-3 flex items-center gap-3 text-left transition-colors ${index === selectedIndex ? 'bg-opacity-10' : ''}`}
                    style={{
                      backgroundColor: index === selectedIndex ? 'rgba(128, 128, 128, 0.1)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'rgba(128, 128, 128, 0.15)' }}>
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">@{profile.username}</span>
                      {profile.bio && <span className="text-xs opacity-60 truncate max-w-xs">{profile.bio}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
