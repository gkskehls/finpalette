import { Icon } from './Icon';

export function BottomNav() {
  return (
    <footer className="bottom-nav">
      <button className="nav-item active">
        <Icon name="LayoutDashboard" />
        <span>대시보드</span>
      </button>
      <button className="nav-item">
        <Icon name="BarChart2" />
        <span>통계</span>
      </button>
      <button className="nav-item">
        <Icon name="User" />
        <span>마이</span>
      </button>
    </footer>
  );
}
