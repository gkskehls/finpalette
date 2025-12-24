import { useMemo, useState } from 'react';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../config/constants';
import type { TransactionItem } from '../types/ui';
import type { Category } from '../types/category';

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

// UI용 카테고리 목록에 임시 palette_id 추가
const allCategories: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
].map((c) => ({
  ...c,
  palette_id: 'ui-default', // UI 표시용 기본값
}));

export function DashboardPage() {
  // TODO: 월 이동 기능을 위해 현재 날짜 상태 관리 필요
  const [currentDate] = useState(new Date());

  const { data: transactions = [], isLoading, error } = useTransactionsQuery();

  const categoryMap = useMemo(() => {
    return new Map(allCategories.map((cat) => [cat.code, cat]));
  }, []);

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

  // '이번 달' 거래 내역만 필터링
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

  // '이번 달' 요약 정보 계산
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <SummaryCard {...summary} />
      <CategorySection
        categories={allCategories}
        transactions={monthlyTransactions} // 이번 달 데이터 전달
      />
      <TransactionSection transactionGroups={transactionGroups} />
    </>
  );
}
