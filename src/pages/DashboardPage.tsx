import { useState } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { FloatingActionButton } from '../components/common/FloatingActionButton';
import { SummaryCard } from '../components/dashboard/SummaryCard';
import { CategorySection } from '../components/dashboard/CategorySection';
import { TransactionSection } from '../components/dashboard/TransactionSection';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';

import {
  mockSummary,
  mockCategories,
  mockTransactions,
  mockTransactionGroups,
} from '../data/mockData';

import './DashboardPage.css';

export function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="dashboard-container">
      <Header title="Finpalette" />

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

      <FloatingActionButton onClick={handleOpenModal} />
      <BottomNav />

      {isModalOpen && (
        <TransactionFormModal
          onClose={handleCloseModal}
          onSubmit={(data) => console.log(data)}
        />
      )}
    </div>
  );
}
