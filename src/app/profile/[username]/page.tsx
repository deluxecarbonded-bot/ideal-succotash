'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Question, Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getProfileByUsername, getQuestionsForProfile, getUserLikes } from '@/lib/database';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';

function ProfileContent() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<Profile | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'answered'>('all');
  const [loading, setLoading] = useState(true);
  const [likedQuestions, setLikedQuestions] = useState<string[]>([]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    if (username) {
      const profile = await getProfileByUsername(username);
      if (profile) {
        setProfileUser(profile);
        const qs = await getQuestionsForProfile(profile.id, false);
        setQuestions(qs);
      }
    }
    setLoading(false);
  }, [username]);

  const loadUserLikes = useCallback(async () => {
    if (!currentUser) return;
    const likes = await getUserLikes(currentUser.id);
    setLikedQuestions(likes);
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (currentUser) {
      loadUserLikes();
    }
  }, [currentUser, loadUserLikes]);

  const isOwner = currentUser?.username === username;

  const filteredQuestions = questions.map(q => ({
    ...q,
    is_liked: likedQuestions.includes(q.id),
  })).filter((q) => {
    if (filter === 'answered') return q.is_answered;
    return true;
  });

  const handleLike = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, is_liked: !q.is_liked, likes_count: q.is_liked ? q.likes_count - 1 : q.likes_count + 1 } : q
    ));
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

  if (loading) {
    return (
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--text-primary)' }}>User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCard
        user={profileUser}
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
