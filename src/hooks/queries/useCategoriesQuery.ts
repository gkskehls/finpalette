import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { usePalette } from '../../context/PaletteContext';
import { useAuth } from '../useAuth';
import type { Category } from '../../types/category';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../config/constants';

// API: 특정 팔레트의 카테고리 목록을 가져오는 함수
const getCategoriesFromServer = async (
  paletteId: string
): Promise<Category[]> => {
  if (!paletteId) {
    return [];
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('palette_id', paletteId)
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching categories from server:', error);
    throw new Error(error.message);
  }

  return data;
};

// Local: 게스트 사용자를 위한 기본 카테고리 목록을 반환하는 함수
const getCategoriesFromLocal = async (): Promise<Category[]> => {
  // constants.ts의 데이터에 `palette_id` 속성을 추가하여 타입을 맞춥니다.
  const localCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map(
    (cat) => ({
      ...cat,
      palette_id: '', // 게스트 모드에서는 팔레트 ID가 없으므로 빈 문자열 추가
    })
  );
  return Promise.resolve(localCategories);
};

/**
 * 카테고리 목록을 가져오는 React Query 훅입니다.
 * - 로그인 시: 현재 팔레트의 카테고리를 DB에서 가져옵니다.
 * - 비로그인 시: constants.ts의 기본 카테고리 목록을 반환합니다.
 */
export function useCategoriesQuery() {
  const { user } = useAuth();
  const { currentPalette } = usePalette();
  const paletteId = currentPalette?.id;

  // 로그인 상태에 따라 쿼리 키와 함수를 동적으로 결정합니다.
  const queryKey = user ? ['categories', paletteId] : ['categories', 'local'];

  const queryFn = () => {
    if (user) {
      // 로그인 사용자는 DB에서 가져옵니다.
      if (!paletteId) return Promise.resolve([]); // 팔레트가 없으면 빈 배열 반환
      return getCategoriesFromServer(paletteId);
    } else {
      // 게스트 사용자는 로컬 상수를 사용합니다.
      return getCategoriesFromLocal();
    }
  };

  // 로그인 사용자는 팔레트가 선택되어야 쿼리가 활성화됩니다.
  // 게스트 사용자는 항상 활성화됩니다.
  const enabled = user ? !!paletteId : true;

  return useQuery<Category[], Error>({
    queryKey,
    queryFn,
    enabled,
  });
}
