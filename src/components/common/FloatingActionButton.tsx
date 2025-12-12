import { Plus } from 'lucide-react';
import styles from './FloatingActionButton.module.css';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="내역 추가">
      <Plus size={24} />
    </button>
  );
}
