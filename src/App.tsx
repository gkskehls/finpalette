import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import TransactionListPage from './pages/TransactionListPage';
import { ProfilePage } from './pages/ProfilePage';
import { InvitePage } from './pages/InvitePage';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // 초대 페이지에서는 헤더, 네비게이션, FAB를 숨깁니다.
  const isInvitePage = location.pathname.startsWith('/invite');

  return (
    <div className="appContainer">
      {!isInvitePage && <Header />}

      <main className="mainContent">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionListPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invite" element={<InvitePage />} />
        </Routes>
      </main>

      {!isInvitePage && (
        <>
          <BottomNav />
          <FloatingActionButton onClick={() => setIsModalOpen(true)} />
        </>
      )}

      {isModalOpen && (
        <TransactionFormModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
