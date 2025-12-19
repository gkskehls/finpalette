import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';

// --- API 함수 정의 ---

// [서버] Supabase에서 거래 내역 가져오기
const getTransactionsFromServer = async (
  userId: string
): Promise<Transaction[]> => {
  console.log('Fetching transactions from Supabase server...');

  // 1. 사용자가 속한 팔레트 목록을 가져옵니다.
  const { data: memberPalettes, error: memberError } = await supabase
    .from('palette_members')
    .select('palette_id')
    .eq('user_id', userId);

  if (memberError) {
    console.error('Error fetching user palettes:', memberError);
    return [];
  }

  const paletteIds = memberPalettes.map((p) => p.palette_id);
  if (paletteIds.length === 0) {
    return []; // 속한 팔레트가 없으면 거래 내역도 없음
  }

  // 2. 해당 팔레트들에 속한 모든 거래 내역을 가져옵니다.
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .in('palette_id', paletteIds)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw new Error(error.message);
  }

  // Supabase 응답 데이터에는 localId가 없으므로, id를 기반으로 추가해줍니다.
  return data.map((tx) => ({ ...tx, localId: tx.id }));
};

// [로컬] 로컬 스토리지에서 거래 내역 가져오기
const getTransactionsFromLocal = async (): Promise<Transaction[]> => {
  console.log('Fetching transactions from localStorage...');
  const storedData = localStorage.getItem('transactions');
  return storedData ? JSON.parse(storedData) : [];
};

// --- 커스텀 훅 ---

export function useTransactionsQuery() {
  const { user, isLoading: isAuthLoading } = useAuth();

  return useQuery<Transaction[], Error>({
    // 사용자가 로그인하면 queryKey가 변경되어 데이터를 다시 불러옵니다.
    queryKey: ['transactions', user?.id ?? 'local'],
    queryFn: async () => {
      if (user) {
        // 로그인 상태: 서버에서 데이터 가져오기
        return getTransactionsFromServer(user.id);
      } else {
        // 로그아웃 상태: 로컬 스토리지에서 데이터 가져오기
        return getTransactionsFromLocal();
      }
    },
    // 인증 상태 로딩이 끝날 때까지 쿼리 실행을 비활성화합니다.
    // 이렇게 하면 불필요한 로컬 데이터 조회를 막아 화면 깜빡임을 방지할 수 있습니다.
    enabled: !isAuthLoading,
  });
}
