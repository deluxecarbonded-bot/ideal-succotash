'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Profile, Question } from '@/types';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export type ProfileRow = {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type QuestionRow = {
  id: string;
  content: string;
  author_id: string | null;
  recipient_id: string;
  answer: string | null;
  is_answered: boolean;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
};

export type LikeRow = {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
};

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !data) return null;
  return data as Profile;
}

export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('username', username)
    .limit(1);
  
  if (error) {
    console.error('Username check error:', error.message);
    return false;
  }

  return data.length === 0;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error || !data) {
    console.error('Error updating profile:', error?.message);
    return null;
  }
  return data as Profile;
}

export async function getQuestionsForProfile(recipientId: string, includePrivate: boolean = false): Promise<Question[]> {
  if (!recipientId || recipientId === '') {
    console.error('Invalid recipientId: empty string');
    return [];
  }

  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(recipientId);
  if (!isValidUuid) {
    console.error('Invalid recipientId: not a valid UUID:', recipientId);
    return [];
  }

  let query = supabase
    .from('questions')
    .select('*')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false });

  if (!includePrivate) {
    query = query.eq('is_answered', true);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching questions:', error.message);
    return [];
  }

  const questions = data || [];
  const questionsWithProfiles: Question[] = await Promise.all(
    questions.map(async (q: any) => {
      const [{ data: recipientProfile }, { data: authorProfile }] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').eq('id', q.recipient_id).single(),
        !q.is_anonymous && q.author_id 
          ? supabase.from('profiles').select('id, username, avatar_url').eq('id', q.author_id).single()
          : { data: null }
      ]);

      return {
        ...q,
        recipient: recipientProfile,
        author: authorProfile,
      };
    })
  );

  return questionsWithProfiles;
}

export async function getPublicQuestions(limit: number = 50): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('is_answered', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching public questions:', error.message);
    return [];
  }

  const questions = data || [];
  const questionsWithProfiles: Question[] = await Promise.all(
    questions.map(async (q: any) => {
      const [{ data: recipientProfile }, { data: authorProfile }] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').eq('id', q.recipient_id).single(),
        !q.is_anonymous && q.author_id 
          ? supabase.from('profiles').select('id, username, avatar_url').eq('id', q.author_id).single()
          : { data: null }
      ]);

      return {
        ...q,
        recipient: recipientProfile,
        author: authorProfile,
      };
    })
  );

  return questionsWithProfiles;
}

export async function createQuestion(question: {
  content: string;
  recipient_id: string;
  author_id?: string | null;
  is_anonymous?: boolean;
}): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .insert({
      content: question.content,
      recipient_id: question.recipient_id,
      author_id: question.author_id || null,
      is_anonymous: question.is_anonymous ?? true,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Error creating question:', error?.message);
    return null;
  }
  return data as Question;
}

export async function answerQuestion(questionId: string, answer: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .update({
      answer,
      is_answered: true,
    })
    .eq('id', questionId)
    .select()
    .single();

  if (error || !data) {
    console.error('Error answering question:', error?.message);
    return null;
  }
  return data as Question;
}

export async function deleteQuestion(questionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) {
    console.error('Error deleting question:', error.message);
    return false;
  }
  return true;
}

export async function likeQuestion(questionId: string, userId: string): Promise<boolean> {
  const { error: likeError } = await supabase
    .from('likes')
    .insert({
      question_id: questionId,
      user_id: userId,
    });

  if (likeError) {
    console.error('Error liking question:', likeError.message);
    return false;
  }

  const { error: countError } = await supabase
    .rpc('increment_likes_count', { question_id: questionId });

  if (countError) {
    console.error('Error updating likes count:', countError.message);
  }

  return true;
}

export async function unlikeQuestion(questionId: string, userId: string): Promise<boolean> {
  const { error: likeError } = await supabase
    .from('likes')
    .delete()
    .eq('question_id', questionId)
    .eq('user_id', userId);

  if (likeError) {
    console.error('Error unliking question:', likeError.message);
    return false;
  }

  const { error: countError } = await supabase
    .rpc('decrement_likes_count', { question_id: questionId });

  if (countError) {
    console.error('Error updating likes count:', countError.message);
  }

  return true;
}

export async function checkUserLiked(questionId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single();

  return !error && !!data;
}

export async function getUserLikes(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('likes')
    .select('question_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user likes:', error.message);
    return [];
  }
  return (data || []).map(l => l.question_id);
}

export async function searchUsers(query: string, limit: number = 10): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching users:', error.message);
    return [];
  }
  return data || [];
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*, profiles!inner(id, username, avatar_url)')
    .eq('id', questionId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    content: data.content,
    author_id: data.author_id,
    recipient_id: data.recipient_id,
    answer: data.answer,
    is_answered: data.is_answered,
    is_anonymous: data.is_anonymous,
    likes_count: data.likes_count,
    created_at: data.created_at,
    recipient: data.profiles ? {
      id: data.profiles.id,
      username: data.profiles.username,
      bio: data.profiles.bio,
      avatar_url: data.profiles.avatar_url,
      created_at: data.profiles.created_at,
    } : undefined,
  };
}

export async function getQuestionLikes(questionId: string): Promise<number> {
  const { data, error } = await supabase
    .from('likes')
    .select('id', { count: 'exact' })
    .eq('question_id', questionId);

  if (error) return 0;
  return data?.length || 0;
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting account:', error.message);
    return false;
  }
  return true;
}

export async function getUserStats(userId: string): Promise<{
  questionsReceived: number;
  questionsAnswered: number;
  totalLikes: number;
}> {
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('is_answered, likes_count')
    .eq('recipient_id', userId);

  if (qError) {
    console.error('Error fetching user stats:', qError.message);
    return { questionsReceived: 0, questionsAnswered: 0, totalLikes: 0 };
  }

  const questionsReceived = questions?.length || 0;
  const questionsAnswered = questions?.filter(q => q.is_answered).length || 0;
  const totalLikes = questions?.reduce((sum, q) => sum + (q.likes_count || 0), 0) || 0;

  return { questionsReceived, questionsAnswered, totalLikes };
}

export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError.message);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  await updateProfile(userId, { avatar_url: publicUrl });
  return publicUrl;
}
