import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Icon } from '../common/Icon';
import type { Category } from '../../types/category';
import type { IconName } from '../../types/icon';
import styles from './CategorySelector.module.css';

interface CategorySelectorProps {
  categories: Category[];
  selectedCode: string;
  // eslint-disable-next-line no-unused-vars
  onSelect: (code: string) => void;
  disabled?: boolean;
}

export function CategorySelector({
  categories,
  selectedCode,
  onSelect,
  disabled = false,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((c) => c.code === selectedCode);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (code: string) => {
    onSelect(code);
    setIsOpen(false);
  };

  if (!selectedCategory && categories.length > 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.selectorButton}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
      >
        {selectedCategory ? (
          <div className={styles.selectedContent}>
            <div
              className={styles.iconWrapper}
              style={{ backgroundColor: selectedCategory.color }}
            >
              <Icon name={selectedCategory.icon as IconName} size={18} />
            </div>
            <span className={styles.categoryName}>{selectedCategory.name}</span>
          </div>
        ) : (
          <span className={styles.placeholder}>카테고리 선택</span>
        )}
        <ChevronDown
          size={20}
          className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
        />
      </div>

      {isOpen && (
        <div className={styles.gridContainer}>
          {categories.map((category) => (
            <div
              key={category.code}
              className={`${styles.categoryItem} ${
                category.code === selectedCode ? styles.selected : ''
              }`}
              onClick={() => handleSelect(category.code)}
            >
              <div
                className={styles.iconWrapper}
                style={{
                  backgroundColor: category.color,
                  opacity: category.code === selectedCode ? 1 : 0.7,
                }}
              >
                <Icon name={category.icon as IconName} size={18} />
              </div>
              <span className={styles.categoryItemName}>{category.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
