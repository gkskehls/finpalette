import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { usePalette } from '../../context/PaletteContext';
import { useAuth } from '../useAuth';
import type { Category } from '../../types/category';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../config/constants';

// --- 상수 ---
const LOCAL_STORAGE_KEY = 'categories';
const DEFAULT_CATEGORIES: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
].map((cat) => ({
  ...cat,
  palette_id: 'local', // 게스트 모드용 가상 팔레트 ID
}));

// --- API 함수들 ---

// [서버] DB에서 카테고리 목록 가져오기
const getCategoriesFromServer = async (
  paletteId: string
): Promise<Category[]> => {
  if (!paletteId) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('palette_id', paletteId)
    .order('code', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

// [로컬] 로컬 스토리지에서 카테고리 목록 가져오기
const getCategoriesFromLocal = async (): Promise<Category[]> => {
  const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedData) {
    return JSON.parse(storedData);
  }
  // 로컬 스토리지에 데이터가 없으면 기본값으로 초기화
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
};

// --- 커스텀 훅 ---

export function useCategoriesQuery() {
  const { user } = useAuth();
  const { currentPalette } = usePalette();
  const paletteId = currentPalette?.id;

  const queryKey = user ? ['categories', paletteId] : ['categories', 'local'];

  const queryFn = () => {
    if (user) {
      if (!paletteId) return Promise.resolve([]);
      return getCategoriesFromServer(paletteId);
    } else {
      return getCategoriesFromLocal();
    }
  };

  const enabled = user ? !!paletteId : true;

  return useQuery<Category[], Error>({
    queryKey,
    queryFn,
    enabled,
  });
}
