import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { usePalette } from '../../context/PaletteContext';

// --- 타입 정의 ---

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

// --- 공통 에러 핸들러 ---
const handleMutationError = (error: Error) => {
  if (error.message.includes('permission')) {
    toast.error('이 작업을 수행할 권한이 없습니다.');
  } else {
    toast.error('작업에 실패했습니다. 다시 시도해주세요.');
  }
  console.error('Transaction Mutation Error:', error);
};

// --- API 함수들 ---

const upsertTransactionOnServer = async (
  payload: UpdateTransactionPayload,
  paletteId: string
): Promise<Transaction> => {
  const { id, data } = payload;
  const { private_memo, ...transactionData } = data;

  const { data: rpcData, error } = await supabase.rpc(
    'upsert_transaction_with_memos',
    {
      p_id: id.startsWith('local_') ? null : id,
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

  if (error) throw error;

  const { data: fullData, error: selectError } = await supabase
    .from('transactions')
    .select('*, private_memos(content)')
    .eq('id', rpcData)
    .single();

  if (selectError) throw selectError;

  return {
    ...fullData,
    localId: fullData.id,
    private_memo: fullData.private_memos?.[0]?.content || '',
  };
};

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

const deleteTransactionFromServer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
};

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
          id: `local_${uuidv4()}`,
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
    onError: handleMutationError,
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
    onError: handleMutationError,
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
    onError: handleMutationError,
  });
}
