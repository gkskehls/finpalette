-- ==============================================================================
-- Finpalette v3.3 Schema
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
    sort_order INTEGER DEFAULT 0, -- 카테고리 순서 (v3.1 추가)
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

-- 신규 가입 시 프로필 생성 및 개인 팔레트 생성 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 프로필 정보 삽입
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'email',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- 개인 팔레트 생성 (v3.2 추가)
  -- security definer 함수이므로, new.id를 owner_id로 전달
  PERFORM create_palette('마이 팔레트', '#6366F1', new.id);

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

-- 기본 카테고리 목록 반환 함수 (v3.2 추가)
CREATE OR REPLACE FUNCTION get_default_categories()
RETURNS TABLE(code text, name text, color text, icon text, sort_order integer) AS $$
BEGIN
  RETURN QUERY VALUES
    ('i01', '월급', '#4CAF50', 'Briefcase', 1),
    ('i02', '용돈', '#81C784', 'Coins', 2),
    ('i03', '금융소득', '#66BB6A', 'Landmark', 3),
    ('i04', '사업소득', '#A5D6A7', 'Store', 4),
    ('i99', '기타', '#C8E6C9', 'PlusSquare', 99),
    ('c01', '식비', '#FF7043', 'Utensils', 1),
    ('c02', '교통', '#5C6BC0', 'Bus', 2),
    ('c03', '통신', '#26A69A', 'Smartphone', 3),
    ('c04', '쇼핑', '#FFCA28', 'ShoppingBag', 4),
    ('c05', '주거', '#78909C', 'Home', 5),
    ('c06', '의료/건강', '#EF5350', 'HeartPulse', 6),
    ('c07', '여가/문화', '#AB47BC', 'Film', 7),
    ('c08', '교육', '#42A5F5', 'GraduationCap', 8),
    ('c09', '경조사', '#8D6E63', 'Users', 9),
    ('c10', '저축/투자', '#66BB6A', 'PiggyBank', 10),
    ('c99', '기타', '#BDBDBD', 'PlusSquare', 99);
END;
$$ LANGUAGE plpgsql;

-- 팔레트 생성 함수 (v3.3 수정)
CREATE OR REPLACE FUNCTION create_palette(
  p_name TEXT,
  p_theme_color TEXT,
  p_owner_id UUID DEFAULT auth.uid(), -- 트리거에서 호출 시 owner_id를 받기 위함
  p_source_palette_id UUID DEFAULT NULL -- 카테고리 복사 원본 팔레트 ID
)
RETURNS UUID AS $$
DECLARE
  new_palette_id UUID;
  v_user_role TEXT;
BEGIN
  -- 팔레트 생성
  INSERT INTO public.palettes (name, theme_color, owner_id)
  VALUES (p_name, p_theme_color, p_owner_id)
  RETURNING id INTO new_palette_id;

  -- 팔레트 멤버로 소유자 추가
  INSERT INTO public.palette_members (palette_id, user_id, role)
  VALUES (new_palette_id, p_owner_id, 'owner');

  -- 카테고리 생성 로직 분기
  IF p_source_palette_id IS NOT NULL THEN
    -- 권한 확인: source_palette_id에 대한 멤버인지 확인
    SELECT role INTO v_user_role
    FROM public.palette_members
    WHERE palette_id = p_source_palette_id AND user_id = p_owner_id;

    IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'Permission denied to copy categories from source palette';
    END IF;

    -- 기존 팔레트에서 카테고리 복사
    INSERT INTO public.categories (palette_id, code, name, color, icon, user_id, sort_order)
    SELECT
      new_palette_id,
      code,
      name,
      color,
      icon,
      p_owner_id, -- 새 카테고리의 user_id는 새 팔레트 소유자로 설정
      sort_order
    FROM public.categories
    WHERE palette_id = p_source_palette_id;
  ELSE
    -- 기본 카테고리 삽입
    INSERT INTO public.categories (palette_id, code, name, color, icon, user_id, sort_order)
    SELECT
      new_palette_id,
      dc.code,
      dc.name,
      dc.color,
      dc.icon,
      p_owner_id,
      dc.sort_order
    FROM get_default_categories() AS dc;
  END IF;

  RETURN new_palette_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


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

-- 카테고리 순서 변경 함수 (v3.1 추가)
CREATE OR REPLACE FUNCTION update_category_order(
    p_palette_id UUID,
    p_category_codes TEXT[]
)
RETURNS VOID AS $$
DECLARE
    v_code TEXT;
    v_order INTEGER := 1;
    v_user_role TEXT;
BEGIN
    -- 권한 확인 (Owner 또는 Admin만 가능)
    SELECT role INTO v_user_role
    FROM public.palette_members
    WHERE palette_id = p_palette_id AND user_id = auth.uid();

    IF v_user_role IS NULL OR v_user_role NOT IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Permission denied';
    END IF;

    -- 배열 순서대로 sort_order 업데이트
    FOREACH v_code IN ARRAY p_category_codes
    LOOP
        UPDATE public.categories
        SET sort_order = v_order
        WHERE palette_id = p_palette_id AND code = v_code;
        v_order := v_order + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force schema cache reload
NOTIFY pgrst, 'reload config';
