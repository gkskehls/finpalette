import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// 1. 팔레트 삭제 (Owner Only)
export function useDeletePaletteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paletteId: string) => {
      const { error } = await supabase
        .from('palettes')
        .delete()
        .eq('id', paletteId);

      if (error) throw error;
    },
    onSuccess: () => {
      // 팔레트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['palettes'] });
    },
  });
}

// 2. 멤버 추방 또는 나가기
export function useRemoveMemberMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paletteId,
      userId,
    }: {
      paletteId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from('palette_members')
        .delete()
        .eq('palette_id', paletteId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // 멤버 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ['paletteMembers', variables.paletteId],
      });
      // 내가 나간 경우 팔레트 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ['palettes'] });
    },
  });
}

// 3. 멤버 권한 변경 (Owner Only)
export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paletteId,
      userId,
      role,
    }: {
      paletteId: string;
      userId: string;
      role: 'admin' | 'editor' | 'viewer';
    }) => {
      const { error } = await supabase
        .from('palette_members')
        .update({ role })
        .eq('palette_id', paletteId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['paletteMembers', variables.paletteId],
      });
    },
  });
}

// 4. 팔레트 정보 수정 (이름, 테마 색상)
export function useUpdatePaletteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paletteId,
      name,
      themeColor,
    }: {
      paletteId: string;
      name?: string;
      themeColor?: string;
    }) => {
      const updates: { name?: string; theme_color?: string } = {};
      if (name) updates.name = name;
      if (themeColor) updates.theme_color = themeColor;

      const { error } = await supabase
        .from('palettes')
        .update(updates)
        .eq('id', paletteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['palettes'] });
    },
  });
}
