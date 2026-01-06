import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

interface UpdateProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

const updateProfile = async ({ id, ...updates }: UpdateProfileData) => {
  // 1. profiles 테이블 업데이트
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // 2. Auth 세션 메타데이터 업데이트
  // DB뿐만 아니라 현재 로그인된 세션의 메타데이터도 함께 업데이트하여,
  // 새로고침 시 구버전 데이터(이미지 등)가 잠깐 보이는 현상(FOUC)을 방지합니다.
  if (updates.full_name || updates.avatar_url) {
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        ...(updates.full_name && { full_name: updates.full_name }),
        ...(updates.avatar_url && { avatar_url: updates.avatar_url }),
      },
    });

    if (authError) {
      console.warn('Failed to update auth metadata:', authError);
      // 메타데이터 업데이트 실패는 치명적이지 않으므로 흐름을 중단하지 않습니다.
    }
  }

  return data;
};

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
    },
  });
}
