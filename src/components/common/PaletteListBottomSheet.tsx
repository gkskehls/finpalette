import { X, Check, Plus } from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import styles from './PaletteListBottomSheet.module.css';

interface PaletteListBottomSheetProps {
  onClose: () => void;
  onAddPalette: () => void; // 새 팔레트 추가 버튼 클릭 시 핸들러
}

export function PaletteListBottomSheet({
  onClose,
  onAddPalette,
}: PaletteListBottomSheetProps) {
  const { palettes, currentPalette, changePalette } = usePalette();

  const handlePaletteClick = (paletteId: string) => {
    changePalette(paletteId);
    onClose(); // 선택 후 시트 닫기
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>팔레트 선택</span>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <ul className={styles.list}>
          {palettes.map((palette) => (
            <li
              key={palette.id}
              className={`${styles.item} ${currentPalette?.id === palette.id ? styles.active : ''}`}
              onClick={() => handlePaletteClick(palette.id)}
            >
              <div
                className={styles.colorDot}
                style={{ backgroundColor: palette.theme_color || '#6366F1' }}
              />
              <span className={styles.paletteName}>{palette.name}</span>
              {currentPalette?.id === palette.id && (
                <Check size={20} className={styles.checkIcon} />
              )}
            </li>
          ))}
        </ul>

        <button className={styles.addButton} onClick={onAddPalette}>
          <Plus size={20} />새 팔레트 만들기
        </button>
      </div>
    </div>
  );
}
