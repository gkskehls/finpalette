import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../useAuth';

interface AddPaletteVariables {
  name: string;
  theme_color: string;
}

const addPalette = async ({
  name,
  theme_color,
}: AddPaletteVariables): Promise<string> => {
  const { data, error } = await supabase.rpc('create_palette', {
    name,
    theme_color,
  });

  if (error) {
    console.error('Error creating palette:', error);
    throw new Error(error.message);
  }

  return data; // Returns the new palette ID
};

export function useAddPaletteMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation<string, Error, AddPaletteVariables>({
    mutationFn: addPalette,
    onSuccess: () => {
      // Refresh the palettes list for the current user
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['palettes', user.id] });
      }
    },
  });
}
