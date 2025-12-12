import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <button onClick={toggleTheme} className={styles.themeToggleButton}>
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </header>
  );
}
