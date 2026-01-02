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
    .select('*, private_memos(content)') // private_memos 테이블 조인
    .eq('palette_id', paletteId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(error.message);
  }

  // Supabase 응답 데이터 가공
  return data.map((tx: any) => ({
    ...tx,
    localId: tx.id,
    // private_memos는 배열로 반환되므로, 첫 번째 요소의 content를 사용
    // RLS 정책에 의해 현재 사용자의 메모만 반환됨
    private_memo: tx.private_memos?.[0]?.content || '',
  }));
};

// [로컬] 로컬 스토리지에서 거래 내역 가져오기 (전체 반환)
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
    queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      if (user) {
        if (currentPalette?.id) {
          return getTransactionsFromServer(
            currentPalette.id,
            pageParam as number
          );
        }
        return [];
      } else {
        if ((pageParam as number) > 0) return [];
        return getTransactionsFromLocal();
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      return allPages.length;
    },
    enabled: !isAuthLoading && (!user || !!currentPalette?.id),
  });
}
