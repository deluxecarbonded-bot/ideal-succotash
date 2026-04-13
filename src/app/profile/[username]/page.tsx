'use client';

import { useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Question, Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useProfileQuestions, useLikes, useProfile } from '@/lib/hooks';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';

function ProfileContent() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [filter, setFilter] = useState<'all' | 'answered'>('all');

  const { profile, loading: profileLoading } = useProfile(username);
  const { questions, loading: questionsLoading } = useProfileQuestions(profile?.id || '', false);
  const { likedQuestions, toggleLike, isLiked } = useLikes(currentUser?.id);

  const isOwner = currentUser?.username === username;

  const filteredQuestions = questions.map(q => ({
    ...q,
    is_liked: isLiked(q.id),
  })).filter((q) => {
    if (filter === 'answered') return q.is_answered;
    return true;
  });

  const handleLike = async (id: string) => {
    await toggleLike(id);
  };

  const handleShare = (question: Question) => {
    const url = `${window.location.origin}/profile/${question.recipient?.username}?question=${question.id}`;
    navigator.clipboard.writeText(url);
  };

  const stats = {
    questionsReceived: questions.length,
    questionsAnswered: questions.filter(q => q.is_answered).length,
    likes: questions.reduce((sum, q) => sum + q.likes_count, 0),
  };

  if (profileLoading || questionsLoading) {
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
      />

      <div className="flex justify-center">
        <a href={`/ask/${username}`}>
          <motion.button
            className="px-6 py-2 rounded-xl font-medium"
            style={{ 
              backgroundColor: 'var(--btn-bg)', 
              color: 'var(--btn-text)' 
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            Ask Question
          </motion.button>
        </a>
      </div>

      <div className="flex gap-2 justify-center">
        {(['all', 'answered'] as const).map((f) => (
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
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
            No answered questions yet.
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onLike={handleLike}
              onShare={handleShare}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
