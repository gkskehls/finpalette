import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {actionLabel && onAction && (
        <button className={styles.actionButton} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
