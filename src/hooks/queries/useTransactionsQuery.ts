import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { usePalette } from '../../context/PaletteContext';

// --- API 함수 정의 ---

// [서버] Supabase에서 특정 팔레트의 거래 내역 가져오기
const getTransactionsFromServer = async (
  paletteId: string
): Promise<Transaction[]> => {
  console.log(`Fetching transactions for palette: ${paletteId}`);

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('palette_id', paletteId)
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
  const { currentPalette } = usePalette();

  return useQuery<Transaction[], Error>({
    // 팔레트가 변경되면 데이터를 다시 불러옵니다.
    queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
    queryFn: async () => {
      if (user) {
        // 로그인 상태: 현재 선택된 팔레트가 있을 때만 서버에서 가져옵니다.
        if (currentPalette?.id) {
          return getTransactionsFromServer(currentPalette.id);
        }
        return []; // 팔레트가 아직 로드되지 않았으면 빈 배열 반환
      } else {
        // 로그아웃 상태: 로컬 스토리지에서 데이터 가져오기
        return getTransactionsFromLocal();
      }
    },
    // 인증 로딩이 끝났고, (로그인 상태라면) 팔레트 정보도 있어야 쿼리를 실행합니다.
    enabled: !isAuthLoading && (!user || !!currentPalette?.id),
  });
}
