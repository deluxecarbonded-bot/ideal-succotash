import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/lib/database';
import { Question, Profile, User } from '@/types';
import { 
  getPublicQuestions, 
  getQuestionsForProfile, 
  getProfileByUsername,
  getProfileById,
  updateProfile as updateProfileDb,
  getUserLikes,
  likeQuestion,
  unlikeQuestion,
  checkUserLiked,
  getQuestionById
} from '@/lib/database';

export function useRealtimeProfile(userId?: string, username?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    let data = null;
    if (username) {
      data = await getProfileByUsername(username);
    } else if (userId) {
      data = await getProfileById(userId);
    }
    setProfile(data);
    setLoading(false);
  }, [username, userId]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!userId) return null;
    const updated = await updateProfileDb(userId, updates);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profiles`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, (payload) => {
        if (payload.new.id === userId) {
          setProfile(payload.new as Profile);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, loading, error, updateProfile };
}

export function useRealtimeProfileQuestions(profileId: string, includePrivate: boolean = false) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    if (!profileId || profileId === '') {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getQuestionsForProfile(profileId, includePrivate);
    setQuestions(data);
    setLoading(false);
  }, [profileId, includePrivate]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`profile_questions_${profileId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, async (payload: any) => {
        const newQuestion = await getQuestionById(payload.new.id);
        if (newQuestion && (includePrivate || newQuestion.is_answered)) {
          setQuestions(prev => [newQuestion, ...prev]);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, (payload: any) => {
        setQuestions(prev => prev.map(q => 
          q.id === payload.new.id ? { ...q, ...payload.new } : q
        ));
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, (payload: any) => {
        setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, includePrivate]);

  return { questions, loading, error, refetch: loadQuestions };
}

export function useRealtimePublicQuestions(limit: number = 50) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPublicQuestions = useCallback(async () => {
    setLoading(true);
    const data = await getPublicQuestions(limit);
    setQuestions(data);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    loadPublicQuestions();
  }, [loadPublicQuestions]);

  useEffect(() => {
    const channel = supabase
      .channel('public_questions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions'
      }, () => {
        loadPublicQuestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPublicQuestions]);

  return { questions, loading, refetch: loadPublicQuestions };
}

export function useRealtimeLikes(userId?: string) {
  const [likedQuestions, setLikedQuestions] = useState<string[]>([]);

  const loadLikes = useCallback(async () => {
    if (!userId) {
      setLikedQuestions([]);
      return;
    }
    const likes = await getUserLikes(userId);
    setLikedQuestions(likes);
  }, [userId]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  const toggleLike = useCallback(async (questionId: string) => {
    if (!userId) return;
    
    const isCurrentlyLiked = likedQuestions.includes(questionId);
    
    if (isCurrentlyLiked) {
      await unlikeQuestion(questionId, userId);
      setLikedQuestions(prev => prev.filter(id => id !== questionId));
    } else {
      await likeQuestion(questionId, userId);
      setLikedQuestions(prev => [...prev, questionId]);
    }
  }, [userId, likedQuestions]);

  const isLiked = useCallback((questionId: string) => {
    return likedQuestions.includes(questionId);
  }, [likedQuestions]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user_likes_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'likes',
        filter: `user_id=eq.${userId}`
      }, () => {
        loadLikes();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadLikes]);

  return { likedQuestions, toggleLike, isLiked, loadLikes };
}

export function useRealtimeQuestion(questionId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getQuestionById(questionId);
      setQuestion(data);
      setLoading(false);
    }
    load();
  }, [questionId]);

  useEffect(() => {
    const channel = supabase
      .channel(`question_${questionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'questions',
        filter: `id=eq.${questionId}`
      }, (payload) => {
        setQuestion(prev => prev ? { ...prev, ...payload.new } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [questionId]);

  return { question, loading };
}

export function useRealtimePresence(roomId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const channel = supabase.channel(`presence_${roomId}`, {
      config: { presence: { key: roomId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).filter(k => k !== 'undefined');
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: roomId });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { onlineUsers };
}
