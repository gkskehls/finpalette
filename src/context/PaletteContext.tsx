import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { usePalettesQuery } from '../hooks/queries/usePalettesQuery';
import { useAuth } from '../hooks/useAuth';
import type { Palette } from '../types/palette';

interface PaletteContextType {
  palettes: Palette[];
  currentPalette: Palette | null;
  changePalette: (_id: string) => void;
  isLoading: boolean;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { data: palettes = [], isLoading: isQueryLoading } = usePalettesQuery();

  // 로컬 스토리지에서 초기값을 가져오되, 상태로 관리합니다.
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    () => localStorage.getItem('lastUsedPaletteId')
  );

  // 로그아웃 상태(게스트 모드)일 때는 팔레트 로딩이 필요 없으므로 isLoading을 false로 처리
  const isLoading = user ? isQueryLoading : false;

  // currentPalette는 상태가 아니라 palettes와 selectedPaletteId를 기반으로 계산된 값(Derived State)입니다.
  const currentPalette = useMemo(() => {
    // 1. 로그아웃 상태거나 로딩 중이거나 팔레트가 없으면 null
    if (!user || isLoading || palettes.length === 0) return null;

    // 2. 사용자가 명시적으로 선택한 팔레트가 목록에 있다면 그것을 반환
    if (selectedPaletteId) {
      const found = palettes.find((p) => p.id === selectedPaletteId);
      if (found) return found;
    }

    // 3. 선택된 게 없거나 유효하지 않다면 첫 번째 팔레트를 기본값으로 반환
    return palettes[0];
  }, [user, isLoading, palettes, selectedPaletteId]);

  // currentPalette가 결정되면(특히 기본값으로 자동 선택된 경우), 로컬 스토리지에 동기화합니다.
  // 주의: 여기서 setState를 호출하지 않으므로 렌더링 루프가 발생하지 않습니다.
  useEffect(() => {
    if (currentPalette) {
      const storedId = localStorage.getItem('lastUsedPaletteId');
      if (storedId !== currentPalette.id) {
        localStorage.setItem('lastUsedPaletteId', currentPalette.id);
      }
    }
  }, [currentPalette]);

  const changePalette = (id: string) => {
    // 존재하는 팔레트인지 확인
    if (palettes.some((p) => p.id === id)) {
      setSelectedPaletteId(id);
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
