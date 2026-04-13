-- RPC function to increment likes_count
CREATE OR REPLACE FUNCTION public.increment_likes_count(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.questions
  SET likes_count = COALESCE(likes_count, 0) + 1
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC function to decrement likes_count
CREATE OR REPLACE FUNCTION public.decrement_likes_count(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.questions
  SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add composite index for likes
CREATE INDEX IF NOT EXISTS idx_likes_user_question ON public.likes(user_id, question_id);

-- Add index for questions author
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
