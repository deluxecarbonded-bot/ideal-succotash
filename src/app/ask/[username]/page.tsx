'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Profile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getProfileByUsername, createQuestion } from '@/lib/database';
import QuestionForm from '@/components/QuestionForm';
import { ArrowLeftIcon } from '@/components/Icons';
import Link from 'next/link';

function AskUserContent() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user } = useAuth();
  
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecipient = useCallback(async () => {
    setLoading(true);
    if (username) {
      const profile = await getProfileByUsername(username);
      setRecipient(profile);
    }
    setLoading(false);
  }, [username]);

  useEffect(() => {
    loadRecipient();
  }, [loadRecipient]);

  const handleSubmit = async (content: string, isAnonymous: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!recipient) {
      router.push('/login');
      return;
    }

    const question = await createQuestion({
      content,
      recipient_id: recipient.id,
      author_id: isAnonymous ? null : user.id,
      is_anonymous: isAnonymous,
    });

    if (question) {
      router.push(`/profile/${username}`);
    }
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
