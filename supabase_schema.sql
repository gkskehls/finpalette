-- ==============================================================================
-- Finpalette v3 Schema
--
-- 구조:
-- 1. Tables
-- 2. Helper Functions & Triggers
-- 3. Row Level Security (RLS) Policies
-- 4. RPC Functions
-- ==============================================================================

-- ==============================================================================
-- 1. Tables
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.palettes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    theme_color TEXT DEFAULT '#6366F1',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.palette_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(palette_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.palette_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    inviter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.categories (
    palette_id UUID REFERENCES public.palettes(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    PRIMARY KEY (palette_id, code)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    palette_id UUID NOT NULL,
    category_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('inc', 'exp')),
    amount INTEGER NOT NULL,
    description TEXT,
    public_memo TEXT, -- v3: private_memo -> public_memo
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    FOREIGN KEY (palette_id, category_code) REFERENCES public.categories(palette_id, code) ON DELETE CASCADE,
    FOREIGN KEY (palette_id) REFERENCES public.palettes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.private_memos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(transaction_id, user_id)
);

-- ==============================================================================
-- 2. Helper Functions & Triggers
-- ==============================================================================

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION get_user_role(_palette_id UUID, _user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.palette_members
  WHERE palette_id = _palette_id AND user_id = _user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- 3. Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_memos ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can delete their own profile." ON public.profiles;
CREATE POLICY "Users can delete their own profile." ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Palettes
DROP POLICY IF EXISTS "Members can view palettes they belong to" ON public.palettes;
CREATE POLICY "Members can view palettes they belong to" ON public.palettes FOR SELECT USING (get_user_role(id, auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Admins or owners can update their palettes" ON public.palettes;
CREATE POLICY "Admins or owners can update their palettes" ON public.palettes FOR UPDATE USING (get_user_role(id, auth.uid()) IN ('owner', 'admin'));
DROP POLICY IF EXISTS "Owners can delete their palettes" ON public.palettes;
CREATE POLICY "Owners can delete their palettes" ON public.palettes FOR DELETE USING (get_user_role(id, auth.uid()) = 'owner');

-- Palette Members
DROP POLICY IF EXISTS "Members can view other members of the same palette" ON public.palette_members;
CREATE POLICY "Members can view other members of the same palette" ON public.palette_members FOR SELECT USING (get_user_role(palette_id, auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Owners can update member roles" ON public.palette_members;
CREATE POLICY "Owners can update member roles" ON public.palette_members FOR UPDATE USING (get_user_role(palette_id, auth.uid()) = 'owner');
DROP POLICY IF EXISTS "Users can leave palettes (but not owners)" ON public.palette_members;
CREATE POLICY "Users can leave palettes (but not owners)" ON public.palette_members FOR DELETE USING (user_id = auth.uid() AND role <> 'owner');
DROP POLICY IF EXISTS "Owners can remove other members" ON public.palette_members;
CREATE POLICY "Owners can remove other members" ON public.palette_members FOR DELETE USING (get_user_role(palette_id, auth.uid()) = 'owner' AND user_id <> auth.uid());

-- Transactions
DROP POLICY IF EXISTS "Viewers and above can see transactions" ON public.transactions;
CREATE POLICY "Viewers and above can see transactions" ON public.transactions FOR SELECT USING (get_user_role(palette_id, auth.uid()) IN ('owner', 'admin', 'editor', 'viewer'));
DROP POLICY IF EXISTS "Editors and above can insert transactions" ON public.transactions;
CREATE POLICY "Editors and above can insert transactions" ON public.transactions FOR INSERT WITH CHECK (get_user_role(palette_id, auth.uid()) IN ('owner', 'admin', 'editor'));
DROP POLICY IF EXISTS "Users can update their own tx; Admins/Owners can update all" ON public.transactions;
CREATE POLICY "Users can update their own tx; Admins/Owners can update all" ON public.transactions FOR UPDATE USING ((get_user_role(palette_id, auth.uid()) IN ('owner', 'admin')) OR (get_user_role(palette_id, auth.uid()) = 'editor' AND user_id = auth.uid()));
DROP POLICY IF EXISTS "Users can delete their own tx; Admins/Owners can delete all" ON public.transactions;
CREATE POLICY "Users can delete their own tx; Admins/Owners can delete all" ON public.transactions FOR DELETE USING ((get_user_role(palette_id, auth.uid()) IN ('owner', 'admin')) OR (get_user_role(palette_id, auth.uid()) = 'editor' AND user_id = auth.uid()));

-- Categories
DROP POLICY IF EXISTS "Members can view categories" ON public.categories;
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (get_user_role(palette_id, auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Admins/Owners can manage categories" ON public.categories;
CREATE POLICY "Admins/Owners can manage categories" ON public.categories FOR ALL USING (get_user_role(palette_id, auth.uid()) IN ('owner', 'admin'));

-- Private Memos
DROP POLICY IF EXISTS "Users can view their own private memos" ON public.private_memos;
CREATE POLICY "Users can view their own private memos" ON public.private_memos FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can manage their own private memos" ON public.private_memos;
CREATE POLICY "Users can manage their own private memos" ON public.private_memos FOR ALL USING (user_id = auth.uid());

-- Palette Invitations
DROP POLICY IF EXISTS "Members can view invitations" ON public.palette_invitations;
CREATE POLICY "Members can view invitations" ON public.palette_invitations FOR SELECT USING (get_user_role(palette_id, auth.uid()) IS NOT NULL);
DROP POLICY IF EXISTS "Members can create invitations" ON public.palette_invitations;
CREATE POLICY "Members can create invitations" ON public.palette_invitations FOR INSERT WITH CHECK (get_user_role(palette_id, auth.uid()) IN ('owner', 'admin'));


-- ==============================================================================
-- 4. RPC Functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION upsert_transaction_with_memos(
    p_id uuid, -- 내역 ID (수정 시 사용, 추가 시 NULL)
    p_palette_id uuid,
    p_category_code text,
    p_date date,
    p_type text,
    p_amount integer,
    p_description text,
    p_public_memo text,
    p_private_memo_content text
)
RETURNS uuid AS $$
DECLARE
    v_transaction_id uuid;
    v_user_id uuid := auth.uid();
BEGIN
    -- 1. 내역(Transaction) 추가 또는 수정
    IF p_id IS NULL THEN
        -- 추가
        INSERT INTO public.transactions (palette_id, category_code, user_id, date, type, amount, description, public_memo)
        VALUES (p_palette_id, p_category_code, v_user_id, p_date, p_type, p_amount, p_description, p_public_memo)
        RETURNING id INTO v_transaction_id;
    ELSE
        -- 수정
        UPDATE public.transactions
        SET
            category_code = p_category_code,
            date = p_date,
            type = p_type,
            amount = p_amount,
            description = p_description,
            public_memo = p_public_memo
        WHERE id = p_id
        RETURNING id INTO v_transaction_id;
    END IF;

    -- 2. 비공개 메모(Private Memo) 추가 또는 수정
    IF p_private_memo_content IS NOT NULL AND p_private_memo_content <> '' THEN
        INSERT INTO public.private_memos (transaction_id, user_id, content)
        VALUES (v_transaction_id, v_user_id, p_private_memo_content)
        ON CONFLICT (transaction_id, user_id)
        DO UPDATE SET content = EXCLUDED.content, updated_at = now();
    ELSE
        -- 내용이 없으면 삭제
        DELETE FROM public.private_memos
        WHERE transaction_id = v_transaction_id AND user_id = v_user_id;
    END IF;

    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION create_palette(name TEXT, theme_color TEXT)
RETURNS UUID AS $$
DECLARE
  new_palette_id UUID;
BEGIN
  INSERT INTO public.palettes (name, theme_color, owner_id)
  VALUES (create_palette.name, create_palette.theme_color, auth.uid())
  RETURNING id INTO new_palette_id;

  INSERT INTO public.palette_members (palette_id, user_id, role)
  VALUES (new_palette_id, auth.uid(), 'owner');

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

CREATE OR REPLACE FUNCTION accept_invitation(invitation_code TEXT)
RETURNS UUID AS $$
DECLARE
  invite_record RECORD;
  is_already_member BOOLEAN;
BEGIN
  SELECT * INTO invite_record
  FROM public.palette_invitations
  WHERE code = invitation_code
  AND is_used = FALSE
  AND expires_at > now();

  IF invite_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation code';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = invite_record.palette_id
    AND user_id = auth.uid()
  ) INTO is_already_member;

  IF is_already_member THEN
    RETURN invite_record.palette_id;
  END IF;

  INSERT INTO public.palette_members (palette_id, user_id, role)
  VALUES (invite_record.palette_id, auth.uid(), 'editor');

  RETURN invite_record.palette_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
