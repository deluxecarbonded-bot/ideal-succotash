'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Question, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string | undefined;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('exotic-user');
    if (stored) {
      setProfileUser(JSON.parse(stored));
    } else if (username) {
      setProfileUser({
        id: 'user-' + username,
        username,
        bio: '',
        avatar_url: null,
        created_at: new Date().toISOString(),
      });
    }
  }, [username]);

  useEffect(() => {
    const stored = localStorage.getItem('exotic-questions');
    if (stored) {
      const allQuestions: Question[] = JSON.parse(stored);
      if (username) {
        setQuestions(allQuestions.filter(q => q.recipient?.username === username));
      } else if (currentUser) {
        setQuestions(allQuestions.filter(q => q.recipient_id === currentUser.id));
      } else {
        setQuestions([]);
      }
    }
    setLoading(false);
  }, [username, currentUser]);

  useEffect(() => {
    if (profileUser) {
      localStorage.setItem('exotic-questions', JSON.stringify(questions));
    }
  }, [questions, profileUser]);

  const isOwner = !username || (currentUser?.username === username);

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'answered') return q.is_answered;
    if (filter === 'unanswered') return !q.is_answered;
    return true;
  });

  const handleAnswer = (id: string, answer: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, answer, is_answered: true } : q
    ));
  };

  const handleLike = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, is_liked: !q.is_liked, likes_count: q.is_liked ? q.likes_count - 1 : q.likes_count + 1 } : q
    ));
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
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
          {filteredQuestions.length === 0 ? (
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
