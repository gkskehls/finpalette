import type { IconName } from './icon';

export interface Category {
  code: string; // 카테고리 고유 코드 (PK)
  name: string;
  color: string;
  icon: IconName; // lucide-react 아이콘 이름
  palette_id: string; // 이 카테고리가 속한 팔레트의 ID
}
