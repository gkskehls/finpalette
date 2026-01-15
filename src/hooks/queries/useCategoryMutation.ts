import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import type { Category } from '../../types/category';
import { useAuth } from '../useAuth';

const LOCAL_STORAGE_KEY = 'categories';

// --- 타입 정의 ---
type NewCategoryPayload = Omit<Category, 'created_at' | 'user_id'>;
type UpdateCategoryPayload = {
  paletteId: string;
  code: string;
  updates: Partial<Omit<Category, 'palette_id' | 'code'>>;
};
type DeleteCategoryPayload = { paletteId: string; code: string };
type UpdateCategoryOrderPayload = {
  paletteId: string;
  categoryCodes: string[];
};

// --- 공통 에러 핸들러 ---
const handleMutationError = (error: Error) => {
  if (error.message.includes('permission')) {
    toast.error('이 작업을 수행할 권한이 없습니다.');
  } else {
    toast.error('작업에 실패했습니다. 다시 시도해주세요.');
  }
  console.error('Category Mutation Error:', error);
};

// --- API 함수들 ---

// [서버] 카테고리 추가
const addCategoryToServer = async (payload: NewCategoryPayload) => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  const { error } = await supabase
    .from('categories')
    .insert({ ...payload, user_id: userId });
  if (error) throw error;
};

// [로컬] 카테고리 추가
const addCategoryToLocal = async (payload: NewCategoryPayload) => {
  const current: Category[] = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
  );
  const updated = [...current, payload];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

// [서버] 카테고리 수정
const updateCategoryOnServer = async (payload: UpdateCategoryPayload) => {
  const { paletteId, code, updates } = payload;
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('palette_id', paletteId)
    .eq('code', code);
  if (error) throw error;
};

// [로컬] 카테고리 수정
const updateCategoryInLocal = async (payload: UpdateCategoryPayload) => {
  const { code, updates } = payload;
  const current: Category[] = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
  );
  const updated = current.map((cat) =>
    cat.code === code ? { ...cat, ...updates } : cat
  );
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

// [서버] 카테고리 삭제
const deleteCategoryFromServer = async (payload: DeleteCategoryPayload) => {
  const { paletteId, code } = payload;
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('palette_id', paletteId)
    .eq('code', code);
  if (error) throw error;
};

// [로컬] 카테고리 삭제
const deleteCategoryFromLocal = async (payload: DeleteCategoryPayload) => {
  const { code } = payload;
  const current: Category[] = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
  );
  const updated = current.filter((cat) => cat.code !== code);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};

// [서버] 카테고리 순서 변경
const updateCategoryOrderOnServer = async (
  payload: UpdateCategoryOrderPayload
) => {
  const { paletteId, categoryCodes } = payload;
  const { error } = await supabase.rpc('update_category_order', {
    p_palette_id: paletteId,
    p_category_codes: categoryCodes,
  });
  if (error) throw error;
};

// [로컬] 카테고리 순서 변경
const updateCategoryOrderInLocal = async (
  payload: UpdateCategoryOrderPayload
) => {
  const { categoryCodes } = payload;
  const current: Category[] = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || '[]'
  );

  // categoryCodes 순서대로 정렬하고 sort_order 업데이트
  const updated = categoryCodes
    .map((code, index) => {
      const category = current.find((c) => c.code === code);
      if (category) {
        return { ...category, sort_order: index + 1 };
      }
      return null;
    })
    .filter((c) => c !== null) as Category[];

  // 누락된 카테고리가 있다면 뒤에 붙임 (안전장치)
  const missing = current.filter((c) => !categoryCodes.includes(c.code));
  const finalUpdated = [...updated, ...missing];

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalUpdated));
};

// --- 커스텀 훅 ---

export function useAddCategoryMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, NewCategoryPayload>({
    mutationFn: (payload) =>
      user ? addCategoryToServer(payload) : addCategoryToLocal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: handleMutationError,
  });
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, UpdateCategoryPayload>({
    mutationFn: (payload) =>
      user ? updateCategoryOnServer(payload) : updateCategoryInLocal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: handleMutationError,
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, DeleteCategoryPayload>({
    mutationFn: (payload) =>
      user
        ? deleteCategoryFromServer(payload)
        : deleteCategoryFromLocal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: handleMutationError,
  });
}

export function useCategoryOrderMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, UpdateCategoryOrderPayload>({
    mutationFn: (payload) =>
      user
        ? updateCategoryOrderOnServer(payload)
        : updateCategoryOrderInLocal(payload),
    onSuccess: () => {
      // 낙관적 업데이트를 위해 쿼리 무효화 전 딜레이를 주거나,
      // setQueryData를 사용하는 것이 좋지만, 여기서는 단순 무효화 처리
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: handleMutationError,
  });
}
