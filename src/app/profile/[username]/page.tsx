'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Question, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import QuestionCard from '@/components/QuestionCard';
import ProfileCard from '@/components/ProfileCard';
import { LinkIcon } from '@/components/Icons';

function ProfileContent() {
  const params = useParams();
  const username = params?.username as string;
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('exotic-user');
    if (stored) {
      const storedUser: User = JSON.parse(stored);
      if (storedUser.username === username) {
        setProfileUser(storedUser);
      } else {
        setProfileUser({
          id: 'user-' + username,
          username,
          bio: '',
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
      }
    } else {
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
      setQuestions(allQuestions.filter(q => q.recipient?.username === username && q.is_answered));
    }
    setLoading(false);
  }, [username]);

  const isOwner = currentUser?.username === username;

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'answered') return q.is_answered;
    if (filter === 'unanswered') return !q.is_answered;
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
    questionsReceived: questions.length + (isOwner ? questions.filter(q => !q.is_answered).length : 0),
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
          <button
            className="px-6 py-2 rounded-xl font-medium"
            style={{ 
              backgroundColor: 'var(--btn-bg)', 
              color: 'var(--btn-text)' 
            }}
          >
            Ask Question
          </button>
        </a>
      </div>

      <div className="flex gap-2 justify-center">
        {(['all', 'answered'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize"
            style={{ 
              backgroundColor: filter === f ? 'var(--btn-bg)' : 'transparent',
              color: filter === f ? 'var(--btn-text)' : 'var(--text-primary)',
              border: '1px solid rgba(128,128,128,0.2)'
            }}
          >
            {f}
          </button>
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
