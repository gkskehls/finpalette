import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { v4 as uuidv4 } from 'uuid';
import type { PaletteInvitation } from '../../types/palette';

// API: 팔레트 초대 코드를 생성하는 함수
const createInvitation = async ({
  paletteId,
  inviterId,
}: {
  paletteId: string;
  inviterId: string;
}): Promise<PaletteInvitation> => {
  const code = uuidv4(); // 고유한 초대 코드 생성
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 1); // 24시간 후 만료

  const { data, error } = await supabase
    .from('palette_invitations')
    .insert({
      palette_id: paletteId,
      inviter_id: inviterId,
      code: code,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error(error.message);
  }

  return data;
};

/**
 * 팔레트 초대 링크를 생성하는 React Query 뮤테이션 훅입니다.
 */
export function useCreateInvitationMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<PaletteInvitation, Error, string>({
    mutationFn: (paletteId: string) => {
      if (!user) {
        throw new Error('User is not authenticated');
      }
      return createInvitation({ paletteId, inviterId: user.id });
    },
    onSuccess: (data) => {
      // 성공 시 'invitations' 쿼리를 무효화하여 초대 목록을 다시 불러올 수 있도록 합니다.
      queryClient.invalidateQueries({
        queryKey: ['invitations', data.palette_id],
      });
    },
  });
}
