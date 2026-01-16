import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TransactionFormModal.module.css';
import {
  X,
  Lock,
  Trash2,
  MessageSquareText,
  Check,
  Settings2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import type { Transaction } from '../../types/transaction';
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from '../../hooks/queries/useTransactionsMutation';
import type {
  NewTransaction,
  UpdateTransactionPayload,
} from '../../hooks/queries/useTransactionsMutation';
import { useAuth } from '../../hooks/useAuth';
import { useCurrentPaletteRole } from '../../hooks/useCurrentPaletteRole';
import { CategorySelector } from './CategorySelector';
import { ConfirmModal } from '../common/ConfirmModal';

// --- Auto-resizing Textarea 컴포넌트 ---
const AutoResizingTextarea = (
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [props.value]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return <textarea ref={textareaRef} {...props} onInput={handleInput} />;
};

interface TransactionFormModalProps {
  onClose: () => void;
  transactionToEdit?: Transaction;
  initialDate?: string; // 달력 뷰에서 선택된 날짜를 받기 위한 prop 추가
}

export function TransactionFormModal({
  onClose,
  transactionToEdit,
  initialDate,
}: TransactionFormModalProps) {
  const navigate = useNavigate();
  const isEditMode = !!transactionToEdit;
  const { user } = useAuth();
  const { role } = useCurrentPaletteRole();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // --- 권한 제어 로직 ---
  const canEdit = useMemo(() => {
    if (!user) return true; // 게스트 모드는 항상 수정 가능
    if (!isEditMode || !role) return false;
    if (role === 'owner' || role === 'admin') return true;
    if (role === 'editor' && transactionToEdit?.user_id === user.id)
      return true;
    return false;
  }, [isEditMode, user, role, transactionToEdit]);

  const canDelete = canEdit;
  const canSubmit = isEditMode ? canEdit : !user || role !== 'viewer';
  const isReadOnly = isEditMode && !canEdit;

  const { data: categories, isLoading: isLoadingCategories } =
    useCategoriesQuery();

  const { incomeCategories, expenseCategories } = useMemo(() => {
    const income = categories?.filter((c) => c.code.startsWith('i')) || [];
    const expense = categories?.filter((c) => c.code.startsWith('c')) || [];
    return { incomeCategories: income, expenseCategories: expense };
  }, [categories]);

  const [type, setType] = useState(transactionToEdit?.type || 'exp');
  const [amount, setAmount] = useState(
    transactionToEdit?.amount.toString() || ''
  );
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [category, setCategory] = useState(
    transactionToEdit?.category_code || ''
  );
  // 초기 날짜 설정 로직: 수정 모드이면 기존 날짜, 아니면 initialDate, 그것도 없으면 오늘 날짜
  const [date, setDate] = useState(
    transactionToEdit?.date ||
      initialDate ||
      new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(
    transactionToEdit?.description || ''
  );
  const [publicMemo, setPublicMemo] = useState(
    transactionToEdit?.public_memo || ''
  );
  const [privateMemo, setPrivateMemo] = useState(
    transactionToEdit?.private_memo || ''
  );

  // 변경 사항이 있는지 확인하는 로직
  const isDirty = useMemo(() => {
    if (isEditMode && transactionToEdit) {
      // 수정 모드: 기존 데이터와 비교
      return (
        type !== transactionToEdit.type ||
        amount !== transactionToEdit.amount.toString() ||
        category !== transactionToEdit.category_code ||
        date !== transactionToEdit.date ||
        description !== (transactionToEdit.description || '') ||
        publicMemo !== (transactionToEdit.public_memo || '') ||
        privateMemo !== (transactionToEdit.private_memo || '')
      );
    } else {
      // 신규 모드: 입력 필드에 값이 있는지 확인 (날짜, 타입, 카테고리는 기본값이 있으므로 제외)
      return (
        amount !== '' ||
        description !== '' ||
        publicMemo !== '' ||
        privateMemo !== ''
      );
    }
  }, [
    isEditMode,
    transactionToEdit,
    type,
    amount,
    category,
    date,
    description,
    publicMemo,
    privateMemo,
  ]);

  const addMutation = useAddTransactionMutation();
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();

  const dayOfWeek = useMemo(() => {
    if (!date) return '';
    const dateObj = new Date(date);
    const utcDate = new Date(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate()
    );
    return ['일', '월', '화', '수', '목', '금', '토'][utcDate.getDay()];
  }, [date]);

  useEffect(() => {
    if (isEditMode) return;

    if (!category && expenseCategories.length > 0) {
      const timer = setTimeout(() => {
        setCategory(expenseCategories[0].code);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditMode, category, expenseCategories]);

  const handleTypeChange = (newType: 'inc' | 'exp') => {
    setType(newType);
    const targetCategories =
      newType === 'inc' ? incomeCategories : expenseCategories;
    if (targetCategories.length > 0) {
      setCategory(targetCategories[0].code);
    } else {
      setCategory('');
    }
  };

  const handleCategorySettingClick = () => {
    if (isDirty) {
      setIsConfirmOpen(true);
    } else {
      navigate('/categories');
      // 페이지 전환이 시작된 후 모달을 닫기 위해 약간의 지연을 줌
      setTimeout(() => onClose(), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error('이 작업을 수행할 권한이 없습니다.');
      return;
    }
    if (!category) {
      toast.error('카테고리를 선택해주세요.');
      return;
    }

    const formData: NewTransaction = {
      type,
      amount: Number(amount),
      category_code: category,
      date,
      description,
      public_memo: publicMemo,
      private_memo: privateMemo,
    };

    if (isEditMode && transactionToEdit) {
      const targetId = user ? transactionToEdit.id : transactionToEdit.localId;
      if (!targetId) {
        toast.error('수정할 대상을 찾을 수 없습니다.');
        return;
      }
      const payload: UpdateTransactionPayload = {
        id: targetId,
        data: formData,
      };
      const promise = updateMutation.mutateAsync(payload);
      toast
        .promise(promise, {
          loading: '내역을 수정하는 중...',
          success: '내역이 수정되었습니다!',
          error: '수정에 실패했습니다.',
        })
        .then(() => onClose());
    } else {
      const promise = addMutation.mutateAsync(formData);
      toast
        .promise(promise, {
          loading: '내역을 저장하는 중...',
          success: '내역이 저장되었습니다!',
          error: '저장에 실패했습니다.',
        })
        .then(() => onClose());
    }
  };

  const handleDelete = () => {
    if (!canDelete) {
      toast.error('이 내역을 삭제할 권한이 없습니다.');
      return;
    }
    if (isEditMode && transactionToEdit) {
      if (window.confirm('이 내역을 정말 삭제하시겠습니까?')) {
        const targetId = user
          ? transactionToEdit.id
          : transactionToEdit.localId;
        if (!targetId) {
          toast.error('삭제할 대상을 찾을 수 없습니다.');
          return;
        }
        const promise = deleteMutation.mutateAsync(targetId);
        toast
          .promise(promise, {
            loading: '내역을 삭제하는 중...',
            success: '내역이 삭제되었습니다.',
            error: '삭제에 실패했습니다.',
          })
          .then(() => onClose());
      }
    }
  };

  const currentCategories =
    type === 'inc' ? incomeCategories : expenseCategories;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.modalHeader}>
            <button
              type="button"
              onClick={onClose}
              className={styles.closeButton}
            >
              <X size={24} />
            </button>
            <h2 className={styles.modalTitle}>
              {isEditMode
                ? isReadOnly
                  ? '내역 상세'
                  : '내역 수정'
                : '내역 추가'}
            </h2>
            {canSubmit && (
              <button
                type="submit"
                className={styles.saveButton}
                disabled={
                  addMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
              >
                <Check size={20} />
                저장
              </button>
            )}
          </div>

          <div className={styles.scrollableContent}>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'exp' ? styles.active : ''}`}
                onClick={() => handleTypeChange('exp')}
                disabled={!canSubmit}
              >
                지출
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'inc' ? styles.active : ''}`}
                onClick={() => handleTypeChange('inc')}
                disabled={!canSubmit}
              >
                수입
              </button>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date">날짜</label>
              <div className={styles.dateInputWrapper}>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={!canSubmit}
                />
                <span className={styles.dayOfWeek}>{dayOfWeek}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">금액</label>
              <input
                type="text"
                inputMode="numeric"
                id="amount"
                value={
                  isAmountFocused
                    ? amount
                    : amount
                      ? Number(amount).toLocaleString()
                      : ''
                }
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(numericValue);
                }}
                onFocus={() => setIsAmountFocused(true)}
                onBlur={() => setIsAmountFocused(false)}
                placeholder="0"
                required
                disabled={!canSubmit}
              />
            </div>

            <div
              className={styles.formGroup}
              style={{ alignItems: 'flex-start' }}
            >
              <label style={{ marginTop: '12px' }}>카테고리</label>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <CategorySelector
                    categories={currentCategories}
                    selectedCode={category}
                    onSelect={setCategory}
                    disabled={isLoadingCategories || !canSubmit}
                  />
                </div>
                {canSubmit && (
                  <button
                    type="button"
                    onClick={handleCategorySettingClick}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '10px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      height: '58px',
                      width: '58px',
                      flexShrink: 0,
                    }}
                    aria-label="카테고리 관리"
                  >
                    <Settings2 size={24} />
                  </button>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">내용</label>
              {isReadOnly ? (
                <div
                  className={`${styles.readOnlyField} ${!description && styles.empty}`}
                >
                  {description || '내용 없음'}
                </div>
              ) : (
                <AutoResizingTextarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="내용 입력 (선택)"
                  rows={1}
                />
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="publicMemo">공개 메모</label>
              {isReadOnly ? (
                <div
                  className={`${styles.readOnlyField} ${!publicMemo && styles.empty}`}
                >
                  {publicMemo || '공개 메모 없음'}
                </div>
              ) : (
                <div className={styles.memoContainer}>
                  <MessageSquareText size={16} className={styles.memoIcon} />
                  <AutoResizingTextarea
                    id="publicMemo"
                    className={styles.memoInput}
                    value={publicMemo}
                    onChange={(e) => setPublicMemo(e.target.value)}
                    placeholder="멤버들과 공유할 메모"
                    rows={1}
                  />
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="privateMemo">나만 보기</label>
              {isReadOnly ? (
                <div
                  className={`${styles.readOnlyField} ${!privateMemo && styles.empty}`}
                >
                  {privateMemo || '비공개 메모 없음'}
                </div>
              ) : (
                <div className={styles.memoContainer}>
                  <Lock size={16} className={styles.memoIcon} />
                  <AutoResizingTextarea
                    id="privateMemo"
                    className={styles.memoInput}
                    value={privateMemo}
                    onChange={(e) => setPrivateMemo(e.target.value)}
                    placeholder="나만 볼 수 있는 메모"
                    rows={1}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            {isEditMode && canDelete && (
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 size={16} />
                삭제
              </button>
            )}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            {canSubmit && (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={
                  addMutation.isPending ||
                  updateMutation.isPending ||
                  deleteMutation.isPending
                }
              >
                저장
              </button>
            )}
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="카테고리 관리로 이동"
        message={`작성 중인 내용이 모두 사라집니다.\n이동하시겠습니까?`}
        confirmText="이동"
        onConfirm={() => {
          navigate('/categories');
          // 페이지 전환 효과가 발생한 뒤 모달을 닫기 위해 지연 추가
          setTimeout(() => onClose(), 100);
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
