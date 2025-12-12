import { Plus } from 'lucide-react';
import styles from './FloatingActionButton.module.css';

export function FloatingActionButton() {
  return (
    <button className={styles.fab}>
      <Plus size={32} />
    </button>
  );
}
