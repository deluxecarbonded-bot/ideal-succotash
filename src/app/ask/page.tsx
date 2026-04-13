'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProfileByUsername, getQuestionsForProfile, createQuestion as dbCreateQuestion } from '@/lib/database';
import QuestionForm from '@/components/QuestionForm';
import { ArrowLeftIcon } from '@/components/Icons';
import Link from 'next/link';

function AskPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username') as string | undefined;
  const { user } = useAuth();
  
  const [recipient, setRecipient] = useState<any>(null);
  const [recipientLoading, setRecipientLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
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

  useEffect(() => {
    async function loadQuestions() {
      setQuestionsLoading(false);
    }
    loadQuestions();
  }, [user]);

  const handleSubmit = async (content: string, isAnonymous: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!recipient || recipientLoading || questionsLoading) {
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
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || 'Failed to create question');
      setLoading(false);
      router.push('/login');
    }
  };

  if (recipientLoading || questionsLoading) {
    return (
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/">
        <button className="flex items-center gap-2 opacity-60 hover:opacity-100">
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>
      </Link>

      <div className="text-center py-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {username ? `Ask @${username}` : 'Ask a Question'}
        </h1>
        <p className="mt-2 opacity-60" style={{ color: 'var(--text-primary)' }}>
          {username ? 'Send an anonymous question' : 'Ask yourself or someone else'}
        </p>
      </div>

      <QuestionForm
        recipientUsername={username || undefined}
        onSubmit={handleSubmit}
        loading={loading}
        placeholder={username ? 'What would you like to ask?' : 'What would you like to ask yourself or others?'}
      />
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-8 opacity-50" style={{ color: 'var(--text-primary)' }}>
        Loading...
      </div>
    }>
      <AskPageContent />
    </Suspense>
  );
}
