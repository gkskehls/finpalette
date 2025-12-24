export type PaletteRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Palette {
  id: string;
  name: string;
  theme_color: string;
  owner_id: string;
  created_at: string;
}

export interface PaletteMember {
  id: string;
  palette_id: string;
  user_id: string;
  role: PaletteRole;
  joined_at: string;
}

export interface PaletteInvitation {
  id: string;
  palette_id: string;
  inviter_id: string;
  code: string;
  expires_at: string;
  is_used: boolean;
}
