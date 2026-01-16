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

// 게스트 모드를 위한 가상 팔레트 객체
const GUEST_PALETTE: Palette = {
  id: 'local',
  name: '나의 가계부',
  theme_color: '#6366F1', // 기본 테마 색상
  owner_id: 'guest',
  created_at: new Date().toISOString(),
};

interface PaletteContextType {
  palettes: Palette[];
  currentPalette: Palette | null;
  changePalette: (_id: string) => void;
  isLoading: boolean;
}

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: palettes = [], isLoading: isQueryLoading } = usePalettesQuery();

  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    () => localStorage.getItem('lastUsedPaletteId')
  );

  // 인증 확인 중이거나, (로그인 상태인데) 쿼리 로딩 중이면 로딩 상태로 간주
  const isLoading = isAuthLoading || (user ? isQueryLoading : false);

  const currentPalette = useMemo(() => {
    // 0. 인증 확인 중이면 null (스켈레톤 표시)
    if (isAuthLoading) {
      return null;
    }

    // 1. 게스트 모드일 경우, 항상 가상 팔레트 반환
    if (!user) {
      return GUEST_PALETTE;
    }

    // 2. 로딩 중이거나 팔레트가 없으면 null
    if (isLoading || palettes.length === 0) {
      return null;
    }

    // 3. 사용자가 명시적으로 선택한 팔레트가 목록에 있다면 그것을 반환
    if (selectedPaletteId) {
      const found = palettes.find((p) => p.id === selectedPaletteId);
      if (found) return found;
    }

    // 4. 선택된 게 없거나 유효하지 않다면 첫 번째 팔레트를 기본값으로 반환
    return palettes[0];
  }, [user, isLoading, palettes, selectedPaletteId, isAuthLoading]);

  useEffect(() => {
    if (currentPalette && user) {
      const storedId = localStorage.getItem('lastUsedPaletteId');
      if (storedId !== currentPalette.id) {
        localStorage.setItem('lastUsedPaletteId', currentPalette.id);
      }
    }
  }, [currentPalette, user]);

  const changePalette = (id: string) => {
    if (palettes.some((p) => p.id === id)) {
      setSelectedPaletteId(id);
      localStorage.setItem('lastUsedPaletteId', id);
    }
  };

  const value = {
    // 게스트 모드일 때는 가상 팔레트만 배열에 담아 반환
    palettes: user ? palettes : [GUEST_PALETTE],
    currentPalette,
    changePalette,
    isLoading,
  };

  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
};

export const usePalette = () => {
  const context = useContext(PaletteContext);
  if (context === undefined) {
    throw new Error('usePalette must be used within a PaletteProvider');
  }
  return context;
};
