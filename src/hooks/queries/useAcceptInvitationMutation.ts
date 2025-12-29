import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';

// API: 초대 코드를 수락하는 함수 (RPC 호출)
const acceptInvitation = async (code: string): Promise<string> => {
  const { data, error } = await supabase.rpc('accept_invitation', {
    invitation_code: code,
  });

  if (error) {
    console.error('Error accepting invitation:', error);
    throw new Error(error.message);
  }

  return data; // 반환된 palette_id
};

/**
 * 팔레트 초대를 수락하는 React Query 뮤테이션 훅입니다.
 */
export function useAcceptInvitationMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (code: string) => {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      return acceptInvitation(code);
    },
    onSuccess: () => {
      // 성공 시 팔레트 목록을 갱신합니다.
      queryClient.invalidateQueries({ queryKey: ['palettes'] });
      // 필요하다면 해당 팔레트의 정보를 미리 fetch 할 수도 있습니다.
    },
  });
}
