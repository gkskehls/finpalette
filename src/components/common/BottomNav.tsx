import { LayoutDashboard, ChartBarBig, User, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // 현재 경로가 해당 탭의 경로와 일치하는지 확인 (루트 경로는 대시보드로 취급)
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <footer className={styles.bottomNav}>
      <button
        className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
        onClick={() => navigate('/')}
      >
        <LayoutDashboard size={24} />
        <span>대시보드</span>
      </button>
      <button
        className={`${styles.navItem} ${isActive('/transactions') ? styles.active : ''}`}
        onClick={() => navigate('/transactions')}
      >
        <List size={24} />
        <span>전체 내역</span>
      </button>
      <button
        className={`${styles.navItem} ${isActive('/stats') ? styles.active : ''}`}
        onClick={() => navigate('/stats')}
      >
        <ChartBarBig size={24} />
        <span>통계</span>
      </button>
      <button
        className={`${styles.navItem} ${isActive('/profile') ? styles.active : ''}`}
        onClick={() => navigate('/profile')}
      >
        <User size={24} />
        <span>마이</span>
      </button>
    </footer>
  );
}
