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
      {/* 임시 테마 토글 버튼 */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', // 'fixed'에서 'absolute'로 변경
          top: 16,
          right: 16,
          zIndex: 999,
          background: 'none',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        테마 전환
      </button>

      {/* <Header title="Finpalette" /> */}
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Finpalette</h1>

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
