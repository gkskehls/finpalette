import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { usePalettesQuery } from '../hooks/queries/usePalettesQuery';
import type { Palette } from '../types/palette';

interface PaletteContextType {
  palettes: Palette[];
  currentPalette: Palette | null;
  changePalette: (_id: string) => void;
  isLoading: boolean;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider = ({ children }: { children: ReactNode }) => {
  const { data: palettes = [], isLoading } = usePalettesQuery();
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null);

  // 팔레트 목록이 로드되면, 기본 팔레트를 설정합니다.
  useEffect(() => {
    if (isLoading || palettes.length === 0 || currentPalette) return;

    // 로컬 스토리지에서 마지막으로 사용한 팔레트 ID를 찾아봅니다.
    const lastUsedPaletteId = localStorage.getItem('lastUsedPaletteId');
    const lastUsedPalette = palettes.find((p) => p.id === lastUsedPaletteId);

    if (lastUsedPalette) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPalette(lastUsedPalette);
    } else {
      // 없으면 그냥 첫 번째 팔레트를 기본값으로 설정합니다.

      setCurrentPalette(palettes[0]);
    }
  }, [palettes, isLoading, currentPalette]);

  const changePalette = (id: string) => {
    const newPalette = palettes.find((p) => p.id === id);
    if (newPalette) {
      setCurrentPalette(newPalette);
      localStorage.setItem('lastUsedPaletteId', id);
    }
  };

  const value = {
    palettes,
    currentPalette,
    changePalette,
    isLoading,
  };

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePalette = () => {
  const context = useContext(PaletteContext);
  if (context === undefined) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
};
