-- ==============================================================================
-- MEDHANIALEM MAHBER (መድኃኔዓለም ማኅበር)
-- MIGRATION: 20261007_room_notifications.sql
-- FOCUS: PRIVATE ROOM + ANNOUNCEMENTS + PRAYER REQUESTS + NOTIFICATIONS + AUDIT
-- ==============================================================================

-- 1. EXTEND MESSAGES TABLE
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_removed_by_admin BOOLEAN DEFAULT false;

-- 2. ROOM READ STATES (Lightweight unread tracking per member)
CREATE TABLE IF NOT EXISTS public.room_read_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, mahber_id)
);

-- 3. EXTEND ANNOUNCEMENTS TABLE
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_important BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 4. EXTEND PRAYER REQUESTS TABLE
ALTER TABLE public.prayer_requests
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'group' CHECK (visibility IN ('group', 'private')),
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'answered', 'archived'));

-- 5. PRAYER REACTIONS TABLE ("Praying for you" supportive taps)
CREATE TABLE IF NOT EXISTS public.prayer_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id UUID NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(prayer_request_id, user_id)
);

-- 6. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mahber_id UUID NOT NULL REFERENCES public.mahbers(id) ON DELETE CASCADE,
  mahber_reminders BOOLEAN NOT NULL DEFAULT true,
  room_messages BOOLEAN NOT NULL DEFAULT true,
  announcements BOOLEAN NOT NULL DEFAULT true,
  prayer_requests BOOLEAN NOT NULL DEFAULT true,
  contribution_reminders BOOLEAN NOT NULL DEFAULT true,
  mezmur_reminders BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, mahber_id)
);

-- 7. DEVICE TOKENS TABLE (Secure push notification tokens)
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, token)
);

-- 8. AUDIT LOGS TABLE (Administrative actions tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- RLS SECURITY POLICIES
-- ==============================================================================

ALTER TABLE public.room_read_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- MESSAGES RLS
-- Members can update their own messages (edit or soft-delete)
CREATE POLICY "Members can update own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can moderate messages
CREATE POLICY "Admins can moderate messages" ON public.messages
  FOR UPDATE USING (is_mahber_admin(auth.uid(), mahber_id));

-- ROOM READ STATES RLS
CREATE POLICY "Users manage own read state" ON public.room_read_states
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ANNOUNCEMENTS RLS
-- All members can read published announcements
CREATE POLICY "Members can read published announcements" ON public.announcements
  FOR SELECT USING (
    is_published = true AND (deleted_at IS NULL) AND
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.mahber_id = announcements.mahber_id AND m.user_id = auth.uid() AND m.status = 'active'
    )
  );

-- Only admins can insert, update, or delete announcements
CREATE POLICY "Admins manage announcements" ON public.announcements
  FOR ALL USING (is_mahber_admin(auth.uid(), mahber_id))
  WITH CHECK (is_mahber_admin(auth.uid(), mahber_id));

-- PRAYER REQUESTS RLS
-- Group prayer requests are viewable by all active members
-- Private prayer requests are viewable ONLY by author and admins
CREATE POLICY "View prayer requests policy" ON public.prayer_requests
  FOR SELECT USING (
    (visibility = 'group' AND EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.mahber_id = prayer_requests.mahber_id AND m.user_id = auth.uid() AND m.status = 'active'
    )) OR
    (auth.uid() = user_id) OR
    (is_mahber_admin(auth.uid(), mahber_id))
  );

-- Members manage own prayer requests
CREATE POLICY "Members manage own prayer requests" ON public.prayer_requests
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PRAYER REACTIONS RLS
CREATE POLICY "Members manage own prayer reactions" ON public.prayer_reactions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can view prayer reactions" ON public.prayer_reactions
  FOR SELECT USING (true);

-- NOTIFICATION PREFERENCES RLS
-- Strictly private to individual member
CREATE POLICY "Users manage own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DEVICE TOKENS RLS
-- Strictly private to token owner (Admins and other members CANNOT read)
CREATE POLICY "Users manage own device tokens" ON public.device_tokens
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AUDIT LOGS RLS
-- Only admins can read audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.user_id = auth.uid() AND m.role = 'admin' AND m.status = 'active'
    )
  );
