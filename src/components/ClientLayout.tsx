'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navigation />
        <main className="pt-20 pb-8 px-4 max-w-2xl mx-auto">
          {children}
        </main>
      </AuthProvider>
    </ThemeProvider>
  );
}
