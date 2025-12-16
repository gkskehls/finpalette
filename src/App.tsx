import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import TransactionListPage from './pages/TransactionListPage';
import { ProfilePage } from './pages/ProfilePage';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';
import './App.css';

export type Page = 'dashboard' | 'stats' | 'transactions' | 'profile';

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'stats':
        return <StatsPage />;
      case 'transactions':
        return <TransactionListPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  const getPageTitle = (page: Page) => {
    switch (page) {
      case 'dashboard':
        return '대시보드';
      case 'transactions':
        return '전체 내역';
      case 'stats':
        return '통계';
      case 'profile':
        return '마이';
      default:
        return 'Finpalette';
    }
  };

  return (
    <div className="appContainer">
      <Header title={getPageTitle(activePage)} />
      <main className="mainContent">{renderPage()}</main>
      <BottomNav activePage={activePage} onPageChange={setActivePage} />
      <FloatingActionButton onClick={() => setIsModalOpen(true)} />
      {isModalOpen && (
        <TransactionFormModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
