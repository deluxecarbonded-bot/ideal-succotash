-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answer TEXT,
  is_answered BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create RLS policies for questions
CREATE POLICY "Public questions are viewable by everyone" 
  ON public.questions FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can insert questions" 
  ON public.questions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Recipients can update their questions" 
  ON public.questions FOR UPDATE 
  USING (auth.uid() = recipient_id);

CREATE POLICY "Recipients can delete their questions" 
  ON public.questions FOR DELETE 
  USING (auth.uid() = recipient_id);

-- Create RLS policies for likes
CREATE POLICY "Public likes are viewable by everyone" 
  ON public.likes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert likes" 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" 
  ON public.likes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_recipient_id ON public.questions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_question_id ON public.likes(question_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);

-- Create trigger function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
