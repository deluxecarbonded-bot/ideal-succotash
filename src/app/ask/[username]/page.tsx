'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Question, User } from '@/types';
import { useAuth } from '@/context/AuthContext';
import QuestionForm from '@/components/QuestionForm';
import { ArrowLeftIcon } from '@/components/Icons';
import Link from 'next/link';

function AskUserContent() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user } = useAuth();
  
  const [recipient, setRecipient] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      const stored = localStorage.getItem('exotic-user');
      if (stored) {
        const storedUser: User = JSON.parse(stored);
        if (storedUser.username === username) {
          setRecipient(storedUser);
        } else {
          setRecipient({
            id: 'user-' + username,
            username,
            bio: '',
            avatar_url: null,
            created_at: new Date().toISOString(),
          });
        }
      } else {
        setRecipient({
          id: 'user-' + username,
          username,
          bio: '',
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
      }
    }
    setLoading(false);
  }, [username]);

  const handleSubmit = (content: string, isAnonymous: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const stored = localStorage.getItem('exotic-questions');
    let questions: Question[] = stored ? JSON.parse(stored) : [];

    const newQuestion: Question = {
      id: 'q-' + Date.now(),
      content,
      author_id: isAnonymous ? null : user.id,
      recipient_id: recipient?.id || '',
      answer: null,
      is_answered: false,
      is_anonymous: isAnonymous,
      likes_count: 0,
      created_at: new Date().toISOString(),
      recipient: recipient || undefined,
      author: isAnonymous ? null : user,
    };

    questions.push(newQuestion);
    localStorage.setItem('exotic-questions', JSON.stringify(questions));

    router.push(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href={`/profile/${username}`}>
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
        className="text-center"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Ask @{username}
        </h1>
        <p className="mt-2 opacity-60" style={{ color: 'var(--text-primary)' }}>
          Send an anonymous question
        </p>
      </motion.div>

      <QuestionForm
        recipientUsername={username}
        onSubmit={handleSubmit}
        placeholder="What would you like to ask?"
      />
    </div>
  );
}

export default function AskUserPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    }>
      <AskUserContent />
    </Suspense>
  );
}
