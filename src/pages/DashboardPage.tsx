import { useEffect, useState } from 'react';
// import { Header } from '../components/common/Header';
// import { BottomNav } from '../components/common/BottomNav';
// import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';

import {
  mockSummary,
  mockCategories,
  mockTransactions,
  mockTransactionGroups,
} from '../data/mockData';

import './DashboardPage.css';

export function DashboardPage() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header-section">
        {' '}
        {/* 새로운 헤더 섹션 */}
        <h1 className="dashboard-title">Finpalette</h1> {/* 클래스 추가 */}
        {/* 임시 테마 토글 버튼 */}
        <button
          onClick={toggleTheme}
          className="theme-toggle-button" // 클래스 추가, 인라인 스타일 제거
        >
          테마 전환
        </button>
      </header>

      <main className="dashboard-main">
        <SummaryCard
          totalIncome={mockSummary.totalIncome}
          totalExpense={mockSummary.totalExpense}
          balance={mockSummary.balance}
        />
        <CategorySection
          categories={mockCategories}
          transactions={mockTransactions}
        />
        <TransactionSection transactionGroups={mockTransactionGroups} />
      </main>

      {/* <FloatingActionButton /> */}
      {/* <BottomNav /> */}
    </div>
  );
}
