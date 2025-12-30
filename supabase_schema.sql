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
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Create 'profiles' table to store public user data
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Create 'palettes' table
CREATE TABLE public.palettes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    theme_color TEXT DEFAULT '#6366F1',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. Create 'palette_members' table
CREATE TABLE public.palette_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(palette_id, user_id)
);

-- 5. Create 'palette_invitations' table
CREATE TABLE public.palette_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. Create 'categories' table
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

-- 7. Create 'transactions' table
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
-- Helper Functions & Triggers
-- ==============================================================================

-- Trigger function to sync new users to 'profiles' table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper function to check if a user is a member of a palette (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION is_current_user_member(_palette_id UUID)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE user_id = auth.uid() AND palette_id = _palette_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 1. Policies for 'profiles'
-- ------------------------------------------------------------------------------
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Policies for 'palettes'
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view palettes they belong to" ON public.palettes
    FOR SELECT USING (is_current_user_member(id));

CREATE POLICY "Owners can update their palettes" ON public.palettes
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their palettes" ON public.palettes
    FOR DELETE USING (owner_id = auth.uid());

CREATE POLICY "Users can create palettes" ON public.palettes
    FOR INSERT WITH CHECK (owner_id = auth.uid());


-- ------------------------------------------------------------------------------
-- 3. Policies for 'palette_members'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view other members of the same palette" ON public.palette_members
    FOR SELECT USING (is_current_user_member(palette_id));

CREATE POLICY "Users can insert their own membership" ON public.palette_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can update member roles" ON public.palette_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.palettes p
            WHERE p.id = public.palette_members.palette_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can leave palettes (but not owners)" ON public.palette_members
    FOR DELETE USING (user_id = auth.uid() AND role <> 'owner');

CREATE POLICY "Owners can remove other members" ON public.palette_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.palettes p
            WHERE p.id = public.palette_members.palette_id
            AND p.owner_id = auth.uid()
        )
        AND user_id <> auth.uid()
    );


-- ------------------------------------------------------------------------------
-- 4. Policies for 'transactions'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view transactions" ON public.transactions
    FOR SELECT USING (is_current_user_member(palette_id));

CREATE POLICY "Members can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (is_current_user_member(palette_id));

CREATE POLICY "Members can update transactions" ON public.transactions
    FOR UPDATE USING (is_current_user_member(palette_id));

CREATE POLICY "Members can delete transactions" ON public.transactions
    FOR DELETE USING (is_current_user_member(palette_id));


-- ------------------------------------------------------------------------------
-- 5. Policies for 'categories'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view categories" ON public.categories
    FOR SELECT USING (is_current_user_member(palette_id));

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
-- 6. Policies for 'palette_invitations'
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view invitations" ON public.palette_invitations
    FOR SELECT USING (is_current_user_member(palette_id));

CREATE POLICY "Members can create invitations" ON public.palette_invitations
    FOR INSERT WITH CHECK (is_current_user_member(palette_id));


-- ==============================================================================
-- RPC Functions
-- ==============================================================================

-- Function to create a new palette with default settings
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

-- Function to get palette members with their profile info
CREATE OR REPLACE FUNCTION get_palette_members(p_palette_id uuid)
RETURNS TABLE (
  id uuid,
  palette_id uuid,
  user_id uuid,
  role text,
  joined_at timestamptz,
  email text,
  full_name text,
  avatar_url text
)
AS $$
BEGIN
  RETURN QUERY
    SELECT
      pm.id,
      pm.palette_id,
      pm.user_id,
      pm.role,
      pm.joined_at,
      p.email,
      p.full_name,
      p.avatar_url
    FROM
      public.palette_members AS pm
      LEFT JOIN public.profiles AS p ON pm.user_id = p.id
    WHERE
      pm.palette_id = p_palette_id;
END;
$$ LANGUAGE plpgsql;


-- Force schema cache reload
NOTIFY pgrst, 'reload config';
