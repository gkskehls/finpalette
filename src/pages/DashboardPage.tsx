import { useMemo, useState } from 'react';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import type { TransactionItem } from '../types/ui';
import { Skeleton } from '../components/common/Skeleton';

import './DashboardPage.css';

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

const DashboardSkeleton = () => {
  return (
    <div
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Summary Card Skeleton */}
      <Skeleton width="100%" height={180} borderRadius={20} />

      {/* Category Section Skeleton */}
      <div>
        <Skeleton width={120} height={24} style={{ marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '12px', overflowX: 'hidden' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={80} height={100} borderRadius={12} />
          ))}
        </div>
      </div>

      {/* Transaction Section Skeleton */}
      <div>
        <Skeleton width={120} height={24} style={{ marginBottom: '16px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={70} borderRadius={12} />
          ))}
        </div>
      </div>
    </div>
  );
};

export function DashboardPage() {
  const [currentDate] = useState(new Date());

  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useTransactionsQuery();
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategoriesQuery();

  const isLoading = isLoadingTransactions || isLoadingCategories;
  const error = transactionsError || categoriesError;

  useScrollRestoration('dashboard', isLoading);

  const transactions = useMemo(() => {
    return transactionsData?.pages.flatMap((page) => page) || [];
  }, [transactionsData]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.code, cat]));
  }, [categories]);

  const enrichedTransactions: TransactionItem[] = useMemo(() => {
    return transactions.map((t) => ({
      ...t,
      category: categoryMap.get(t.category_code) || {
        code: 'unknown',
        name: '미분류',
        color: '#888888',
        icon: 'HelpCircle',
        palette_id: t.palette_id || 'unknown',
      },
    }));
  }, [transactions, categoryMap]);

  const monthlyTransactions = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month
      );
    });
  }, [transactions, currentDate]);

  const summary = useMemo(() => {
    return monthlyTransactions.reduce(
      (acc, t) => {
        if (t.type === 'inc') acc.totalIncome += t.amount;
        if (t.type === 'exp') acc.totalExpense += t.amount;
        acc.balance = acc.totalIncome - acc.totalExpense;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, balance: 0 }
    );
  }, [monthlyTransactions]);

  const transactionGroups = useMemo(
    () => groupTransactionsByDate(enrichedTransactions),
    [enrichedTransactions]
  );

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <SummaryCard {...summary} />
      <CategorySection
        categories={categories}
        transactions={monthlyTransactions}
      />
      <TransactionSection transactionGroups={transactionGroups} />
    </>
  );
}
