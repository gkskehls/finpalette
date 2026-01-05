import { useMemo, useState, useEffect } from 'react';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../config/constants';
import type { TransactionItem } from '../types/ui';
import type { Category } from '../types/category';
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

// UI용 카테고리 목록에 임시 palette_id 추가
const allCategories: Category[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
].map((c) => ({
  ...c,
  palette_id: 'ui-default', // UI 표시용 기본값
}));

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
  // TODO: 월 이동 기능을 위해 현재 날짜 상태 관리 필요
  const [currentDate] = useState(new Date());

  const { data, isLoading, error } = useTransactionsQuery();

  // 페이지 진입 시 스크롤 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // InfiniteData를 평탄화하여 하나의 배열로 만듦
  const transactions = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

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

  if (isLoading) return <DashboardSkeleton />;
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
