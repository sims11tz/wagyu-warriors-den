-- Create table for storing slicing game results (chefs table leaderboard)
CREATE TABLE public.slicing_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  cuts_made INTEGER NOT NULL,
  perfect_cuts INTEGER NOT NULL,
  cut_type TEXT NOT NULL,
  cut_name TEXT NOT NULL,
  time_left INTEGER DEFAULT 0,
  completion_reason TEXT DEFAULT 'time',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.slicing_results ENABLE ROW LEVEL SECURITY;

-- Create policies for the slicing results table
CREATE POLICY "Users can view all slicing results" 
ON public.slicing_results 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own results" 
ON public.slicing_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance on leaderboard queries
CREATE INDEX idx_slicing_results_score ON public.slicing_results (score DESC, created_at DESC);
CREATE INDEX idx_slicing_results_user ON public.slicing_results (user_id, created_at DESC);