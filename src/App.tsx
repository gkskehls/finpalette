import { useEffect, useState } from 'react';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      {/* 임시 테마 토글 버튼 */}
      <button onClick={toggleTheme} style={{ position: 'fixed', top: 10, right: 10, zIndex: 999 }}>
        테마 전환
      </button>
      <DashboardPage />
    </>
  )
}

export default App
