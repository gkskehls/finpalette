import { icons } from 'lucide-react';
import type { SVGProps } from 'react';

// lucide-react의 LucideProps와 유사하게 필요한 속성만 명시적으로 정의합니다.
interface IconProps extends SVGProps<SVGSVGElement> {
  name: keyof typeof icons;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Finpalette 프로젝트의 모든 아이콘을 관리하는 중앙 컴포넌트입니다.
 *
 * @param name - lucide-react 아이콘 이름 (https://lucide.dev/icons/)
 * @param color - 아이콘 색상 (기본값: currentColor)
 * @param size - 아이콘 크기 (기본값: 24)
 * @param strokeWidth - 아이콘 선 굵기 (기본값: 2)
 * @returns {JSX.Element | null} 렌더링된 아이콘
 */
export const Icon = ({
  name,
  color,
  size,
  strokeWidth,
  ...props
}: IconProps) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    // 개발 중 실수를 방지하기 위해 콘솔에 경고를 표시합니다.
    console.warn(`Icon with name "${name}" not found.`);
    return null;
  }

  // 모든 아이콘에 일관된 기본값을 적용합니다.
  return (
    <LucideIcon
      color={color}
      size={size ?? 24}
      strokeWidth={strokeWidth ?? 2}
      {...props}
    />
  );
};
