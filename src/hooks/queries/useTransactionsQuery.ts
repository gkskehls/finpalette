import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
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
  // console.log(`Fetching transactions for palette: ${paletteId}, page: ${page}`);

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
  // console.log('Fetching transactions from localStorage...');
  const storedData = localStorage.getItem('transactions');
  return storedData ? JSON.parse(storedData) : [];
};

// [서버] 달력용: 특정 월의 데이터 조회
const getCalendarTransactionsFromServer = async (
  paletteId: string,
  year: number,
  month: number // 1 ~ 12
): Promise<Transaction[]> => {
  // 해당 월의 시작일과 종료일 계산
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  // 다음 달의 0일 = 이번 달의 마지막 날
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

  // console.log(`Fetching calendar data: ${startDate} ~ ${endDate}`);

  const { data, error } = await supabase
    .from('transactions')
    .select('*, private_memos(content)')
    .eq('palette_id', paletteId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching calendar transactions:', error);
    throw new Error(error.message);
  }

  return data.map((tx: any) => ({
    ...tx,
    localId: tx.id,
    private_memo: tx.private_memos?.[0]?.content || '',
  }));
};

// [로컬] 달력용: 특정 월의 데이터 필터링
const getCalendarTransactionsFromLocal = async (
  year: number,
  month: number
): Promise<Transaction[]> => {
  const allTransactions = await getTransactionsFromLocal();
  const targetPrefix = `${year}-${String(month).padStart(2, '0')}`;

  return allTransactions.filter((tx) => tx.date.startsWith(targetPrefix));
};

// --- 커스텀 훅 ---

// 1. 리스트 뷰용 (무한 스크롤)
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

// 2. 달력 뷰용 (월별 조회)
export function useCalendarTransactionsQuery(
  year: number,
  month: number,
  enabled: boolean
) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { currentPalette } = usePalette();

  return useQuery<Transaction[], Error>({
    queryKey: [
      'calendar-transactions',
      user?.id ?? 'local',
      currentPalette?.id,
      year,
      month,
    ],
    queryFn: async () => {
      if (user) {
        if (currentPalette?.id) {
          return getCalendarTransactionsFromServer(
            currentPalette.id,
            year,
            month
          );
        }
        return [];
      } else {
        return getCalendarTransactionsFromLocal(year, month);
      }
    },
    enabled: enabled && !isAuthLoading && (!user || !!currentPalette?.id),
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지 (월 이동 시 재호출 방지)
  });
}
