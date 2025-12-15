import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '../../types/transaction';

const getTransactions = async (): Promise<Transaction[]> => {
  console.log('Fetching transactions from localStorage...');
  const storedData = localStorage.getItem('transactions');
  if (storedData) {
    return JSON.parse(storedData);
  }
  return [];
};

export function useTransactionsQuery() {
  return useQuery<Transaction[], Error>({
    queryKey: ['transactions'],
    queryFn: getTransactions,
  });
}
