import { useState, useEffect } from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import { PaletteListBottomSheet } from './PaletteListBottomSheet';
import { PaletteFormModal } from '../palette/PaletteFormModal';
import styles from './Header.module.css';

interface HeaderProps {
  title: string; // 페이지 기본 제목 (팔레트 없을 때 표시)
}

export function Header({ title }: HeaderProps) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { currentPalette, isLoading } = usePalette();

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

  const getHeaderTitle = () => {
    if (isLoading) {
      return '로딩 중...';
    }
    if (currentPalette) {
      return currentPalette.name;
    }
    return title;
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
