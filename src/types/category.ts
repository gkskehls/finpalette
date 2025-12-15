import type { IconName } from './icon';

export interface Category {
  code: string; // 카테고리 고유 코드 (PK)
  name: string;
  color: string;
  icon: IconName; // lucide-react 아이콘 이름
}
