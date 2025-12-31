import { useInfiniteQuery } from '@tanstack/react-query';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { usePalette } from '../../context/PaletteContext';

const PAGE_SIZE = 20;

// --- API 함수 정의 ---

// [서버] Supabase에서 특정 팔레트의 거래 내역 가져오기 (페이지네이션 적용)
const getTransactionsFromServer = async (
  paletteId: string,
  page: number
): Promise<Transaction[]> => {
  console.log(`Fetching transactions for palette: ${paletteId}, page: ${page}`);

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('palette_id', paletteId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(error.message);
  }

  // Supabase 응답 데이터에는 localId가 없으므로, id를 기반으로 추가해줍니다.
  return data.map((tx) => ({ ...tx, localId: tx.id }));
};

// [로컬] 로컬 스토리지에서 거래 내역 가져오기 (전체 반환 - 로컬은 데이터가 적으므로)
const getTransactionsFromLocal = async (): Promise<Transaction[]> => {
  console.log('Fetching transactions from localStorage...');
  const storedData = localStorage.getItem('transactions');
  return storedData ? JSON.parse(storedData) : [];
};

// --- 커스텀 훅 ---

export function useTransactionsQuery() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPalette } = usePalette();

  return useInfiniteQuery<Transaction[], Error>({
    // 팔레트가 변경되면 데이터를 다시 불러옵니다.
    queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      if (user) {
        // 로그인 상태: 현재 선택된 팔레트가 있을 때만 서버에서 가져옵니다.
        if (currentPalette?.id) {
          return getTransactionsFromServer(
            currentPalette.id,
            pageParam as number
          );
        }
        return []; // 팔레트가 아직 로드되지 않았으면 빈 배열 반환
      } else {
        // 로그아웃 상태: 로컬 스토리지에서 데이터 가져오기 (페이지네이션 무시하고 한 번에 다 줌)
        // 로컬 모드에서는 첫 페이지(0)일 때만 데이터를 반환하고, 이후에는 빈 배열을 반환하여 종료시킴
        if ((pageParam as number) > 0) return [];
        return getTransactionsFromLocal();
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 데이터 개수가 PAGE_SIZE보다 작으면 더 이상 데이터가 없는 것임
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // 다음 페이지 번호 반환
      return allPages.length;
    },
    // 인증 로딩이 끝났고, (로그인 상태라면) 팔레트 정보도 있어야 쿼리를 실행합니다.
    enabled: !isAuthLoading && (!user || !!currentPalette?.id),
  });
}
