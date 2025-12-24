import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import type { Palette } from '../../types/palette';

// API: 사용자가 속한 모든 팔레트 목록을 가져오는 함수
const getPalettes = async (userId: string): Promise<Palette[]> => {
  if (!userId) {
    return [];
  }

  // palette_members 테이블에서 현재 사용자가 속한 멤버 정보를 찾고,
  // 그와 연결된 palettes 테이블의 전체 정보를 가져옵니다.
  const { data, error } = await supabase
    .from('palette_members')
    .select(
      `
      palette:palettes (
        id,
        name,
        theme_color,
        owner_id,
        created_at
      )
    `
    )
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching palettes:', error);
    throw new Error(error.message);
  }

  // data는 [{ palette: {...} }, { palette: {...} }] 형태이므로,
  // map을 이용해 [Palette, Palette, ...] 형태로 변환합니다.
  return (data?.map((item) => item.palette).filter(Boolean) as Palette[]) || [];
};

/**
 * 현재 로그인한 사용자가 접근할 수 있는 모든 팔레트 목록을 가져오는 React Query 훅입니다.
 */
export function usePalettesQuery() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<Palette[], Error>({
    // 쿼리 키에 userId를 포함하여 사용자별로 캐시를 관리합니다.
    queryKey: ['palettes', userId],
    // queryFn은 Promise를 반환하는 함수여야 합니다.
    queryFn: () => getPalettes(userId!),
    // 사용자가 로그인 상태일 때만 쿼리를 실행합니다.
    enabled: !!userId,
  });
}
