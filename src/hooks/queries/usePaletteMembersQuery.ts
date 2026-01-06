import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { PaletteMember } from '../../types/palette';

const getPaletteMembers = async (
  paletteId: string
): Promise<PaletteMember[]> => {
  // 'local' 팔레트는 DB에 존재하지 않으므로 빈 배열 반환
  if (paletteId === 'local') {
    return [];
  }

  const { data, error } = await supabase.rpc('get_palette_members', {
    p_palette_id: paletteId,
  });

  if (error) {
    console.error('Error fetching palette members:', error);
    throw new Error('팔레트 멤버 정보를 불러오는데 실패했습니다.');
  }

  return data;
};

export const usePaletteMembersQuery = (paletteId: string | undefined) => {
  return useQuery({
    queryKey: ['paletteMembers', paletteId],
    queryFn: () => {
      // enabled 옵션으로 인해 이 코드는 실행되지 않지만,
      // TypeScript 타입 추론을 위해 명시적인 가드를 추가합니다.
      if (!paletteId) {
        return Promise.resolve([]);
      }
      return getPaletteMembers(paletteId);
    },
    enabled: !!paletteId,
  });
};
