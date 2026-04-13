'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Question, Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useProfile, useProfileQuestions, useLikes } from '@/lib/hooks';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string | undefined;
  const { user: currentUser } = useAuth();
  
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');

  const { profile, loading: profileLoading, updateProfile: updateUserProfile } = useProfile(username);
  
  const profileId = profile?.id;
  const canViewPrivate = !username || username === currentUser?.username;
  
  const { 
    questions, 
    loading: questionsLoading, 
    refetch, 
    answerQuestion, 
    deleteQuestion 
  } = useProfileQuestions(profileId || '', canViewPrivate);
  
  const { likedQuestions, toggleLike, isLiked } = useLikes(currentUser?.id);

  const isOwner = !username || (currentUser?.username === username);

  const filteredQuestions = questions.map(q => ({
    ...q,
    is_liked: isLiked(q.id),
  })).filter((q) => {
    if (filter === 'answered') return q.is_answered;
    if (filter === 'unanswered') return !q.is_answered;
    return true;
  });

  const handleAnswer = async (id: string, answer: string) => {
    await answerQuestion?.(id, answer);
  };

  const handleLike = async (id: string) => {
    await toggleLike?.(id);
  };

  const handleDelete = async (id: string) => {
    await deleteQuestion?.(id);
  };

  const handleShare = (question: Question) => {
    const url = `${window.location.origin}/profile/${question.recipient?.username}?question=${question.id}`;
    navigator.clipboard.writeText(url);
  };

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    await updateUserProfile?.(updates);
  };

  const stats = {
    questionsReceived: questions.length,
    questionsAnswered: questions.filter(q => q.is_answered).length,
    likes: questions.reduce((sum, q) => sum + q.likes_count, 0),
  };

  if (profileLoading) {
    return (
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-primary)' }}>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCard
        user={profile}
        stats={stats}
        isOwner={isOwner}
        onUpdate={isOwner ? handleUpdateProfile : undefined}
      />

      <div className="flex gap-2 justify-center">
        {(['all', 'answered', 'unanswered'] as const).map((f) => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize"
            style={{ 
              backgroundColor: filter === f ? 'var(--btn-bg)' : 'transparent',
              color: filter === f ? 'var(--btn-text)' : 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {questionsLoading ? (
            <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 opacity-50"
              style={{ color: 'var(--text-primary)' }}
            >
              {isOwner ? 'No questions yet. Share your profile to receive questions!' : 'No questions yet.'}
            </motion.div>
          ) : (
            filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onLike={handleLike}
                onAnswer={isOwner ? handleAnswer : undefined}
                onDelete={isOwner ? handleDelete : undefined}
                onShare={handleShare}
                canDelete={isOwner}
                canAnswer={isOwner}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
