import React from 'react';
import { X, Check, Plus, Settings } from 'lucide-react';
import { usePalette } from '../../context/PaletteContext';
import type { Palette } from '../../types/palette';
import styles from './PaletteListBottomSheet.module.css';

interface PaletteListBottomSheetProps {
  onClose: () => void;
  onAddPalette: () => void;
  onOpenSettings: (_palette: Palette) => void; // 설정창 열기 핸들러 추가
}

export function PaletteListBottomSheet({
  onClose,
  onAddPalette,
  onOpenSettings,
}: PaletteListBottomSheetProps) {
  const { palettes, currentPalette, changePalette } = usePalette();

  const handlePaletteClick = (paletteId: string) => {
    changePalette(paletteId);
    onClose(); // 선택 후 시트 닫기
  };

  const handleSettingClick = (e: React.MouseEvent, palette: Palette) => {
    e.stopPropagation(); // 리스트 아이템 클릭 이벤트 전파 방지
    onOpenSettings(palette); // 부모에게 설정창 열기 요청
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
              <div className={styles.itemContent}>
                <div
                  className={styles.colorDot}
                  style={{
                    backgroundColor: palette.theme_color || '#6366F1',
                  }}
                />
                <span className={styles.paletteName}>{palette.name}</span>
                {currentPalette?.id === palette.id && (
                  <Check size={20} className={styles.checkIcon} />
                )}
              </div>
              <button
                className={styles.settingButton}
                onClick={(e) => handleSettingClick(e, palette)}
              >
                <Settings size={18} />
              </button>
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
