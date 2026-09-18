-- Supabase Schema for AdmitPath (7-Step Flow)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  grade INT,
  interests TEXT[],
  gpa NUMERIC(4, 2),
  languages TEXT[],
  exams JSONB DEFAULT '{}'::jsonb,
  countries TEXT[],
  budget TEXT,
  timeline TEXT,
  constraints TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Diagnoses table
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  readiness_index INT,
  summary TEXT,
  strengths TEXT[],
  constraints TEXT[],
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id TEXT,
  tier TEXT,
  match_score INT,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Roadmap items table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id TEXT PRIMARY KEY,
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  deadline TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Streaks table
CREATE TABLE IF NOT EXISTS public.streaks (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 1,
  last_visit_date DATE DEFAULT CURRENT_DATE,
  target_university_id TEXT,
  target_university_name TEXT,
  target_program TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own rows (uid = auth.uid())
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = uid);

DROP POLICY IF EXISTS "Users can read own diagnoses" ON public.diagnoses;
CREATE POLICY "Users can read own diagnoses" ON public.diagnoses FOR SELECT USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can insert own diagnoses" ON public.diagnoses;
CREATE POLICY "Users can insert own diagnoses" ON public.diagnoses FOR INSERT WITH CHECK (auth.uid() = uid);

DROP POLICY IF EXISTS "Users can read own recommendations" ON public.recommendations;
CREATE POLICY "Users can read own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.recommendations;
CREATE POLICY "Users can insert own recommendations" ON public.recommendations FOR INSERT WITH CHECK (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can delete own recommendations" ON public.recommendations;
CREATE POLICY "Users can delete own recommendations" ON public.recommendations FOR DELETE USING (auth.uid() = uid);

DROP POLICY IF EXISTS "Users can read own roadmap items" ON public.roadmap_items;
CREATE POLICY "Users can read own roadmap items" ON public.roadmap_items FOR SELECT USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can insert own roadmap items" ON public.roadmap_items;
CREATE POLICY "Users can insert own roadmap items" ON public.roadmap_items FOR INSERT WITH CHECK (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can update own roadmap items" ON public.roadmap_items;
CREATE POLICY "Users can update own roadmap items" ON public.roadmap_items FOR UPDATE USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can delete own roadmap items" ON public.roadmap_items;
CREATE POLICY "Users can delete own roadmap items" ON public.roadmap_items FOR DELETE USING (auth.uid() = uid);

DROP POLICY IF EXISTS "Users can read own streaks" ON public.streaks;
CREATE POLICY "Users can read own streaks" ON public.streaks FOR SELECT USING (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
CREATE POLICY "Users can insert own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = uid);
DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = uid);
