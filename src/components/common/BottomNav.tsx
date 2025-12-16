import { LayoutDashboard, ChartBarBig, User, List } from 'lucide-react'; // List 추가
import styles from './BottomNav.module.css';
import type { Page } from '../../App';

interface BottomNavProps {
  activePage: Page;

  onPageChange: (_page: Page) => void;
}

export function BottomNav({ activePage, onPageChange }: BottomNavProps) {
  return (
    <footer className={styles.bottomNav}>
      <button
        className={`${styles.navItem} ${activePage === 'dashboard' ? styles.active : ''}`}
        onClick={() => onPageChange('dashboard')}
      >
        <LayoutDashboard size={24} />
        <span>대시보드</span>
      </button>
      {/* 추가된 '전체 내역' 버튼 */}
      <button
        className={`${styles.navItem} ${activePage === 'transactions' ? styles.active : ''}`}
        onClick={() => onPageChange('transactions')}
      >
        <List size={24} />
        <span>전체 내역</span>
      </button>
      <button
        className={`${styles.navItem} ${activePage === 'stats' ? styles.active : ''}`}
        onClick={() => onPageChange('stats')}
      >
        <ChartBarBig size={24} />
        <span>통계</span>
      </button>
      <button
        className={`${styles.navItem} ${activePage === 'profile' ? styles.active : ''}`}
        onClick={() => onPageChange('profile')}
      >
        <User size={24} />
        <span>마이</span>
      </button>
    </footer>
  );
}
