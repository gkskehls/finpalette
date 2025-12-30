import { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { usePalette } from '../../context/PaletteContext';
import { PaletteListBottomSheet } from './PaletteListBottomSheet';
import { PaletteFormModal } from '../palette/PaletteFormModal';
import styles from './Header.module.css';

export function Header() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentPalette, isLoading } = usePalette();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleTitleClick = () => {
    setIsSheetOpen(true);
  };

  const handleAddPalette = () => {
    setIsSheetOpen(false);
    setIsFormOpen(true);
  };

  // 현재 경로에 따른 기본 제목 결정
  const getDefaultTitle = () => {
    const path = location.pathname;
    if (path === '/') return '대시보드';
    if (path.startsWith('/transactions')) return '전체 내역';
    if (path.startsWith('/stats')) return '통계';
    if (path.startsWith('/profile')) return '마이';
    if (path.startsWith('/invite')) return '초대';
    return 'Finpalette';
  };

  const getHeaderTitle = () => {
    if (isLoading) {
      return '로딩 중...';
    }
    // 팔레트가 선택되어 있으면 팔레트 이름을 우선 표시
    if (currentPalette) {
      return currentPalette.name;
    }
    return getDefaultTitle();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.titleContainer} onClick={handleTitleClick}>
          <h1 className={styles.title}>{getHeaderTitle()}</h1>
          <ChevronDown size={20} className={styles.chevronIcon} />
        </div>
        <button onClick={toggleTheme} className={styles.themeToggleButton}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </header>

      {isSheetOpen && (
        <PaletteListBottomSheet
          onClose={() => setIsSheetOpen(false)}
          onAddPalette={handleAddPalette}
        />
      )}

      {isFormOpen && <PaletteFormModal onClose={() => setIsFormOpen(false)} />}
    </>
  );
}
