import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { usePalette } from '../../context/PaletteContext';

// --- 타입 정의 ---

// private_memo는 별도 테이블로 관리되므로, 기본 타입에서 분리
export type NewTransaction = Omit<
  Transaction,
  'localId' | 'id' | 'palette_id' | 'user_id' | 'private_memo'
> & {
  private_memo?: string;
};

export type UpdateTransactionPayload = {
  id: string; // 서버 ID 또는 로컬 ID
  data: NewTransaction;
};

// --- API 함수들 ---

// [서버] 데이터 추가 또는 수정 (RPC 사용)
const upsertTransactionOnServer = async (
  payload: UpdateTransactionPayload,
  paletteId: string
): Promise<Transaction> => {
  const { id, data } = payload;
  const { private_memo, ...transactionData } = data;

  const { data: rpcData, error } = await supabase.rpc(
    'upsert_transaction_with_memos',
    {
      p_id: id.startsWith('local_') ? null : id, // 새 내역이면 null, 수정이면 id
      p_palette_id: paletteId,
      p_category_code: transactionData.category_code,
      p_date: transactionData.date,
      p_type: transactionData.type,
      p_amount: transactionData.amount,
      p_description: transactionData.description,
      p_public_memo: transactionData.public_memo,
      p_private_memo_content: private_memo,
    }
  );

  if (error) {
    console.error('Error upserting transaction on server:', error);
    throw error;
  }

  // RPC는 ID만 반환하므로, 전체 데이터를 다시 조회하여 반환
  const { data: fullData, error: selectError } = await supabase
    .from('transactions')
    .select('*, private_memos(content)')
    .eq('id', rpcData)
    .single();

  if (selectError) {
    console.error('Error fetching transaction after upsert:', selectError);
    throw selectError;
  }

  return {
    ...fullData,
    localId: fullData.id,
    private_memo: fullData.private_memos?.[0]?.content || '',
  };
};

// [로컬] 데이터 추가
const addTransactionToLocal = async (
  newTx: NewTransaction
): Promise<Transaction> => {
  const current = JSON.parse(localStorage.getItem('transactions') || '[]');
  const newTransaction: Transaction = {
    ...newTx,
    localId: `local_${uuidv4()}`,
    id: null,
    palette_id: 'local',
    user_id: 'guest',
  };
  localStorage.setItem(
    'transactions',
    JSON.stringify([...current, newTransaction])
  );
  return newTransaction;
};

// [로컬] 데이터 수정
const updateTransactionInLocal = async ({
  id,
  data,
}: UpdateTransactionPayload): Promise<Transaction> => {
  const current: Transaction[] = JSON.parse(
    localStorage.getItem('transactions') || '[]'
  );
  let updatedTx: Transaction | undefined;
  const updated = current.map((tx) => {
    if (tx.localId === id) {
      updatedTx = { ...tx, ...data };
      return updatedTx;
    }
    return tx;
  });
  if (!updatedTx) throw new Error('Transaction not found');
  localStorage.setItem('transactions', JSON.stringify(updated));
  return updatedTx;
};

// [서버] 데이터 삭제
const deleteTransactionFromServer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) {
    console.error('Error deleting transaction from server:', error);
    throw error;
  }
};

// [로컬] 데이터 삭제
const deleteTransactionFromLocal = async (localId: string): Promise<void> => {
  const current: Transaction[] = JSON.parse(
    localStorage.getItem('transactions') || '[]'
  );
  const updated = current.filter((tx) => tx.localId !== localId);
  localStorage.setItem('transactions', JSON.stringify(updated));
};

// --- 커스텀 훅 ---

export function useAddTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentPalette } = usePalette();

  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: (newTx) => {
      if (user) {
        if (!currentPalette) throw new Error('No active palette selected');
        const payload: UpdateTransactionPayload = {
          id: `local_${uuidv4()}`, // 임시 로컬 ID
          data: newTx,
        };
        return upsertTransactionOnServer(payload, currentPalette.id);
      } else {
        return addTransactionToLocal(newTx);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentPalette } = usePalette();

  return useMutation<Transaction, Error, UpdateTransactionPayload>({
    mutationFn: (payload) => {
      if (user) {
        if (!currentPalette) throw new Error('No active palette selected');
        return upsertTransactionOnServer(payload, currentPalette.id);
      } else {
        return updateTransactionInLocal(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      user ? deleteTransactionFromServer(id) : deleteTransactionFromLocal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
