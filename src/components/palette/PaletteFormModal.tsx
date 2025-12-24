import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { useAddPaletteMutation } from '../../hooks/queries/useAddPaletteMutation';
import { usePalette } from '../../context/PaletteContext';
import styles from './PaletteFormModal.module.css';

interface PaletteFormModalProps {
  onClose: () => void;
}

const THEME_COLORS = [
  '#6366F1', // Indigo (Default)
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function PaletteFormModal({ onClose }: PaletteFormModalProps) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  const { mutate: addPalette, isPending } = useAddPaletteMutation();
  const { changePalette } = usePalette();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPalette(
      { name, theme_color: selectedColor },
      {
        onSuccess: (newPaletteId) => {
          // 생성 후 해당 팔레트로 자동 전환
          changePalette(newPaletteId);
          onClose();
        },
      }
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>새 팔레트 만들기</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="paletteName" className={styles.label}>
              팔레트 이름
            </label>
            <input
              id="paletteName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 우리 가족 가계부"
              className={styles.input}
              autoFocus
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>테마 색상</label>
            <div className={styles.colorGrid}>
              {THEME_COLORS.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorOption} ${
                    selectedColor === color ? styles.selected : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isPending || !name.trim()}
          >
            {isPending ? '생성 중...' : '만들기'}
          </button>
        </form>
      </div>
    </div>
  );
}
