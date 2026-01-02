import { useState, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Dynamic Imports for Code Splitting with Named Exports
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const StatsPage = lazy(() =>
  import('./pages/StatsPage').then((module) => ({ default: module.StatsPage }))
);
// `TransactionListPage` has a default export, so we can import it directly.
const TransactionListPage = lazy(() => import('./pages/TransactionListPage'));
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const InvitePage = lazy(() =>
  import('./pages/InvitePage').then((module) => ({
    default: module.InvitePage,
  }))
);
const CategorySettingsPage = lazy(() =>
  import('./pages/CategorySettingsPage').then((module) => ({
    default: module.CategorySettingsPage,
  }))
);

import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';
import './App.css';

// Declare LoadingIndicator outside of the App component
const LoadingIndicator = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}
  >
    로딩 중...
  </div>
);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();

  const isFullScreenPage =
    location.pathname.startsWith('/invite') ||
    location.pathname.startsWith('/categories');

  return (
    <div className="appContainer">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '20px',
            fontSize: '0.9rem',
            maxWidth: '90%',
          },
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
        <Suspense fallback={<LoadingIndicator />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/categories" element={<CategorySettingsPage />} />
          </Routes>
        </Suspense>
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
