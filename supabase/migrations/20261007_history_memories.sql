-- ==============================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር)
-- MIGRATION: 20261007_history_memories.sql
-- FOCUS: MAHBER HISTORY + DIGITAL MEMORY BOOK + PHOTOS + RLS
-- ==============================================================================

-- 1. GATHERING HISTORY TABLE (Digital Mahber book records)
CREATE TABLE IF NOT EXISTS public.gathering_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id UUID REFERENCES public.gatherings(id) ON DELETE SET NULL,
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  eth_date TEXT NOT NULL,
  greg_date TEXT NOT NULL,
  year_eth TEXT NOT NULL DEFAULT '2019',
  month_name_am TEXT NOT NULL DEFAULT 'መስከረም',
  month_name_en TEXT NOT NULL DEFAULT 'Meskerem',
  location TEXT NOT NULL,
  location_details TEXT,
  attendance_count INTEGER NOT NULL DEFAULT 0,
  member_count INTEGER NOT NULL DEFAULT 10,
  present_members JSONB DEFAULT '[]'::jsonb, -- Array of { id, name, amharicName, avatarUrl } without private reasons!
  mezmur_id UUID REFERENCES public.mezmurs(id) ON DELETE SET NULL,
  mezmur_title_am TEXT,
  mezmur_title_en TEXT,
  summary TEXT,
  summary_am TEXT,
  memory TEXT,
  memory_am TEXT,
  photos JSONB DEFAULT '[]'::jsonb, -- Array of up to 5 photo objects: { id, url, caption, captionAm, uploadedBy, createdAt }
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexing for fast chronological timeline retrieval
CREATE INDEX IF NOT EXISTS idx_gathering_history_mahber_id ON public.gathering_history(mahber_id);
CREATE INDEX IF NOT EXISTS idx_gathering_history_completed_at ON public.gathering_history(completed_at DESC);

-- Enable RLS
ALTER TABLE public.gathering_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All active members of the Mahber can read history records
CREATE POLICY "Mahber members can read history"
  ON public.gathering_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.mahber_id = gathering_history.mahber_id
        AND memberships.user_id = auth.uid()
        AND memberships.is_active = true
    )
  );

-- RLS Policy: Only the 2 Mahber administrators can create or edit official history
CREATE POLICY "Only admins can insert or update history"
  ON public.gathering_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.mahber_id = gathering_history.mahber_id
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
        AND memberships.is_active = true
    )
  );

-- 2. PHOTO STORAGE SECURITY POLICY MOCK NOTE:
-- Private bucket 'mahber-memories':
-- Restricted strictly to authenticated members of the respective mahber.
-- Direct public URLs are disabled. Non-members receive 403 Forbidden.
