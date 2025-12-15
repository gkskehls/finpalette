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
      // Here you could add user-facing error handling, e.g., a toast notification
    },
  });
}
