'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useQuestions, useLikes } from '@/lib/hooks';
import QuestionCard from '@/components/QuestionCard';

export default function HomePage() {
  const { user } = useAuth();
  const { questions, loading, refetch } = useQuestions();
  const { likedQuestions, toggleLike, isLiked } = useLikes(user?.id);
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');

  const handleLike = async (id: string) => {
    await toggleLike(id);
  };

  const handleDelete = (id: string) => {
    refetch();
  };

  const handleShare = (question: Question) => {
    const url = `${window.location.origin}/profile/${question.recipient?.username}?question=${question.id}`;
    navigator.clipboard.writeText(url);
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'answered', label: 'Answered' },
    { key: 'unanswered', label: 'Unanswered' },
  ];

  const filteredQuestions = questions.map(q => ({
    ...q,
    is_liked: isLiked(q.id),
  })).filter((q) => {
    if (filter === 'answered') return q.is_answered;
    if (filter === 'unanswered') return !q.is_answered;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Welcome to Exotic
        </h1>
        <p className="mt-2 opacity-60" style={{ color: 'var(--text-primary)' }}>
          Ask anonymously, answer honestly
        </p>
      </motion.div>

      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl text-center"
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid rgba(128,128,128,0.15)'
          }}
        >
          <p className="opacity-70" style={{ color: 'var(--text-primary)' }}>
            Sign up to ask questions and get answers
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="/login">
              <motion.button
                className="px-6 py-2 rounded-xl font-medium"
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
                className="px-6 py-2 rounded-xl font-medium"
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
        </motion.div>
      )}

      <div className="flex gap-2 justify-center">
        {filters.map((f) => (
          <motion.button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="px-4 py-2 rounded-xl text-sm font-medium"
            style={{ 
              backgroundColor: filter === f.key ? 'var(--btn-bg)' : 'transparent',
              color: filter === f.key ? 'var(--btn-text)' : 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
              Loading...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 opacity-50"
              style={{ color: 'var(--text-primary)' }}
            >
              No questions yet. Be the first to ask!
            </motion.div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onLike={handleLike}
                onDelete={user?.id === question.recipient_id ? handleDelete : undefined}
                onShare={handleShare}
                showAnswer={true}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
