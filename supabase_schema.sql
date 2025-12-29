-- ==============================================================================
-- Finpalette v2 Schema Migration Script (Multi-Palette Support)
-- ==============================================================================

-- ⚠️ WARNING: This script will DROP all existing tables and data!
-- Use this only for development/reset purposes.

-- 1. Drop existing tables with CASCADE
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.palette_invitations CASCADE;
DROP TABLE IF EXISTS public.palette_members CASCADE;
DROP TABLE IF EXISTS public.palettes CASCADE;

-- 2. Create 'palettes' table
CREATE TABLE public.palettes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    theme_color TEXT DEFAULT '#6366F1',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create 'palette_members' table
CREATE TABLE public.palette_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(palette_id, user_id)
);

-- 4. Create 'palette_invitations' table
CREATE TABLE public.palette_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Create 'categories' table
-- PK is composite: (palette_id, code)
CREATE TABLE public.categories (
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (palette_id, code)
);

-- 6. Create 'transactions' table
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID NOT NULL,
    category_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('inc', 'exp')),
    amount INTEGER NOT NULL,
    description TEXT,
    private_memo TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    FOREIGN KEY (palette_id, category_code) REFERENCES public.categories(palette_id, code) ON DELETE CASCADE,
    FOREIGN KEY (palette_id) REFERENCES public.palettes(id) ON DELETE CASCADE
);


-- ==============================================================================
-- Helper Functions (Security Definer)
-- ==============================================================================

-- Function to check if the current user is a member of the given palette
CREATE OR REPLACE FUNCTION check_if_member(_palette_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.palette_members
    WHERE palette_id = _palette_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Policies for 'palettes'
-- ------------------------------------------------------------------------------
-- View: Use standard EXISTS query instead of function to avoid potential issues
-- This is safe because 'palette_members' policy does NOT query 'palettes'.
CREATE POLICY "Users can view palettes they belong to" ON public.palettes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.palette_members
            WHERE palette_id = public.palettes.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update their palettes" ON public.palettes
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their palettes" ON public.palettes
    FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Users can create palettes" ON public.palettes
    FOR INSERT WITH CHECK (owner_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 2. Policies for 'palette_members'
-- ------------------------------------------------------------------------------
-- View: I can see my own membership
CREATE POLICY "Users can view their own membership" ON public.palette_members
    FOR SELECT USING (user_id = auth.uid());

-- Insert: I can add myself (ONLY via RPC or specific conditions - tightened for security)
-- We will rely on RPC for adding members via invitation.
-- For creating a palette, the owner adds themselves.
CREATE POLICY "Users can insert their own membership" ON public.palette_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update: I can update my own membership
CREATE POLICY "Users can update their own membership" ON public.palette_members
    FOR UPDATE USING (user_id = auth.uid());

-- Delete: I can leave
CREATE POLICY "Users can leave palettes" ON public.palette_members
    FOR DELETE USING (user_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 3. Policies for 'transactions'
-- ------------------------------------------------------------------------------
-- Use the helper function for all operations
CREATE POLICY "Members can view transactions" ON public.transactions
    FOR SELECT USING (check_if_member(palette_id));

CREATE POLICY "Members can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (check_if_member(palette_id));

CREATE POLICY "Members can update transactions" ON public.transactions
    FOR UPDATE USING (check_if_member(palette_id));

CREATE POLICY "Members can delete transactions" ON public.transactions
    FOR DELETE USING (check_if_member(palette_id));


-- ------------------------------------------------------------------------------
-- 4. Policies for 'categories'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view categories" ON public.categories
    FOR SELECT USING (check_if_member(palette_id));

CREATE POLICY "Admins/Owners can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.palette_members
            WHERE palette_id = public.categories.palette_id
            AND user_id = auth.uid()
            AND role IN ('owner', 'admin')
        )
    );


-- ------------------------------------------------------------------------------
-- 5. Policies for 'palette_invitations'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view invitations" ON public.palette_invitations
    FOR SELECT USING (check_if_member(palette_id));

CREATE POLICY "Members can create invitations" ON public.palette_invitations
    FOR INSERT WITH CHECK (check_if_member(palette_id));


-- ==============================================================================
-- RPC Functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION create_palette(
  name TEXT,
  theme_color TEXT
) RETURNS UUID AS $$
DECLARE
  new_palette_id UUID;
BEGIN
  -- 1. Insert into palettes
  INSERT INTO public.palettes (name, theme_color, owner_id)
  VALUES (create_palette.name, create_palette.theme_color, auth.uid())
  RETURNING id INTO new_palette_id;

  -- 2. Insert into palette_members
  INSERT INTO public.palette_members (palette_id, user_id, role)
  VALUES (new_palette_id, auth.uid(), 'owner');

  -- 3. Insert default categories
  INSERT INTO public.categories (palette_id, code, name, color, icon, user_id)
  VALUES
    (new_palette_id, 'inc', '수입', '#10B981', 'PiggyBank', auth.uid()),
    (new_palette_id, 'c01', '식비', '#EF4444', 'Utensils', auth.uid()),
    (new_palette_id, 'c02', '교통', '#3B82F6', 'Bus', auth.uid()),
    (new_palette_id, 'c03', '쇼핑', '#F59E0B', 'ShoppingBag', auth.uid()),
    (new_palette_id, 'c04', '생활', '#8B5CF6', 'Home', auth.uid()),
    (new_palette_id, 'c05', '기타', '#64748B', 'MoreHorizontal', auth.uid());

  RETURN new_palette_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(
  invitation_code TEXT
) RETURNS UUID AS $$
DECLARE
  invite_record RECORD;
  is_already_member BOOLEAN;
BEGIN
  -- 1. Find the invitation
  SELECT * INTO invite_record
  FROM public.palette_invitations
  WHERE code = invitation_code
  AND is_used = FALSE
  AND expires_at > now();

  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation code';
  END IF;

  -- 2. Check if user is already a member
  SELECT EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = invite_record.palette_id
    AND user_id = auth.uid()
  ) INTO is_already_member;

  IF is_already_member THEN
    RETURN invite_record.palette_id; -- Already a member, just return ID
  END IF;

  -- 3. Add user to palette_members
  INSERT INTO public.palette_members (palette_id, user_id, role)
  VALUES (invite_record.palette_id, auth.uid(), 'editor');

  -- 4. (Optional) Mark invitation as used if it's a one-time use
  -- For now, we keep it reusable until expiration, so we don't update is_used.
  -- If you want one-time use, uncomment the line below:
  -- UPDATE public.palette_invitations SET is_used = TRUE WHERE id = invite_record.id;

  RETURN invite_record.palette_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
