-- Supabase Schema for Task Management Application
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eokyzoktstqwbkzpqndd/sql/new

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category TEXT DEFAULT 'Work',
    due_date TIMESTAMPTZ,
    subtasks JSONB DEFAULT '[]'::jsonb,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create index for faster querying by user and status
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow users to view their own tasks (or demo tasks where user_id is null)
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
TO authenticated, anon
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR user_id IS NULL
);

-- Allow users to insert tasks with their user_id
CREATE POLICY "Users can create tasks"
ON public.tasks
FOR INSERT
TO authenticated, anon
WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR user_id IS NULL
);

-- Allow users to update their own tasks
CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
TO authenticated, anon
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR user_id IS NULL
)
WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR user_id IS NULL
);

-- Allow users to delete their own tasks
CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
TO authenticated, anon
USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR user_id IS NULL
);

-- 5. Enable Realtime updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
