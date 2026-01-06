import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { usePalette } from '../context/PaletteContext';
import { usePaletteMembersQuery } from './queries/usePaletteMembersQuery';

export const useCurrentPaletteRole = () => {
  const { user } = useAuth();
  const { currentPalette } = usePalette();
  const { data: members, isLoading } = usePaletteMembersQuery(
    currentPalette?.id
  );

  const role = useMemo(() => {
    if (!user || !currentPalette) return null;
    if (currentPalette.id === 'local') return 'owner'; // 게스트는 항상 소유자
    if (!members) return null;

    const currentUserMember = members.find(
      (member) => member.user_id === user.id
    );
    return currentUserMember?.role || null;
  }, [user, currentPalette, members]);

  return { role, isLoading };
};
