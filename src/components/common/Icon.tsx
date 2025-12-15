import React from 'react';
import {
  Briefcase,
  Coins,
  Landmark,
  Store,
  PlusSquare,
  Utensils,
  Bus,
  Smartphone,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  GraduationCap,
  Users,
  PiggyBank,
  HelpCircle,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { IconName } from '../../types/icon';

const iconMap: Record<IconName, React.ElementType> = {
  Briefcase,
  Coins,
  Landmark,
  Store,
  PlusSquare,
  Utensils,
  Bus,
  Smartphone,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  GraduationCap,
  Users,
  PiggyBank,
  HelpCircle,
};

interface IconProps extends Omit<LucideProps, 'name'> {
  name: IconName;
}

/**
 * Finpalette 프로젝트의 모든 아이콘을 관리하는 중앙 컴포넌트입니다.
 * agents.md 가이드라인에 따라, types/icon.ts에 정의된 아이콘만 사용합니다.
 *
 * @param name - IconName 타입으로 정의된 아이콘 이름
 * @param color - 아이콘 색상 (기본값: currentColor)
 * @param size - 아이콘 크기 (기본값: 24)
 * @param strokeWidth - 아이콘 선 굵기 (기본값: 2)
 * @returns {JSX.Element | null} 렌더링된 아이콘
 */
export const Icon = ({ name, ...props }: IconProps) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon with name "${name}" is not defined in the iconMap.`);
    return null;
  }

  return <IconComponent {...props} />;
};
