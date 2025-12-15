import { LayoutDashboard, ChartBarBig, User } from 'lucide-react';
import styles from './BottomNav.module.css';
import type { Page } from '../../App';

interface BottomNavProps {
  activePage: Page;
  // eslint-disable-next-line no-unused-vars
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
