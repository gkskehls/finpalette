import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../types/transaction';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';

// --- 타입 정의 ---

export type NewTransaction = Omit<Transaction, 'localId' | 'id'>;
export type UpdateTransactionPayload = {
  id: string; // 로컬에서는 localId, 서버에서는 id
  data: NewTransaction;
};

// --- 헬퍼 함수 ---

// 사용자의 개인 팔레트를 가져오거나 생성 (migration.ts의 함수와 유사)
async function getOrCreatePersonalPalette(userId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('palettes')
    .select('id')
    .eq('owner_id', userId)
    .limit(1);

  if (existing && existing.length > 0) return existing[0].id;

  const { data: newPalette } = await supabase
    .from('palettes')
    .insert({ name: 'My Palette', owner_id: userId })
    .select('id')
    .single();

  if (!newPalette) throw new Error('Could not create or find palette.');

  await supabase
    .from('palette_members')
    .insert({ palette_id: newPalette.id, user_id: userId, role: 'owner' });

  return newPalette.id;
}

// --- API 함수들 ---

// [서버] 데이터 추가
const addTransactionToServer = async (
  newTx: NewTransaction,
  userId: string
): Promise<Transaction> => {
  const paletteId = await getOrCreatePersonalPalette(userId);
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...newTx, palette_id: paletteId }])
    .select()
    .single();

  if (error) throw error;
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
  if (error) throw error;
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
  if (error) throw error;
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

  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: (newTx) =>
      user
        ? addTransactionToServer(newTx, user.id)
        : addTransactionToLocal(newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local'],
      });
    },
  });
}

export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<Transaction, Error, UpdateTransactionPayload>({
    mutationFn: (payload) =>
      user
        ? updateTransactionOnServer(payload)
        : updateTransactionInLocal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local'],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['transactions', user?.id ?? 'local'],
      });
    },
  });
}
