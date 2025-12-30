import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { PaletteMember } from '../../types/palette';

// API: RPC를 호출하여 특정 팔레트의 멤버 목록을 가져오는 함수
const getPaletteMembers = async (
  paletteId: string
): Promise<PaletteMember[]> => {
  if (!paletteId) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_palette_members', {
    p_palette_id: paletteId,
  });

  if (error) {
    console.error('Error fetching palette members via RPC:', error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * 특정 팔레트의 모든 멤버 목록을 가져오는 React Query 훅입니다.
 * @param paletteId - 멤버 목록을 조회할 팔레트의 ID
 */
export function usePaletteMembersQuery(paletteId: string) {
  return useQuery<PaletteMember[], Error>({
    queryKey: ['paletteMembers', paletteId],
    queryFn: () => getPaletteMembers(paletteId),
    // 팔레트 ID가 있을 때만 쿼리를 실행합니다.
    enabled: !!paletteId,
  });
}
