import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import TransactionListPage from './pages/TransactionListPage';
import { ProfilePage } from './pages/ProfilePage';
import { InvitePage } from './pages/InvitePage';
import { CategorySettingsPage } from './pages/CategorySettingsPage';
import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  // 초대 페이지와 카테고리 설정 페이지에서는 헤더, 네비게이션, FAB를 숨깁니다.
  // (카테고리 설정 페이지는 자체 헤더를 가짐)
  const isFullScreenPage =
    location.pathname.startsWith('/invite') ||
    location.pathname.startsWith('/categories');

  return (
    <div className="appContainer">
      {/* 전역 토스트 설정 */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // 기본 옵션
          className: '',
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '20px',
            fontSize: '0.9rem',
            maxWidth: '90%',
          },
          // 성공 시 옵션
          success: {
            duration: 2000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          // 에러 시 옵션
          error: {
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {!isFullScreenPage && <Header />}

      <main className="mainContent">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionListPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/categories" element={<CategorySettingsPage />} />
        </Routes>
      </main>

      {!isFullScreenPage && (
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
