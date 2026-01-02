import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types/category';

// 카테고리 추가
export function useAddCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newCategory: Omit<Category, 'created_at' | 'user_id'>
    ) => {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;

      const { error } = await supabase.from('categories').insert({
        ...newCategory,
        user_id: userId, // 생성자 ID 추가
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// 카테고리 수정
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paletteId,
      code,
      updates,
    }: {
      paletteId: string;
      code: string;
      updates: Partial<Omit<Category, 'palette_id' | 'code'>>;
    }) => {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('palette_id', paletteId)
        .eq('code', code);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// 카테고리 삭제
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      paletteId,
      code,
    }: {
      paletteId: string;
      code: string;
    }) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('palette_id', paletteId)
        .eq('code', code);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
