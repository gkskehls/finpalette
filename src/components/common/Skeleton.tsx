import type { CSSProperties } from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  style,
}: SkeletonProps) {
  const computedStyle: CSSProperties = {
    width,
    height,
    borderRadius,
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={computedStyle}
      aria-hidden="true"
    />
  );
}
