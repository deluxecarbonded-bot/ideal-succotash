export interface User {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  content: string;
  author_id: string | null;
  recipient_id: string;
  answer: string | null;
  is_answered: boolean;
  is_anonymous: boolean;
  likes_count: number;
  created_at: string;
  recipient?: User;
  author?: User | null;
  is_liked?: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}
