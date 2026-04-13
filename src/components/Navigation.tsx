'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import { HomeIcon, ProfileIcon, AskIcon, SettingsIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, LogoutIcon } from './Icons';

export default function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/profile', icon: ProfileIcon, label: 'Profile' },
    { href: '/ask', icon: AskIcon, label: 'Ask' },
    { href: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.button
                  className={`p-3 rounded-lg transition-colors ${
                    isActive(item.href) ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{ color: 'var(--text-primary)' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="w-6 h-6" />
                </motion.button>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="p-3 rounded-lg"
              style={{ color: 'var(--icon-color)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </motion.button>

            {user && (
              <motion.button
                onClick={logout}
                className="p-3 rounded-lg hidden md:block"
                style={{ color: 'var(--icon-color)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogoutIcon />
              </motion.button>
            )}

            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-lg md:hidden"
              style={{ color: 'var(--icon-color)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{ borderColor: 'var(--text-primary)' }}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <motion.div
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive(item.href) ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{ color: 'var(--text-primary)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
              {user && (
                <motion.button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg w-full opacity-60 hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
