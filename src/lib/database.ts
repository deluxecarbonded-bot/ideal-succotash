'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, Profile, Question, Like } from '@/types';

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

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !data) return null;
  return data as Profile;
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
  
  if (error || !data) return null;
  return data as Profile;
}

export async function getQuestionsForProfile(recipientId: string, includePrivate: boolean = false): Promise<Question[]> {
  let query = supabase
    .from('questions')
    .select('*, profiles!recipient_id(username, avatar_url)')
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false });

  if (!includePrivate) {
    query = query.eq('is_answered', true);
  }

  const { data, error } = await query;
  
  if (error) return [];
  return (data || []).map((q: any) => ({
    ...q,
    recipient: q.profiles,
  }));
}

export async function getPublicQuestions(limit: number = 50): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*, profiles!recipient_id(username, avatar_url)')
    .eq('is_answered', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data || []).map((q: any) => ({
    ...q,
    recipient: q.profiles,
  }));
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
    console.error('Error creating question:', error);
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

  if (error || !data) return null;
  return data as Question;
}

export async function deleteQuestion(questionId: string): Promise<boolean> {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  return !error;
}

export async function likeQuestion(questionId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .insert({
      question_id: questionId,
      user_id: userId,
    });

  if (error) return false;

  await supabase
    .from('questions')
    .update({ likes_count: 1 })
    .eq('id', questionId);

  return true;
}

export async function unlikeQuestion(questionId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('question_id', questionId)
    .eq('user_id', userId);

  if (error) return false;

  await supabase
    .from('questions')
    .update({ likes_count: -1 })
    .eq('id', questionId);

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

  if (error) return [];
  return (data || []).map(l => l.question_id);
}

export async function searchUsers(query: string, limit: number = 10): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(limit);

  if (error) return [];
  return data || [];
}
