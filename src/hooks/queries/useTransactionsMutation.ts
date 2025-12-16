import { useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import type { Transaction } from '../../types/transaction';

// Omit 'localId' and 'id' as they will be generated
type NewTransaction = Omit<Transaction, 'localId' | 'id'>;

const addTransaction = async (
  newTransactionData: NewTransaction
): Promise<Transaction> => {
  console.log('Adding transaction to localStorage...', newTransactionData);
  const storedData = localStorage.getItem('transactions');
  const currentTransactions = storedData ? JSON.parse(storedData) : [];

  const newTransaction: Transaction = {
    ...newTransactionData,
    localId: uuidv4(),
    id: null, // Represents data not yet synced to the server
  };

  const updatedTransactions = [...currentTransactions, newTransaction];
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

  return newTransaction;
};

const deleteTransaction = async (localId: string): Promise<void> => {
  console.log('Deleting transaction from localStorage...', localId);
  const storedData = localStorage.getItem('transactions');
  if (!storedData) {
    return;
  }
  const currentTransactions: Transaction[] = JSON.parse(storedData);
  const updatedTransactions = currentTransactions.filter(
    (tx) => tx.localId !== localId
  );
  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
};

// --- 추가된 부분 ---
// 수정할 데이터의 타입 정의
export type UpdateTransactionPayload = {
  localId: string;
  data: Omit<Transaction, 'localId' | 'id'>;
};

const updateTransaction = async ({
  localId,
  data,
}: UpdateTransactionPayload): Promise<Transaction> => {
  console.log('Updating transaction in localStorage...', localId);
  const storedData = localStorage.getItem('transactions');
  if (!storedData) {
    throw new Error('No transactions found in local storage.');
  }
  const currentTransactions: Transaction[] = JSON.parse(storedData);

  let updatedTransaction: Transaction | undefined;

  const updatedTransactions = currentTransactions.map((tx) => {
    if (tx.localId === localId) {
      updatedTransaction = {
        ...tx, // 기존 id는 유지
        ...data, // 새로운 데이터로 덮어쓰기
      };
      return updatedTransaction;
    }
    return tx;
  });

  if (!updatedTransaction) {
    throw new Error('Transaction to update not found.');
  }

  localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  return updatedTransaction;
};
// --- 여기까지 ---

export function useAddTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, NewTransaction>({
    mutationFn: addTransaction,
    onSuccess: () => {
      console.log('Transaction added, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Failed to add transaction:', error);
    },
  });
}

export function useDeleteTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    // string은 localId의 타입
    mutationFn: deleteTransaction,
    onSuccess: () => {
      console.log('Transaction deleted, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Failed to delete transaction:', error);
    },
  });
}

// --- 추가된 부분 ---
export function useUpdateTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation<Transaction, Error, UpdateTransactionPayload>({
    mutationFn: updateTransaction,
    onSuccess: () => {
      console.log('Transaction updated, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Failed to update transaction:', error);
    },
  });
}
// --- 여기까지 ---
