import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import TransactionListPage from './pages/TransactionListPage'; // 추가
import './App.css';

export type Page = 'dashboard' | 'stats' | 'transactions' | 'profile'; // 'transactions' 추가

function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage activePage={activePage} onPageChange={setActivePage} />
        );
      case 'stats':
        return (
          <StatsPage activePage={activePage} onPageChange={setActivePage} />
        );
      // 추가된 부분
      case 'transactions':
        // TransactionListPage도 props를 받도록 구조를 맞춰야 합니다.
        // 우선은 props 없이 렌더링하고, 필요시 수정하겠습니다.
        return <TransactionListPage />;
      // TODO: 프로필 페이지 추가
      case 'profile':
        // 프로필 페이지도 props를 받도록 구조를 맞춰야 합니다.
        return <div>프로필 페이지</div>;
      default:
        return (
          <DashboardPage activePage={activePage} onPageChange={setActivePage} />
        );
    }
  };

  return <>{renderPage()}</>;
}

export default App;
