import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Edit2, EyeOff, Pipette } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from '../hooks/queries/useCategoryMutation';
import { usePalette } from '../context/PaletteContext';
import { useAuth } from '../hooks/useAuth';
import { useCurrentPaletteRole } from '../hooks/useCurrentPaletteRole';
import { Icon } from '../components/common/Icon';
import {
  DEFAULT_ICONS,
  LEVEL_2_ICONS,
  ICON_CATEGORIES,
} from '../data/iconList';
import type { IconName } from '../types/icon';
import type { Category } from '../types/category';
import styles from './CategorySettingsPage.module.css';

// --- Constants ---
const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Teal
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#64748B', // Slate
];

// --- CategoryFormModal Component ---
interface CategoryFormModalProps {
  onClose: () => void;
  initialData?: Category;
  type: 'inc' | 'exp';
}

function CategoryFormModal({
  onClose,
  initialData,
  type,
}: CategoryFormModalProps) {
  const isEditMode = !!initialData;
  const { currentPalette } = usePalette();
  const { user } = useAuth();
  const { role } = useCurrentPaletteRole();
  const isAdmin = !user || role === 'owner' || role === 'admin';

  const addMutation = useAddCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [selectedIcon, setSelectedIcon] = useState<IconName>(
    (initialData?.icon as IconName) || 'Utensils'
  );
  const [selectedColor, setSelectedColor] = useState(
    initialData?.color || PRESET_COLORS[0]
  );
  const [iconLevel, setIconLevel] = useState(1);

  const handleSubmit = () => {
    if (!isAdmin) {
      toast.error('카테고리를 수정할 권한이 없습니다.');
      return;
    }
    if (!name.trim() || !currentPalette) return;

    if (isEditMode && initialData) {
      const promise = updateMutation.mutateAsync({
        paletteId: currentPalette.id,
        code: initialData.code,
        updates: {
          name,
          icon: selectedIcon,
          color: selectedColor,
        },
      });

      toast
        .promise(promise, {
          loading: '수정 중...',
          success: '카테고리가 수정되었습니다!',
          error: '수정에 실패했습니다.',
        })
        .then(onClose);
    } else {
      const newCode = `${type === 'inc' ? 'i' : 'c'}_${Date.now().toString(36)}`;

      const promise = addMutation.mutateAsync({
        palette_id: currentPalette.id,
        code: newCode,
        name,
        icon: selectedIcon,
        color: selectedColor,
      });

      toast
        .promise(promise, {
          loading: '추가 중...',
          success: '카테고리가 추가되었습니다!',
          error: '추가에 실패했습니다.',
        })
        .then(onClose);
    }
  };

  const renderIconList = () => {
    if (iconLevel === 1) {
      return (
        <div className={styles.iconGrid}>
          {DEFAULT_ICONS.map((iconName: IconName) => (
            <div
              key={iconName}
              className={`${styles.iconOption} ${
                selectedIcon === iconName ? styles.selected : ''
              }`}
              onClick={() => setSelectedIcon(iconName)}
            >
              <Icon name={iconName} size={20} />
            </div>
          ))}
        </div>
      );
    }
    if (iconLevel === 2) {
      return (
        <div className={styles.iconGrid}>
          {LEVEL_2_ICONS.map((iconName: IconName) => (
            <div
              key={iconName}
              className={`${styles.iconOption} ${
                selectedIcon === iconName ? styles.selected : ''
              }`}
              onClick={() => setSelectedIcon(iconName)}
            >
              <Icon name={iconName} size={20} />
            </div>
          ))}
        </div>
      );
    }
    return ICON_CATEGORIES.map(
      (category: { title: string; icons: IconName[] }) => (
        <div key={category.title}>
          <h4 className={styles.iconCategoryTitle}>{category.title}</h4>
          <div className={styles.iconGrid}>
            {category.icons.map((iconName: IconName) => (
              <div
                key={iconName}
                className={`${styles.iconOption} ${
                  selectedIcon === iconName ? styles.selected : ''
                }`}
                onClick={() => setSelectedIcon(iconName)}
              >
                <Icon name={iconName} size={20} />
              </div>
            ))}
          </div>
        </div>
      )
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {isEditMode ? '카테고리 수정' : '새 카테고리 추가'}
          </h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div>
            <div className={styles.sectionTitle}>이름</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리 이름 (예: 간식)"
              className={styles.input}
              disabled={!isAdmin}
            />
          </div>

          <div>
            <div className={styles.sectionTitle}>아이콘</div>
            {renderIconList()}
            {iconLevel < 3 && (
              <button
                className={styles.moreIconsButton}
                onClick={() => setIconLevel((prev) => prev + 1)}
              >
                + 더 많은 아이콘 보기
              </button>
            )}
          </div>

          <div>
            <div className={styles.sectionTitle}>색상</div>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  className={`${styles.colorOption} ${
                    selectedColor === color ? styles.selected : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => isAdmin && setSelectedColor(color)}
                />
              ))}
              <div
                className={styles.colorOption}
                onClick={() => isAdmin && colorInputRef.current?.click()}
              >
                <div
                  className={styles.customColorButton}
                  style={{ backgroundColor: selectedColor }}
                >
                  <Pipette
                    size={20}
                    color={
                      ['#ffffff', '#000000'].includes(selectedColor)
                        ? '#888'
                        : '#fff'
                    }
                  />
                </div>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className={styles.customColorInput}
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={
              !name.trim() || addMutation.isPending || updateMutation.isPending
            }
          >
            {isEditMode ? '수정 완료' : '추가하기'}
          </button>
        )}
      </div>
    </div>
  );
}

// --- Main Page Component ---
export function CategorySettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role } = useCurrentPaletteRole();
  const isAdmin = !user || role === 'owner' || role === 'admin';

  const [activeTab, setActiveTab] = useState<'exp' | 'inc'>('exp');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );

  const { data: categories = [] } = useCategoriesQuery();

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      activeTab === 'inc' ? c.code.startsWith('i') : !c.code.startsWith('i')
    );
  }, [categories, activeTab]);

  const handleAddClick = () => {
    if (!isAdmin) {
      toast.error('카테고리를 추가할 권한이 없습니다.');
      return;
    }
    setEditingCategory(undefined);
    setIsModalOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleHideClick = () => {
    toast('숨김 기능은 준비 중입니다.', { icon: '🚧' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className={styles.title}>카테고리 관리</h1>
        {isAdmin && (
          <button className={styles.addButton} onClick={handleAddClick}>
            <Plus size={24} />
          </button>
        )}
      </header>

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'exp' ? styles.active : ''}`}
          onClick={() => setActiveTab('exp')}
        >
          지출
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'inc' ? styles.active : ''}`}
          onClick={() => setActiveTab('inc')}
        >
          수입
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.categoryList}>
          {filteredCategories.map((category) => (
            <div key={category.code} className={styles.categoryItem}>
              <div
                className={styles.iconWrapper}
                style={{ backgroundColor: category.color }}
              >
                <Icon name={category.icon as IconName} size={20} color="#fff" />
              </div>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {isAdmin && (
                  <button
                    className={styles.actionButton}
                    onClick={() => handleEditClick(category)}
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                <button
                  className={styles.actionButton}
                  onClick={handleHideClick}
                >
                  <EyeOff size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <CategoryFormModal
          onClose={() => setIsModalOpen(false)}
          initialData={editingCategory}
          type={activeTab}
        />
      )}
    </div>
  );
}
