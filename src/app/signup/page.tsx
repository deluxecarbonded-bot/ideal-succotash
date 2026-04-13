'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { checkUsernameAvailable } from '@/lib/database';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/Icons';

interface ValidationErrors {
  username?: string;
  email?: string;
  password?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [checkingUsername, setCheckingUsername] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): string | undefined => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (/^[0-9]/.test(username)) {
      return 'Username cannot start with a number';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password.length > 100) {
      return 'Password must be less than 100 characters';
    }
    return undefined;
  };

  const checkUsername = useCallback(async (value: string) => {
    const usernameError = validateUsername(value);
    if (usernameError) {
      setErrors(prev => ({ ...prev, username: usernameError }));
      return;
    }

    setCheckingUsername(true);
    const available = await checkUsernameAvailable(value);
    setCheckingUsername(false);

    if (!available) {
      setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
    } else {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setErrors(prev => ({ ...prev, username: undefined }));
  };

  const handleUsernameBlur = () => {
    if (username) {
      checkUsername(username);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const newErrors: ValidationErrors = {};
    
    const usernameError = validateUsername(username);
    if (usernameError) newErrors.username = usernameError;
    
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const available = await checkUsernameAvailable(username);
      if (!available) {
        setErrors({ username: 'Username is already taken' });
        setLoading(false);
        return;
      }

      await signup(email, password, username);
      router.push('/profile');
    } catch (err: any) {
      if (err?.message?.includes('email')) {
        setError('Email is already registered');
      } else if (err?.message?.includes('username')) {
        setErrors({ username: 'Username is already taken' });
      } else {
        setError('Failed to create account. Please try again.');
      }
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
        noValidate
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
            onChange={handleUsernameChange}
            onBlur={handleUsernameBlur}
            placeholder="Choose a username"
            autoComplete="username"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: errors.username ? '1px solid #ef4444' : '1px solid rgba(128,128,128,0.2)'
            }}
          />
          {errors.username && (
            <p className="text-xs" style={{ color: '#ef4444' }}>
              {errors.username}
            </p>
          )}
          {checkingUsername && (
            <p className="text-xs opacity-50" style={{ color: 'var(--text-primary)' }}>
              Checking availability...
            </p>
          )}
          {username && !errors.username && !checkingUsername && (
            <p className="text-xs" style={{ color: '#22c55e' }}>
              Username is available
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors(prev => ({ ...prev, email: undefined }));
            }}
            placeholder="your@email.com"
            autoComplete="email"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: errors.email ? '1px solid #ef4444' : '1px solid rgba(128,128,128,0.2)'
            }}
          />
          {errors.email && (
            <p className="text-xs" style={{ color: '#ef4444' }}>
              {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm opacity-70" style={{ color: 'var(--text-primary)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors(prev => ({ ...prev, password: undefined }));
            }}
            placeholder="Create a password"
            autoComplete="new-password"
            className="w-full p-3 rounded-xl text-base"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: errors.password ? '1px solid #ef4444' : '1px solid rgba(128,128,128,0.2)'
            }}
          />
          {errors.password && (
            <p className="text-xs" style={{ color: '#ef4444' }}>
              {errors.password}
            </p>
          )}
          <p className="text-xs opacity-50" style={{ color: 'var(--text-primary)' }}>
            Must be at least 6 characters
          </p>
        </div>

        <motion.button
          type="submit"
          disabled={loading || checkingUsername}
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
