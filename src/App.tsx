import { useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { StatsPage } from './pages/StatsPage';
import './App.css';

export type Page = 'dashboard' | 'stats' | 'profile';

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
