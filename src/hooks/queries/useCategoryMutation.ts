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
