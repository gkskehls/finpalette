import { usePalette } from '../context/PaletteContext';

/**
 * 현재 선택된 팔레트 정보를 가져오는 커스텀 훅입니다.
 * 이 훅은 PaletteContext의 값을 직접 반환합니다.
 * @returns {{
 *   currentPalette: Palette | null;
 *   changePalette: (id: string) => void;
 *   isLoading: boolean;
 * }}
 */
export const useCurrentPalette = () => {
  const context = usePalette();
  if (context === undefined) {
    throw new Error('useCurrentPalette must be used within a PaletteProvider');
  }
  return context;
};
