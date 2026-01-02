import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { IconName } from '../../types/icon';

// 모든 아이콘을 동적으로 매핑하는 대신, 필요한 아이콘만 가져오는 것이 번들 사이즈에 좋지만,
// 현재는 아이콘 개수가 많아지고 동적 로딩이 필요하므로 전체를 매핑하는 방식을 고려할 수 있습니다.
// 하지만 Tree Shaking을 위해 필요한 것만 명시적으로 매핑하는 것이 원칙입니다.
// 여기서는 편의상 LucideIcons 전체를 import하여 매핑합니다.
// (프로덕션 최적화 시에는 필요한 것만 import하는 방식으로 변경을 고려해야 합니다.)

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
  // LucideIcons 객체에서 동적으로 컴포넌트를 찾습니다.
  // 타입 단언을 사용하여 TypeScript 에러를 방지합니다.
  const IconComponent = (LucideIcons as any)[name];

  if (!IconComponent) {
    console.warn(`Icon with name "${name}" is not found in lucide-react.`);
    // Fallback 아이콘 (물음표)
    const FallbackIcon = LucideIcons.HelpCircle;
    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};
