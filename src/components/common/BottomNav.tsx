import { LayoutDashboard, ChartBarBig, User } from 'lucide-react';
import styles from './BottomNav.module.css';

export function BottomNav() {
  return (
    <footer className={styles.bottomNav}>
      <button className={`${styles.navItem} ${styles.active}`}>
        <LayoutDashboard size={24} />
        <span>대시보드</span>
      </button>
      <button className={styles.navItem}>
        <ChartBarBig size={24} />
        <span>통계</span>
      </button>
      <button className={styles.navItem}>
        <User size={24} />
        <span>마이</span>
      </button>
    </footer>
  );
}
