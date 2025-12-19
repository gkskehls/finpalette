-- RLS(Row Level Security) 활성화
ALTER TABLE public.palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.palette_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지 및 업데이트)
DROP POLICY IF EXISTS "Users can create their own palettes" ON public.palettes;
DROP POLICY IF EXISTS "Users can view palettes they are members of" ON public.palettes;
DROP POLICY IF EXISTS "Users can view palettes they are members of or own" ON public.palettes;
DROP POLICY IF EXISTS "Users can insert their own membership" ON public.palette_members;
DROP POLICY IF EXISTS "Users can view their own membership" ON public.palette_members;
DROP POLICY IF EXISTS "Users can manage transactions of their palettes" ON public.transactions;
DROP POLICY IF EXISTS "Users can manage categories of their palettes" ON public.categories;

-- 1. Palettes 테이블 정책
-- 생성: 인증된 사용자는 자신의 팔레트를 만들 수 있음
CREATE POLICY "Users can create their own palettes"
ON public.palettes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- 조회: 자신이 소유한(owner) 팔레트만 볼 수 있음 (순환 참조 방지를 위해 멤버 조회 제거)
-- 마이그레이션 및 초기 단계에서는 이것으로 충분합니다.
-- 추후 공유 기능 활성화 시 함수 기반 정책으로 고도화가 필요합니다.
CREATE POLICY "Users can view own palettes"
ON public.palettes
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- 2. Palette Members 테이블 정책
-- 생성: 자기 자신을 멤버로 추가할 수 있음
CREATE POLICY "Users can insert their own membership"
ON public.palette_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 조회: 자신의 멤버십 정보를 볼 수 있음
CREATE POLICY "Users can view their own membership"
ON public.palette_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Transactions 테이블 정책
-- 전체 권한: 자신이 속한 팔레트의 거래 내역을 관리할 수 있음
-- 여기서는 순환 참조가 발생하지 않으므로 멤버십 체크를 유지합니다.
CREATE POLICY "Users can manage transactions of their palettes"
ON public.transactions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.palettes
    WHERE id = public.transactions.palette_id
    AND owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = public.transactions.palette_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.palettes
    WHERE id = public.transactions.palette_id
    AND owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = public.transactions.palette_id
    AND user_id = auth.uid()
  )
);

-- 4. Categories 테이블 정책
-- 전체 권한: 자신이 속한 팔레트의 카테고리를 관리할 수 있음
CREATE POLICY "Users can manage categories of their palettes"
ON public.categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.palettes
    WHERE id = public.categories.palette_id
    AND owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = public.categories.palette_id
    AND user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.palettes
    WHERE id = public.categories.palette_id
    AND owner_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.palette_members
    WHERE palette_id = public.categories.palette_id
    AND user_id = auth.uid()
  )
);
