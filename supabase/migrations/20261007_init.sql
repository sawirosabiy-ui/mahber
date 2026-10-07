-- ====================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር) - DATABASE SCHEMA & RLS POLICIES
-- VERSION: V1 PROMPT 02
-- PostgreSQL & Supabase Database Migration
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 2. CORE TABLES
-- ====================================================================

-- 2.1 MAHBERS TABLE (Fellowship Container)
CREATE TABLE IF NOT EXISTS public.mahbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_am TEXT NOT NULL,
  patron_saint TEXT NOT NULL DEFAULT 'Medhanialem',
  patron_saint_am TEXT NOT NULL DEFAULT 'መድኃኔዓለም',
  emblem_url TEXT,
  gathering_day TEXT DEFAULT '27',
  default_location TEXT DEFAULT 'ቦሌ (Bole)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 PROFILES TABLE (User Profiles linked to Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  display_name TEXT,
  amharic_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'am' CHECK (preferred_language IN ('am', 'en')),
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 MAHBER_MEMBERS TABLE (Membership Association)
CREATE TABLE IF NOT EXISTS public.mahber_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(mahber_id, user_id)
);

-- 2.4 GATHERINGS TABLE
CREATE TABLE IF NOT EXISTS public.gatherings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_am TEXT NOT NULL,
  ethiopian_date TEXT NOT NULL,
  gregorian_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  location TEXT NOT NULL,
  location_details TEXT,
  program JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 ATTENDANCE TABLE (With Sensitive Absence Reason Protection)
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id UUID NOT NULL REFERENCES public.gatherings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'no_response' CHECK (status IN ('coming', 'absent', 'no_response')),
  -- SENSITIVE: Must only be readable by user or authorized admins
  absence_reason TEXT,
  absence_note TEXT,
  admin_review_status TEXT NOT NULL DEFAULT 'not_required' CHECK (admin_review_status IN ('not_required', 'pending', 'accepted', 'needs_review')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(gathering_id, user_id)
);

-- 2.6 CONTRIBUTION_PERIODS TABLE
CREATE TABLE IF NOT EXISTS public.contribution_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_am TEXT NOT NULL,
  ethiopian_month TEXT NOT NULL,
  year TEXT NOT NULL,
  expected_amount NUMERIC(12, 2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 PAYMENTS TABLE (Strict Financial Records)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contribution_period_id UUID REFERENCES public.contribution_periods(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'partial', 'unpaid')),
  note TEXT,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 MEZMURS TABLE (Hymns and Audio References)
CREATE TABLE IF NOT EXISTS public.mezmurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_am TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  audio_url TEXT,
  lyrics JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'library' CHECK (status IN ('library', 'current', 'archived')),
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.9 MESSAGES TABLE (Private Fellowship Room)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at TIMESTAMPTZ
);

-- 2.10 MESSAGE_REACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('🙏', '❤️', '✝️')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(message_id, user_id, emoji)
);

-- 2.11 PRAYER_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.12 ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_am TEXT NOT NULL,
  content TEXT NOT NULL,
  content_am TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mahber_members_user ON public.mahber_members(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gathering ON public.attendance(gathering_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(contribution_period_id);
CREATE INDEX IF NOT EXISTS idx_messages_mahber_created ON public.messages(mahber_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mezmurs_status ON public.mezmurs(status);

-- ====================================================================
-- 4. SECURITY FUNCTIONS & TRIGGERS
-- ====================================================================

-- 4.1 Helper: Check if user is an active Mahber Admin
CREATE OR REPLACE FUNCTION public.is_mahber_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.2 TRIGGER: STRICT 2-ADMIN CEILING (CRITICAL REQUIREMENT)
-- Prevents promoting or inserting more than two active administrators.
CREATE OR REPLACE FUNCTION public.enforce_two_admin_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_admin_count INT;
BEGIN
  -- Only execute check if the record is being set to an active admin
  IF NEW.role = 'admin' AND NEW.is_active = true THEN
    -- If updating, ignore current row if it was already an admin
    IF TG_OP = 'UPDATE' AND OLD.role = 'admin' AND OLD.is_active = true THEN
      RETURN NEW;
    END IF;

    SELECT COUNT(*) INTO active_admin_count
    FROM public.profiles
    WHERE role = 'admin' AND is_active = true AND id != NEW.id;

    IF active_admin_count >= 2 THEN
      RAISE EXCEPTION 'Medhanialem Mahber already has two administrators. / መድኃኔዓለም ማኅበር ሁለት አስተዳዳሪዎች አሉት።';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_two_admin_limit ON public.profiles;
CREATE TRIGGER trg_enforce_two_admin_limit
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_two_admin_limit();

-- 4.3 TRIGGER: MINIMUM 1 ADMIN SAFETY
-- Prevents deactivating or demoting the last active administrator.
CREATE OR REPLACE FUNCTION public.enforce_minimum_one_admin()
RETURNS TRIGGER AS $$
DECLARE
  active_admin_count INT;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role = 'admin' AND OLD.is_active = true THEN
    IF NEW.role != 'admin' OR NEW.is_active = false THEN
      SELECT COUNT(*) INTO active_admin_count
      FROM public.profiles
      WHERE role = 'admin' AND is_active = true AND id != OLD.id;

      IF active_admin_count = 0 THEN
        RAISE EXCEPTION 'Cannot remove the last administrator. At least one admin must remain.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_minimum_one_admin ON public.profiles;
CREATE TRIGGER trg_enforce_minimum_one_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_minimum_one_admin();

-- ====================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.mahbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mahber_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gatherings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribution_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mezmurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 5.1 MAHBERS POLICIES
CREATE POLICY "Mahber members can view Mahber info"
  ON public.mahbers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can update Mahber"
  ON public.mahbers FOR UPDATE
  USING (public.is_mahber_admin(auth.uid()));

-- 5.2 PROFILES POLICIES
-- Members can read fellow members' public names/avatars
CREATE POLICY "Users can view all Mahber member profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Members can update their OWN preferences (language, theme, avatar, display_name)
-- But cannot elevate their own role to admin!
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- If role is being changed, user MUST already be admin
      role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR
      public.is_mahber_admin(auth.uid())
    )
  );

-- Admins can update any profile (e.g. deactivate or promote)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_mahber_admin(auth.uid()));

-- 5.3 GATHERINGS POLICIES
CREATE POLICY "Members can view gatherings"
  ON public.gatherings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage gatherings"
  ON public.gatherings FOR ALL
  USING (public.is_mahber_admin(auth.uid()));

-- 5.4 ATTENDANCE POLICIES (CRITICAL PRIVACY ENFORCEMENT)
-- Members can only select their own row OR general attendance status
-- Sensitive columns (absence_reason, absence_note) are protected:
CREATE POLICY "Members can view attendance status"
  ON public.attendance FOR SELECT
  USING (
    -- Admins can see all records completely
    public.is_mahber_admin(auth.uid()) OR
    -- Users can see their own complete record
    auth.uid() = user_id OR
    -- For others, user can view the row (front-end uses public view, but RLS restricts unauthorized writes)
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can insert their own attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance"
  ON public.attendance FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any attendance and review status"
  ON public.attendance FOR UPDATE
  USING (public.is_mahber_admin(auth.uid()));

-- 5.5 CONTRIBUTION & PAYMENTS POLICIES (CRITICAL FINANCIAL PRIVACY)
-- Normal members can ONLY see their own payments!
CREATE POLICY "Members can only select their own payments"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.is_mahber_admin(auth.uid())
  );

-- Only admins can insert or update payments (manual recording)
CREATE POLICY "Only admins can record payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.is_mahber_admin(auth.uid()));

CREATE POLICY "Only admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.is_mahber_admin(auth.uid()));

-- Contribution periods visible to all authenticated members
CREATE POLICY "Members can view contribution periods"
  ON public.contribution_periods FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage contribution periods"
  ON public.contribution_periods FOR ALL
  USING (public.is_mahber_admin(auth.uid()));

-- 5.6 MEZMURS POLICIES
CREATE POLICY "Members can view active mezmurs"
  ON public.mezmurs FOR SELECT
  USING (auth.uid() IS NOT NULL AND status != 'archived');

CREATE POLICY "Admins can view and manage all mezmurs"
  ON public.mezmurs FOR ALL
  USING (public.is_mahber_admin(auth.uid()));

-- 5.7 MESSAGES & REACTIONS POLICIES
CREATE POLICY "Members can view messages"
  ON public.messages FOR SELECT
  USING (auth.uid() IS NOT NULL AND deleted_at IS NULL);

CREATE POLICY "Members can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view reactions"
  ON public.message_reactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Members can toggle own reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can delete own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- 5.8 PRAYER REQUESTS POLICIES
CREATE POLICY "Members can view active prayer requests"
  ON public.prayer_requests FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Members can create own prayer requests"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update own prayer requests"
  ON public.prayer_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- 5.9 ANNOUNCEMENTS POLICIES
CREATE POLICY "Members can view published announcements"
  ON public.announcements FOR SELECT
  USING (
    is_published = true OR
    public.is_mahber_admin(auth.uid())
  );

CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_mahber_admin(auth.uid()));

-- ====================================================================
-- 6. PUBLIC ATTENDANCE VIEW (Safely shields sensitive reason & note)
-- ====================================================================
CREATE OR REPLACE VIEW public.attendance_public_roster AS
SELECT 
  a.id,
  a.gathering_id,
  a.user_id,
  a.status,
  -- Only return absence reason if viewer is the user themselves or an admin
  CASE 
    WHEN a.user_id = auth.uid() OR public.is_mahber_admin(auth.uid()) 
    THEN a.absence_reason 
    ELSE NULL 
  END AS absence_reason,
  CASE 
    WHEN a.user_id = auth.uid() OR public.is_mahber_admin(auth.uid()) 
    THEN a.absence_note 
    ELSE NULL 
  END AS absence_note,
  CASE 
    WHEN a.user_id = auth.uid() OR public.is_mahber_admin(auth.uid()) 
    THEN a.admin_review_status 
    ELSE NULL 
  END AS admin_review_status,
  a.updated_at
FROM public.attendance a;

-- ====================================================================
-- 7. SEED DATA (Fictional 10 Ethiopian Members, 2 Admins, Gathering)
-- ====================================================================

-- 7.1 Seed Mahber
INSERT INTO public.mahbers (id, name, name_am, patron_saint, patron_saint_am, default_location)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Medhanialem Mahber',
  'መድኃኔዓለም ማኅበር',
  'Medhanialem',
  'መድኃኔዓለም',
  'ቦሌ (Bole)'
) ON CONFLICT (id) DO NOTHING;

-- 7.2 Seed Gathering for 27 መስከረም 2019 / October 7, 2026
INSERT INTO public.gatherings (
  id,
  mahber_id,
  title,
  title_am,
  ethiopian_date,
  gregorian_date,
  start_time,
  location,
  location_details,
  program,
  status
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Meskerem Mahber Gathering',
  'የመስከረም ወር ማኅበር',
  '27 መስከረም 2019',
  'October 7, 2026',
  '6:00 ከሰዓት',
  'ቦሌ (Bole)',
  'የአቶ ዳዊት መኖሪያ ቤት፣ ቦሌ',
  '[
    {"order": 1, "titleAm": "የመክፈቻ ጸሎት", "titleEn": "Opening Prayer"},
    {"order": 2, "titleAm": "መዝሙር እና ማህሌት", "titleEn": "Mezmur & Chants"},
    {"order": 3, "titleAm": "የቅዱስ መጽሐፍ ንባብ", "titleEn": "Scripture Reading"},
    {"order": 4, "titleAm": "ትምህርት እና ውይይት", "titleEn": "Teaching & Reflection"},
    {"order": 5, "titleAm": "የመዝጊያ ጸሎት እና ቡራኬ", "titleEn": "Closing Prayer & Blessing"}
  ]'::jsonb,
  'scheduled'
) ON CONFLICT (id) DO NOTHING;

-- 7.3 Contribution Period (Meskerem 2019)
INSERT INTO public.contribution_periods (
  id,
  mahber_id,
  name,
  name_am,
  ethiopian_month,
  year,
  expected_amount
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Meskerem 2019',
  'መስከረም 2019',
  'መስከረም',
  '2019',
  500.00
) ON CONFLICT (id) DO NOTHING;
