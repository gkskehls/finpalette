import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { PaletteMember } from '../../types/palette'; // PaletteMemberWithProfile 대신 PaletteMember 임포트

const getPaletteMembers = async (
  paletteId: string
): Promise<PaletteMember[]> => {
  // 반환 타입도 PaletteMember로 변경
  if (!paletteId || paletteId === 'local') {
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
    queryFn: () => getPaletteMembers(paletteId!),
    enabled: !!paletteId && paletteId !== 'local',
  });
};
