-- Supabase Schema for AdmitPath (7-Step Flow)

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a safe empty profile automatically after Supabase Auth registration.
-- Passwords and auth credentials stay in auth.users; this table stores app data only.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (uid) VALUES (NEW.id)
  ON CONFLICT (uid) DO NOTHING;
  RETURN NEW;
END;
$$;

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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Diagnoses table
CREATE TABLE IF NOT EXISTS public.diagnoses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id TEXT,
  tier TEXT,
  match_score INT,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (uid, university_id)
);

-- 4. Roadmap items table
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id TEXT NOT NULL,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  deadline TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, uid)
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS streaks_set_updated_at ON public.streaks;
CREATE TRIGGER streaks_set_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- PostgREST needs explicit table privileges in addition to RLS policies.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.diagnoses TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.recommendations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roadmap_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.streaks TO authenticated;

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
