import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';
import { usePalette } from '../../context/PaletteContext';

// --- 타입 정의 ---

export type NewTransaction = Omit<
  Transaction,
  'localId' | 'id' | 'palette_id' | 'user_id'
>;

export type UpdateTransactionPayload = {
  id: string;
  data: NewTransaction;
};

// --- API 함수들 ---

// [서버] 데이터 추가
const addTransactionToServer = async (
  newTx: NewTransaction,
  userId: string,
  paletteId: string
): Promise<Transaction> => {
  console.log('Adding transaction to server:', {
    ...newTx,
    palette_id: paletteId,
    user_id: userId,
  });

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        ...newTx,
        palette_id: paletteId,
        user_id: userId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction to server:', error);
    throw error;
  }
  return { ...data, localId: data.id };
};

// [로컬] 데이터 추가
const addTransactionToLocal = async (
  newTx: NewTransaction
): Promise<Transaction> => {
  const current = JSON.parse(localStorage.getItem('transactions') || '[]');
  const newTransaction: Transaction = {
    ...newTx,
    localId: uuidv4(),
    id: null,
    palette_id: '',
    user_id: '',
  };
  localStorage.setItem(
    'transactions',
    JSON.stringify([...current, newTransaction])
  );
  return newTransaction;
};

// [서버] 데이터 수정
const updateTransactionOnServer = async ({
  id,
  data,
}: UpdateTransactionPayload): Promise<Transaction> => {
  const { data: updatedData, error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) {
    console.error('Error updating transaction on server:', error);
    throw error;
  }
  return { ...updatedData, localId: updatedData.id };
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
        return addTransactionToServer(newTx, user.id, currentPalette.id);
      } else {
        return addTransactionToLocal(newTx);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
      });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentPalette } = usePalette();

  return useMutation<Transaction, Error, UpdateTransactionPayload>({
    mutationFn: (payload) =>
      user
        ? updateTransactionOnServer(payload)
        : updateTransactionInLocal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
      });
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { currentPalette } = usePalette();

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      user ? deleteTransactionFromServer(id) : deleteTransactionFromLocal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local', currentPalette?.id],
      });
    },
  });
}
