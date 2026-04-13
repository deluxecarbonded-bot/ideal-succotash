'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getProfileByUsername, createQuestion as dbCreateQuestion } from '@/lib/database';
import QuestionForm from '@/components/QuestionForm';
import { ArrowLeftIcon } from '@/components/Icons';
import Link from 'next/link';

function AskUserContent() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { user } = useAuth();
  
  const [recipient, setRecipient] = useState<any>(null);
  const [recipientLoading, setRecipientLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecipient() {
      if (username) {
        const data = await getProfileByUsername(username);
        setRecipient(data);
      }
      setRecipientLoading(false);
    }
    loadRecipient();
  }, [username]);

  const handleSubmit = async (content: string, isAnonymous: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!recipient || recipientLoading) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await dbCreateQuestion({
        content,
        recipient_id: recipient.id,
        author_id: isAnonymous ? null : user.id,
        is_anonymous: isAnonymous,
      });

      setLoading(false);
      router.push(`/profile/${username}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create question');
      setLoading(false);
      router.push('/login');
    }
  };

  if (recipientLoading) {
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
        loading={loading}
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
