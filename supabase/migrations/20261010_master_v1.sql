-- ====================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር) - MASTER V1 SCHEMA & RLS
-- PostgreSQL & Supabase Database Migration
-- Canonical 11 Members, Painting Rotation, Shared Fund, Penalties & Voting
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAIN TYPES
DO $$ BEGIN
  CREATE TYPE public.member_admin_role AS ENUM (
    'super_admin',
    'management_admin',
    'finance_admin',
    'attendance_admin',
    'mezmur_admin'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.penalty_type AS ENUM (
    'late_arrival',
    'unexcused_absence',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.penalty_status AS ENUM (
    'pending',
    'paid',
    'waived'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.proposal_category AS ENUM (
    'charity',
    'hospitality',
    'sacred_art',
    'bereavement',
    'event',
    'transport_subsidy',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. CORE ROSTER TABLE (11 CANONICAL MEMBERS)
CREATE TABLE IF NOT EXISTS public.mahber_roster_v1 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amharic_name TEXT NOT NULL,
  baptismal_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  spiritual_role TEXT,
  spiritual_duty_am TEXT,
  lives_abroad BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Granular Admin Roles table
CREATE TABLE IF NOT EXISTS public.member_admin_roles_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id) ON DELETE CASCADE,
  role public.member_admin_role NOT NULL,
  assigned_by TEXT REFERENCES public.mahber_roster_v1(id),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_id, role)
);

-- Single-Use Member Invitations
CREATE TABLE IF NOT EXISTS public.member_invitations_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by TEXT REFERENCES public.mahber_roster_v1(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ
);

-- 4. SACRED PAINTING ROTATION & HOSTING SWAPS
CREATE TABLE IF NOT EXISTS public.painting_rotation_state_v1 (
  id TEXT PRIMARY KEY DEFAULT 'current_state',
  current_holder_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  next_assigned_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  scheduled_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  current_gathering_location TEXT NOT NULL,
  rotation_order TEXT[] NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.hosting_swaps_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  original_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  substitute_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  reason TEXT NOT NULL,
  reason_am TEXT NOT NULL,
  approved_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.painting_handovers_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  from_member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  to_member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  confirmed_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  recorded_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  notes TEXT
);

-- 5. ATTENDANCE & PENALTIES
CREATE TABLE IF NOT EXISTS public.gathering_attendance_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  rsvp_status TEXT NOT NULL CHECK (rsvp_status IN ('coming', 'cant_come', 'unresponded')),
  private_reason TEXT, -- Restricted to admins
  private_note TEXT,   -- Restricted to admins
  actual_status TEXT CHECK (actual_status IN ('PRESENT', 'LATE', 'EXCUSED', 'ABSENT')),
  arrival_time TIMESTAMPTZ,
  recorded_by TEXT REFERENCES public.mahber_roster_v1(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(gathering_id, member_id)
);

CREATE TABLE IF NOT EXISTS public.penalties_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  gathering_id TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  type public.penalty_type NOT NULL,
  reason TEXT NOT NULL,
  reason_am TEXT NOT NULL,
  status public.penalty_status NOT NULL DEFAULT 'pending',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  paid_at TIMESTAMPTZ,
  waived_at TIMESTAMPTZ,
  waived_by TEXT REFERENCES public.mahber_roster_v1(id),
  waive_reason TEXT
);

-- 6. SHARED FUND & SPENDING PROPOSALS (MAJORITY VOTE)
CREATE TABLE IF NOT EXISTS public.shared_fund_transactions_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category public.proposal_category NOT NULL,
  description TEXT NOT NULL,
  description_am TEXT NOT NULL,
  member_id TEXT REFERENCES public.mahber_roster_v1(id),
  proposal_id UUID,
  recorded_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.spending_proposals_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_am TEXT NOT NULL,
  description TEXT NOT NULL,
  description_am TEXT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  category public.proposal_category NOT NULL,
  proposed_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  proposed_by_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'approved', 'rejected', 'executed', 'cancelled')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.proposal_votes_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.spending_proposals_v1(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  vote TEXT NOT NULL CHECK (vote IN ('in_favor', 'against', 'abstain')),
  comment TEXT,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(proposal_id, member_id) -- Invariant: exactly 1 vote per member
);

-- 7. TRANSPORT COLLECTIONS
CREATE TABLE IF NOT EXISTS public.transport_collections_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  title TEXT NOT NULL,
  title_am TEXT NOT NULL,
  destination TEXT NOT NULL,
  agreed_amount_per_member NUMERIC(10,2) NOT NULL CHECK (agreed_amount_per_member > 0),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.transport_payments_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.transport_collections_v1(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  receipt_note TEXT,
  UNIQUE(collection_id, member_id)
);

-- 8. CANONICAL ROSTER SEED (EXACT 11 MEMBERS)
INSERT INTO public.mahber_roster_v1 (id, name, amharic_name, baptismal_name, phone, email, spiritual_role, spiritual_duty_am, lives_abroad, is_active, avatar_url)
VALUES
  ('mem_1', 'Sawiros Abiy', 'ሳዊሮስ አብይ', 'ወልደ ኢየሱስ', '+251 91 123 4567', 'sawiros@mahber.org', 'Super Admin, Finance Admin, Attendance Admin', 'ዋና አስተዳዳሪና የበላይ አስተባባሪ', false, true, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
  ('mem_2', 'Natnael Endale', 'ናትናኤል እንዳለ', 'ገብረ መስቀል', '+251 92 234 5678', 'natnael@mahber.org', 'Attendance Admin, Finance Admin', 'የተሳትፎ እና የሒሳብ ረዳት አስተዳዳሪ', false, true, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
  ('mem_3', 'Bereket Mikre', 'በረከት ምክሬ', 'ኃይለ ሚካኤል', '+251 93 345 6789', 'bereket@mahber.org', 'Member', 'የስብከተ ወንጌል እና አገልግሎት ተካፋይ', false, true, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'),
  ('mem_4', 'Nahom Wondu', 'ናሆም ወንዱ', 'ተክለ ሃይማኖት', '+251 94 456 7890', 'nahom@mahber.org', 'Member', 'የማኅበራዊ ጉዳዮች እና መረዳጃ ተካፋይ', false, true, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'),
  ('mem_5', 'Fisiha', 'ፍስሐ', 'ገብረ ጊዮርጊስ', '+1 202 555 0199', 'fisiha@mahber.org', 'Member (Abroad)', 'የውጭ ሀገር ነዋሪ ንቁ አባል', true, true, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'),
  ('mem_6', 'Elias Roba', 'ኤልያስ ሮባ', 'ወልደ ቂርቆስ', '+251 95 567 8901', 'elias@mahber.org', 'Mezmur Admin', 'የመዝሙር አስተባባሪና መሪ', false, true, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('mem_7', 'Yohannes Roba', 'ዮሐንስ ሮባ', 'ዮሐንስ', '+251 96 678 9012', 'yohannes@mahber.org', 'Member', 'የስርዓት እና ሥነ-ሥርዓት ተካፋይ', false, true, 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'),
  ('mem_8', 'Mikiyas Birhanu', 'ሚኪያስ ብርሃኑ', 'ገብረ ማርያም', '+251 97 789 0123', 'mikiyas.b@mahber.org', 'Member', 'የዝግጅት እና የእንግዳ ተቀባይነት ተካፋይ', false, true, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'),
  ('mem_9', 'Mikiyas Cmc', 'ሚኪያስ ሲኤምሲ', 'ተስፋ ሚካኤል', '+251 98 890 1234', 'mikiyas.c@mahber.org', 'Member', 'የመስተንግዶ እና አገልግሎት ተካፋይ', false, true, 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'),
  ('mem_10', 'Samuel Muse', 'ሳሙኤል ሙሴ', 'ሙሴ', '+251 99 901 2345', 'samuel@mahber.org', 'Management Admin / Bible Teacher Lead ("Moses")', 'የመጽሐፍ ቅዱስ ንባብና ትምህርት መሪ', false, true, 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80'),
  ('mem_11', 'Simon Beyene', 'ስምዖን በየነ', 'ስምዖን', '+251 90 012 3456', 'simon@mahber.org', 'Member', 'የበጎ አድራጎት እና የማኅበር አገልግሎት ተካፋይ', false, true, 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  amharic_name = EXCLUDED.amharic_name,
  baptismal_name = EXCLUDED.baptismal_name,
  spiritual_role = EXCLUDED.spiritual_role,
  spiritual_duty_am = EXCLUDED.spiritual_duty_am,
  lives_abroad = EXCLUDED.lives_abroad;

-- SEED ADMIN ROLES
INSERT INTO public.member_admin_roles_v1 (member_id, role)
VALUES
  ('mem_1', 'super_admin'),
  ('mem_1', 'finance_admin'),
  ('mem_1', 'attendance_admin'),
  ('mem_2', 'attendance_admin'),
  ('mem_2', 'finance_admin'),
  ('mem_6', 'mezmur_admin'),
  ('mem_10', 'management_admin')
ON CONFLICT (member_id, role) DO NOTHING;

-- SEED INITIAL PAINTING ROTATION
INSERT INTO public.painting_rotation_state_v1 (
  id,
  current_holder_id,
  next_assigned_host_id,
  scheduled_host_id,
  current_gathering_location,
  rotation_order
) VALUES (
  'current_state',
  'mem_1',
  'mem_2',
  'mem_2',
  'ቦሌ (Bole) - የአቶ ሳዊሮስ አብይ መኖሪያ ቤት',
  ARRAY['mem_1', 'mem_2', 'mem_3', 'mem_4', 'mem_5', 'mem_6', 'mem_7', 'mem_8', 'mem_9', 'mem_10', 'mem_11']
) ON CONFLICT (id) DO NOTHING;

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.mahber_roster_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_admin_roles_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_invitations_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.painting_rotation_state_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_swaps_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.painting_handovers_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gathering_attendance_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penalties_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_fund_transactions_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spending_proposals_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_votes_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_collections_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_payments_v1 ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view roster and public rotation
CREATE POLICY "Public read for authenticated members on roster"
  ON public.mahber_roster_v1 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public read for authenticated members on painting rotation"
  ON public.painting_rotation_state_v1 FOR SELECT
  TO authenticated
  USING (true);

-- Privacy Boundary: Gathering Attendance private reasons only accessible by admins
CREATE POLICY "Members view attendance presence but private reasons restricted"
  ON public.gathering_attendance_v1 FOR SELECT
  TO authenticated
  USING (
    -- Member can see their own full record OR admins can see all records
    auth.uid()::text = member_id OR
    EXISTS (
      SELECT 1 FROM public.member_admin_roles_v1 ar
      WHERE ar.member_id = auth.uid()::text AND ar.role IN ('super_admin', 'attendance_admin', 'management_admin')
    )
  );

-- Shared Fund Transactions visible to all members
CREATE POLICY "Members view shared fund ledger"
  ON public.shared_fund_transactions_v1 FOR SELECT
  TO authenticated
  USING (true);

-- Spending Proposals & Votes visible to all members
CREATE POLICY "Members view proposals"
  ON public.spending_proposals_v1 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members submit single vote on proposal"
  ON public.proposal_votes_v1 FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = member_id);

CREATE POLICY "Members view proposal votes"
  ON public.proposal_votes_v1 FOR SELECT
  TO authenticated
  USING (true);
