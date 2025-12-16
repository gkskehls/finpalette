import { useState, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../config/constants';
import type { TransactionItem } from '../types/ui';
import type { Page } from '../App';

import './DashboardPage.css';

interface DashboardPageProps {
  activePage: Page;

  onPageChange: (_page: Page) => void;
}

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

const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export function DashboardPage({
  activePage,
  onPageChange,
}: DashboardPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // TODO: 월 이동 기능을 위해 현재 날짜 상태 관리 필요
  const [currentDate] = useState(new Date());

  const { data: transactions = [], isLoading, error } = useTransactionsQuery();

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
    <div className="dashboard-container">
      <Header title="Finpalette" />

      <main className="dashboard-main">
        <SummaryCard {...summary} />
        <CategorySection
          categories={allCategories}
          transactions={monthlyTransactions} // 이번 달 데이터 전달
        />
        <TransactionSection transactionGroups={transactionGroups} />
      </main>

      <FloatingActionButton onClick={handleOpenModal} />
      <BottomNav activePage={activePage} onPageChange={onPageChange} />

      {isModalOpen && <TransactionFormModal onClose={handleCloseModal} />}
    </div>
  );
}
