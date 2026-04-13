import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Question, Profile, User } from '@/types';
import { 
  getPublicQuestions, 
  getQuestionsForProfile, 
  getProfileByUsername,
  getProfileById,
  createQuestion,
  answerQuestion,
  deleteQuestion,
  likeQuestion,
  unlikeQuestion,
  getUserLikes,
  updateProfile
} from '@/lib/database';

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPublicQuestions = useCallback(async () => {
    setLoading(true);
    const data = await getPublicQuestions(50);
    setQuestions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPublicQuestions();
  }, [loadPublicQuestions]);

  useEffect(() => {
    const channel = supabase
      .channel('public_questions')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'questions',
        filter: 'is_answered=eq.true'
      }, (payload) => {
        setQuestions(prev => [payload.new as Question, ...prev]);
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'questions' 
      }, (payload) => {
        setQuestions(prev => prev.map(q => 
          q.id === payload.new.id ? { ...q, ...payload.new } : q
        ));
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'questions' 
      }, (payload) => {
        setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { questions, loading, error, refetch: loadPublicQuestions };
}

export function useProfileQuestions(profileId: string, includePrivate: boolean = false) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const data = await getQuestionsForProfile(profileId, includePrivate);
    setQuestions(data);
    setLoading(false);
  }, [profileId, includePrivate]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const channel = supabase
      .channel(`profile_questions_${profileId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, (payload) => {
        const newQ = payload.new as Question;
        if (includePrivate || newQ.is_answered) {
          setQuestions(prev => [newQ, ...prev]);
        }
      })
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, (payload) => {
        setQuestions(prev => prev.map(q => 
          q.id === payload.new.id ? { ...q, ...payload.new } : q
        ));
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'questions',
        filter: `recipient_id=eq.${profileId}`
      }, (payload) => {
        setQuestions(prev => prev.filter(q => q.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, includePrivate]);

  const handleCreate = async (question: {
    content: string;
    recipient_id: string;
    author_id?: string | null;
    is_anonymous?: boolean;
  }) => {
    return await createQuestion(question);
  };

  const handleAnswer = async (questionId: string, answer: string) => {
    const updated = await answerQuestion(questionId, answer);
    if (updated) {
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, answer, is_answered: true } : q
      ));
    }
    return updated;
  };

  const handleDelete = async (questionId: string) => {
    const success = await deleteQuestion(questionId);
    if (success) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
    return success;
  };

  return { 
    questions, 
    loading, 
    error, 
    refetch: loadQuestions,
    createQuestion: handleCreate,
    answerQuestion: handleAnswer,
    deleteQuestion: handleDelete
  };
}

export function useProfile(username?: string, userId?: string) {
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!username) return;

    const channel = supabase
      .channel(`profile_${username}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `username=eq.${username}`
      }, (payload) => {
        setProfile(prev => prev ? { ...prev, ...payload.new } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const handleUpdate = async (updates: Partial<Profile>) => {
    if (!profile) return null;
    const updated = await updateProfile(profile.id, updates);
    if (updated) {
      setProfile(updated);
    }
    return updated;
  };

  return { profile, loading, error, refetch: loadProfile, updateProfile: handleUpdate };
}

export function useLikes(userId?: string) {
  const [likedQuestions, setLikedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLikes = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const likes = await getUserLikes(userId);
    setLikedQuestions(likes);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadLikes();
  }, [loadLikes]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user_likes_${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'likes',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newLike = payload.new as { question_id: string };
        setLikedQuestions(prev => [...prev, newLike.question_id]);
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'likes',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const oldLike = payload.old as { question_id: string };
        setLikedQuestions(prev => prev.filter(id => id !== oldLike.question_id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggleLike = async (questionId: string) => {
    if (!userId) return false;
    
    const isLiked = likedQuestions.includes(questionId);
    let success = false;
    
    if (isLiked) {
      success = await unlikeQuestion(questionId, userId);
      if (success) {
        setLikedQuestions(prev => prev.filter(id => id !== questionId));
      }
    } else {
      success = await likeQuestion(questionId, userId);
      if (success) {
        setLikedQuestions(prev => [...prev, questionId]);
      }
    }
    
    return success;
  };

  const isLiked = (questionId: string) => likedQuestions.includes(questionId);

  return { likedQuestions, loading, refetch: loadLikes, toggleLike, isLiked };
}

export function useQuestionRealtime(questionId: string) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

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

  const updateQuestion = (updates: Partial<Question>) => {
    setQuestion(prev => prev ? { ...prev, ...updates } : null);
  };

  return { question, updateQuestion };
}

export function useAuthRealtime() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getProfileById(session.user.id);
        setUser(profile);
      }
      setLoading(false);
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await getProfileById(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
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
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences);
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
