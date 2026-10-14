-- ====================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር) - CRITICAL ARCHITECTURE HARDENING
-- Version: V1 Addendum Hardening (2026-10-14)
-- ====================================================================

-- 1. PARTICIPATION STATUS & AUDIT (REMOTE MEMBER SUPPORT)
DO $$ BEGIN
  ALTER TABLE public.mahber_roster_v1 
    ADD COLUMN IF NOT EXISTS participation_status TEXT NOT NULL DEFAULT 'in_person' CHECK (participation_status IN ('in_person', 'remote')),
    ADD COLUMN IF NOT EXISTS remote_since TIMESTAMPTZ;
EXCEPTION
  WHEN undefined_table THEN null;
END $$;

-- Update Fisiha to remote status
UPDATE public.mahber_roster_v1
SET participation_status = 'remote', remote_since = '2026-01-01T00:00:00Z'
WHERE id = 'mem_5' OR id = 'm5';

CREATE TABLE IF NOT EXISTS public.member_participation_audit_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  reason TEXT NOT NULL,
  reason_am TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. DUAL FINANCIAL ACCOUNTING (CORE TREASURY & GATHERING LOGISTICS ESCROW)
CREATE TABLE IF NOT EXISTS public.financial_accounts_v1 (
  id TEXT PRIMARY KEY, -- 'core_treasury', 'gathering_logistics_escrow'
  name TEXT NOT NULL,
  name_am TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('treasury', 'escrow')),
  balance NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed financial accounts
INSERT INTO public.financial_accounts_v1 (id, name, name_am, account_type, balance)
VALUES
  ('core_treasury', 'Core Treasury', 'ዋና ካዝና (የማኅበር ቋሚ ፈንድ)', 'treasury', 3800.00),
  ('gathering_logistics_escrow', 'Gathering Logistics Escrow', 'የማኅበር ጉዞ እና ዝግጅት መያዣ', 'escrow', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Append-only Immutable Financial Ledger
CREATE TABLE IF NOT EXISTS public.financial_ledger_entries_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL REFERENCES public.financial_accounts_v1(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit', 'reversal', 'transfer', 'adjustment_write_off')),
  category TEXT NOT NULL,
  member_id TEXT REFERENCES public.mahber_roster_v1(id),
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  gathering_id TEXT,
  related_attendance_id UUID,
  related_penalty_id UUID,
  reverses_entry_id UUID REFERENCES public.financial_ledger_entries_v1(id),
  idempotency_key TEXT UNIQUE,
  description TEXT NOT NULL,
  description_am TEXT NOT NULL,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Invariant Enforcement: Immutable Ledger (prevent UPDATE and DELETE)
CREATE OR REPLACE FUNCTION public.prevent_financial_ledger_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Financial ledger entries are strictly immutable. Corrections must be recorded via linked reversal entries.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_financial_ledger ON public.financial_ledger_entries_v1;
CREATE TRIGGER trg_immutable_financial_ledger
BEFORE UPDATE OR DELETE ON public.financial_ledger_entries_v1
FOR EACH ROW EXECUTE FUNCTION public.prevent_financial_ledger_mutation();

-- 3. SEPARATE SACRED OBJECT CUSTODY FROM GATHERING HOSTS
CREATE TABLE IF NOT EXISTS public.sacred_objects_v1 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_am TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.sacred_objects_v1 (id, name, name_am, description)
VALUES ('obj_medhanialem_icon', 'Sacred Medhanialem Icon & Gospel', 'የመድኃኔዓለም ሥዕለ አድኅኖ እና ቅዱስ ወንጌል', 'Canonical physical sacred icon and gospel belonging to Medhanialem Mahber')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.sacred_object_custody_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id TEXT NOT NULL REFERENCES public.sacred_objects_v1(id),
  holder_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  is_current_active_holder BOOLEAN NOT NULL DEFAULT false,
  handover_confirmed_at TIMESTAMPTZ,
  confirmed_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Schema Invariant: At most ONE active custody holder per physical object
CREATE UNIQUE INDEX IF NOT EXISTS idx_single_active_custody_holder
ON public.sacred_object_custody_history(object_id)
WHERE is_current_active_holder = true;

-- Seed initial custody record (Sawiros Abiy holds the sacred object)
INSERT INTO public.sacred_object_custody_history (
  object_id, holder_id, is_current_active_holder, handover_confirmed_at, confirmed_by, notes
) VALUES (
  'obj_medhanialem_icon', 'mem_1', true, timezone('utc'::text, now()), 'mem_1', 'Initial canonical custody established'
) ON CONFLICT DO NOTHING;

-- Independent Gathering Hosts Table
CREATE TABLE IF NOT EXISTS public.gathering_hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  assigned_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  actual_host_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  is_swapped BOOLEAN NOT NULL DEFAULT false,
  swap_reason TEXT,
  swap_reason_am TEXT,
  approved_by TEXT REFERENCES public.mahber_roster_v1(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. VOTING GOVERNANCE WITH ELIGIBILITY SNAPSHOT, QUORUM & TIE HANDLING
CREATE TABLE IF NOT EXISTS public.proposal_governance_v1 (
  proposal_id UUID PRIMARY KEY REFERENCES public.spending_proposals_v1(id) ON DELETE CASCADE,
  eligible_member_ids TEXT[] NOT NULL,
  quorum_threshold INT NOT NULL DEFAULT 6, -- 6 of 11 members required for valid quorum
  deadline_at TIMESTAMPTZ NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  final_outcome TEXT CHECK (final_outcome IN ('pending', 'approved', 'rejected', 'tied', 'no_quorum')),
  total_votes_cast INT NOT NULL DEFAULT 0,
  in_favor_count INT NOT NULL DEFAULT 0,
  against_count INT NOT NULL DEFAULT 0,
  abstain_count INT NOT NULL DEFAULT 0,
  closed_at TIMESTAMPTZ,
  closed_by TEXT
);

-- 5. PERSISTENT REMINDER DELIVERY QUEUE
CREATE TABLE IF NOT EXISTS public.reminder_delivery_queue_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('72_hours', '24_hours', 'custom')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'telegram')),
  recipient_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  error_message TEXT,
  dedup_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Telegram Dispatch Audit Log
CREATE TABLE IF NOT EXISTS public.telegram_dispatch_log_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gathering_id TEXT,
  announcement_id TEXT,
  message_type TEXT NOT NULL CHECK (message_type IN ('gathering_reminder', 'official_announcement', 'proposal_approved')),
  recipient_chat_id TEXT NOT NULL,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  dedup_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent'
);

-- 6. MEZMUR AUDIO METADATA & BANDWIDTH TRACKING
CREATE TABLE IF NOT EXISTS public.mezmur_audio_files_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mezmur_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_provider TEXT NOT NULL DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'cloudflare_r2')),
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes <= 20971520), -- 20MB max
  duration_seconds NUMERIC(8,2),
  estimated_bitrate_kbps INT, -- Target: 64-128 kbps
  uploaded_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  total_downloads_count BIGINT NOT NULL DEFAULT 0,
  total_egress_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. CONTROLLED MEMBER OFFBOARDING WORKFLOW
CREATE TABLE IF NOT EXISTS public.member_offboarding_records_v1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  offboarded_by TEXT NOT NULL REFERENCES public.mahber_roster_v1(id),
  reason TEXT NOT NULL,
  reason_am TEXT,
  outstanding_debt_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  debt_disposition TEXT NOT NULL CHECK (debt_disposition IN ('collectible', 'written_off')),
  write_off_ledger_entry_id UUID REFERENCES public.financial_ledger_entries_v1(id),
  advance_balance_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  advance_disposition TEXT NOT NULL CHECK (advance_disposition IN ('refunded', 'transferred_to_treasury', 'none')),
  advance_ledger_entry_id UUID REFERENCES public.financial_ledger_entries_v1(id),
  custody_reassigned_to TEXT REFERENCES public.mahber_roster_v1(id),
  offboarded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. HARDENED DATABASE RPC: GET_FUND_SUMMARY (TREASURY PRIVACY)
CREATE OR REPLACE FUNCTION public.get_fund_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'core_treasury_balance', COALESCE((SELECT balance FROM public.financial_accounts_v1 WHERE id = 'core_treasury'), 0.00),
    'logistics_escrow_balance', COALESCE((SELECT balance FROM public.financial_accounts_v1 WHERE id = 'gathering_logistics_escrow'), 0.00),
    'total_penalties_collected', COALESCE((SELECT SUM(amount) FROM public.financial_ledger_entries_v1 WHERE category = 'penalty_payment' AND entry_type = 'credit'), 0.00),
    'total_active_proposals', COALESCE((SELECT COUNT(*) FROM public.spending_proposals_v1 WHERE status = 'active'), 0)
  ) INTO result;
  RETURN result;
END;
$$;

-- Secure voting aggregate tally (shields individual voter identity)
CREATE OR REPLACE FUNCTION public.get_proposal_vote_summary(p_proposal_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_governance public.proposal_governance_v1%ROWTYPE;
  v_favor INT;
  v_against INT;
  v_abstain INT;
  v_total INT;
BEGIN
  SELECT * INTO v_governance FROM public.proposal_governance_v1 WHERE proposal_id = p_proposal_id;
  
  SELECT 
    COUNT(*) FILTER (WHERE vote = 'in_favor'),
    COUNT(*) FILTER (WHERE vote = 'against'),
    COUNT(*) FILTER (WHERE vote = 'abstain'),
    COUNT(*)
  INTO v_favor, v_against, v_abstain, v_total
  FROM public.proposal_votes_v1
  WHERE proposal_id = p_proposal_id;

  RETURN jsonb_build_object(
    'proposal_id', p_proposal_id,
    'quorum_threshold', COALESCE(v_governance.quorum_threshold, 6),
    'total_votes_cast', v_total,
    'has_quorum', (v_total >= COALESCE(v_governance.quorum_threshold, 6)),
    'in_favor', v_favor,
    'against', v_against,
    'abstain', v_abstain,
    'is_closed', COALESCE(v_governance.is_closed, false),
    'final_outcome', COALESCE(v_governance.final_outcome, 'pending')
  );
END;
$$;

-- 9. ROW-LEVEL SECURITY HARDENING
ALTER TABLE public.financial_accounts_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_ledger_entries_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacred_objects_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sacred_object_custody_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gathering_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_governance_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_delivery_queue_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mezmur_audio_files_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_offboarding_records_v1 ENABLE ROW LEVEL SECURITY;

-- Read public accounts
CREATE POLICY "Public read for financial accounts"
  ON public.financial_accounts_v1 FOR SELECT
  TO authenticated
  USING (true);

-- Ledger Privacy: Members see only their own ledger entries; Finance admins see all
CREATE POLICY "Members view only personal ledger; Admins view all"
  ON public.financial_ledger_entries_v1 FOR SELECT
  TO authenticated
  USING (
    member_id = auth.uid()::text OR
    EXISTS (
      SELECT 1 FROM public.member_admin_roles_v1 ar
      WHERE ar.member_id = auth.uid()::text AND ar.role IN ('super_admin', 'finance_admin')
    )
  );

-- Secret Ballot RLS: Members see only their own vote
DROP POLICY IF EXISTS "Members view proposal votes" ON public.proposal_votes_v1;
CREATE POLICY "Secret ballot: Member views only their own vote"
  ON public.proposal_votes_v1 FOR SELECT
  TO authenticated
  USING (member_id = auth.uid()::text);

-- Sacred objects and custody visible to all authenticated members
CREATE POLICY "Authenticated members view sacred objects"
  ON public.sacred_objects_v1 FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated members view custody history"
  ON public.sacred_object_custody_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated members view gathering hosts"
  ON public.gathering_hosts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated members view proposal governance"
  ON public.proposal_governance_v1 FOR SELECT
  TO authenticated
  USING (true);
