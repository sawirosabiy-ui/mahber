-- ==============================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር)
-- MIGRATION: 20261007_mezmur_study.sql
-- FOCUS: MEZMUR LIBRARY + STUDY PLANS + PRACTICE SESSIONS + SUGGESTIONS + FAVORITES
-- ==============================================================================

-- 1. EXTEND MEZMURS TABLE
ALTER TABLE public.mezmurs
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS description_am TEXT,
  ADD COLUMN IF NOT EXISTS lyrics_am TEXT,
  ADD COLUMN IF NOT EXISTS lyrics_en TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'am',
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- 2. MEZMUR SUGGESTIONS TABLE (Member Recommendations)
CREATE TABLE IF NOT EXISTS public.mezmur_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  suggested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  title_am TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. GATHERING_MEZMURS TABLE
CREATE TABLE IF NOT EXISTS public.gathering_mezmurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id UUID NOT NULL REFERENCES public.gatherings(id) ON DELETE CASCADE,
  mezmur_id UUID NOT NULL REFERENCES public.mezmurs(id) ON DELETE CASCADE,
  selected_by UUID NOT NULL REFERENCES auth.users(id),
  selected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(gathering_id, mezmur_id)
);

-- 4. MEZMUR STUDIES TABLE (Member's active study plan)
CREATE TABLE IF NOT EXISTS public.mezmur_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mezmur_id UUID NOT NULL REFERENCES public.mezmurs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gathering_id UUID REFERENCES public.gatherings(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT, -- Member's private study reflection
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, mezmur_id, gathering_id)
);

-- 5. MEZMUR PRACTICE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.mezmur_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.mezmur_studies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  duration_minutes INTEGER,
  note TEXT, -- Strictly private note
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  -- SPAM PREVENTION: Exactly one check-in per user per study per calendar day
  UNIQUE(user_id, study_id, practice_date)
);

-- 6. USER MEZMUR FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.user_mezmur_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mezmur_id UUID NOT NULL REFERENCES public.mezmurs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, mezmur_id)
);

-- ==============================================================================
-- RLS SECURITY POLICIES
-- ==============================================================================

ALTER TABLE public.mezmur_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gathering_mezmurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mezmur_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mezmur_practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mezmur_favorites ENABLE ROW LEVEL SECURITY;

-- MEZMUR SUGGESTIONS RLS
CREATE POLICY "Members can insert suggestions" ON public.mezmur_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "Members can view own suggestions" ON public.mezmur_suggestions
  FOR SELECT USING (auth.uid() = suggested_by OR is_mahber_admin(auth.uid(), mahber_id));

CREATE POLICY "Admins can review suggestions" ON public.mezmur_suggestions
  FOR UPDATE USING (is_mahber_admin(auth.uid(), mahber_id))
  WITH CHECK (is_mahber_admin(auth.uid(), mahber_id));

-- GATHERING_MEZMURS RLS
CREATE POLICY "Members can view gathering mezmurs" ON public.gathering_mezmurs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN public.gatherings g ON g.mahber_id = m.mahber_id
      WHERE g.id = gathering_id AND m.user_id = auth.uid() AND m.status = 'active'
    )
  );

CREATE POLICY "Admins can manage gathering mezmurs" ON public.gathering_mezmurs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gatherings g
      WHERE g.id = gathering_id AND is_mahber_admin(auth.uid(), g.mahber_id)
    )
  );

-- MEZMUR STUDIES RLS
CREATE POLICY "Members manage own studies" ON public.mezmur_studies
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view member study status" ON public.mezmur_studies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin' AND m.status = 'active'
    )
  );

-- MEZMUR PRACTICE SESSIONS RLS
CREATE POLICY "Members manage own practice sessions" ON public.mezmur_practice_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view practice timestamps" ON public.mezmur_practice_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin' AND m.status = 'active'
    )
  );

-- USER FAVORITES RLS
CREATE POLICY "Users manage own favorites" ON public.user_mezmur_favorites
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
