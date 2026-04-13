'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, username);
      router.push('/profile');
    } catch (err) {
      setError('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href="/">
          <button
            className="flex items-center gap-2 opacity-60 hover:opacity-100"
            style={{ color: 'var(--text-primary)' }}
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Create Account
        </h1>
        <p className="mt-2 opacity-60" style={{ color: 'var(--text-primary)' }}>
          Join Exotic and start asking
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-xl text-sm"
            style={{ 
              backgroundColor: 'rgba(239,68,68,0.1)', 
              color: '#ef4444'
            }}
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="username"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl font-medium disabled:opacity-50"
          style={{ 
            backgroundColor: 'var(--btn-bg)', 
            color: 'var(--btn-text)' 
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </motion.button>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center opacity-60"
        style={{ color: 'var(--text-primary)' }}
      >
        Already have an account?{' '}
        <Link href="/login" className="font-medium hover:opacity-80">
          Login
        </Link>
      </motion.p>
    </div>
  );
}
