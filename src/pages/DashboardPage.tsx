import { useState, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useAddTransactionMutation } from '../hooks/queries/useTransactionsMutation';
import { mockCategories } from '../data/mockData'; // Categories are still mocked for now
import type { Transaction } from '../types/transaction';
import type { TransactionItem } from '../types/ui';

import './DashboardPage.css';

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: TransactionItem[]) => {
  if (!transactions) return [];

  const grouped = transactions.reduce(
    (acc, curr) => {
      const date = curr.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(curr);
      return acc;
    },
    {} as Record<string, TransactionItem[]>
  );

  return Object.entries(grouped)
    .map(([date, transactions]) => ({ date, transactions }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: transactions = [], isLoading, error } = useTransactionsQuery();
  const addTransactionMutation = useAddTransactionMutation();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddTransaction = (data: Omit<Transaction, 'localId' | 'id'>) => {
    addTransactionMutation.mutate(data);
    handleCloseModal();
  };

  // Memoize processed data to avoid re-calculation on every render
  const categoryMap = useMemo(() => {
    return new Map(mockCategories.map((cat) => [cat.code, cat]));
  }, []);

  const enrichedTransactions: TransactionItem[] = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      category: categoryMap.get(t.category_code) || {
        code: 'unknown',
        name: '미분류',
        color: '#888888',
        icon: 'HelpCircle',
      },
    }));
  }, [transactions, categoryMap]);

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === 'inc') acc.totalIncome += t.amount;
        if (t.type === 'exp') acc.totalExpense += t.amount;
        acc.balance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [transactions]);

  const transactionGroups = useMemo(
    () => groupTransactionsByDate(enrichedTransactions),
    [enrichedTransactions]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="dashboard-container">
      <Header title="Finpalette" />

      <main className="dashboard-main">
        <SummaryCard {...summary} />
        <CategorySection
          categories={mockCategories}
          transactions={transactions}
        />
        <TransactionSection transactionGroups={transactionGroups} />
      </main>

      <FloatingActionButton onClick={handleOpenModal} />
      <BottomNav />

      {isModalOpen && (
        <TransactionFormModal
          onClose={handleCloseModal}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
}
