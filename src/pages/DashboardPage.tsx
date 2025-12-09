import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';

import { mockSummary, mockCategories, mockTransactions } from '../data/mockData';

import './DashboardPage.css';

export function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Header title="Finpalette" />

      <main className="dashboard-main">
        <SummaryCard
          year={mockSummary.year}
          month={mockSummary.month}
          income={mockSummary.income}
          expense={mockSummary.expense}
        />
        <CategorySection categories={mockCategories} />
        <TransactionSection transactionGroups={mockTransactions} />
      </main>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
}
