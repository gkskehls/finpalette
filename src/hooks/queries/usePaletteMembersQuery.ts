import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { PaletteMember, Profile } from '../../types/palette';

// API: RPC와 profiles 테이블 조회를 결합하여 완전한 멤버 목록을 가져오는 함수
const getPaletteMembersWithProfiles = async (
  paletteId: string
): Promise<PaletteMember[]> => {
  if (!paletteId) {
    return [];
  }

  // 1. RPC를 통해 기본 멤버 정보(role, joined_at 등)를 가져옵니다.
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'get_palette_members',
    {
      p_palette_id: paletteId,
    }
  );

  if (rpcError) {
    console.error('Error fetching palette members via RPC:', rpcError);
    throw new Error(rpcError.message);
  }

  // 2. RPC 응답 데이터에 명시적으로 타입을 지정하여 'any' 타입 오류를 해결합니다.
  const members: PaletteMember[] = rpcData || [];

  if (members.length === 0) {
    return [];
  }

  // 3. 멤버들의 user_id 목록을 추출합니다. (이제 타입 오류 없음)
  const userIds = members.map((member) => member.user_id);

  // 4. user_id를 사용하여 profiles 테이블에서 상세 프로필 정보를 조회합니다.
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds);

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    // 프로필 조회에 실패하더라도 RPC로 가져온 기본 멤버 정보라도 반환합니다.
    return members;
  }

  // 5. 두 데이터를 병합합니다.
  const profilesMap = new Map<string, Profile>(
    (profiles || []).map((p) => [p.id, p])
  );

  const combinedMembers = members.map((member) => {
    const profile = profilesMap.get(member.user_id);
    return {
      ...member,
      email: profile?.email || member.email,
      full_name: profile?.full_name || member.full_name,
      avatar_url: profile?.avatar_url || member.avatar_url,
    };
  });

  return combinedMembers;
};

/**
 * 특정 팔레트의 모든 멤버 목록과 각 멤버의 프로필 정보를 함께 가져오는 React Query 훅입니다.
 * @param paletteId - 멤버 목록을 조회할 팔레트의 ID
 */
export function usePaletteMembersQuery(paletteId: string) {
  return useQuery<PaletteMember[], Error>({
    queryKey: ['paletteMembers', paletteId],
    queryFn: () => getPaletteMembersWithProfiles(paletteId),
    // 팔레트 ID가 있을 때만 쿼리를 실행합니다.
    enabled: !!paletteId,
  });
}
