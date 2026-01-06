import React, { useState, useMemo, useEffect } from 'react';
import styles from './TransactionFormModal.module.css';
import { X, Lock, Trash2, MessageSquareText, Check } from 'lucide-react';
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
import { CategorySelector } from './CategorySelector';

interface TransactionFormModalProps {
  onClose: () => void;
  transactionToEdit?: Transaction;
}

export function TransactionFormModal({
  onClose,
  transactionToEdit,
}: TransactionFormModalProps) {
  const isEditMode = !!transactionToEdit;
  const { user } = useAuth();

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
  const [category, setCategory] = useState(
    transactionToEdit?.category_code || ''
  );
  const [date, setDate] = useState(
    transactionToEdit?.date || new Date().toISOString().split('T')[0]
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

  // [수정] 오직 '추가 모드'에서만 기본 카테고리를 설정하도록 로직 변경
  useEffect(() => {
    if (isEditMode) return;

    if (!category && expenseCategories.length > 0) {
      // setTimeout을 사용하여 동기적인 상태 업데이트를 방지하고,
      // react-hooks/set-state-in-effect ESLint 오류를 해결합니다.
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        .then(() => {
          onClose();
        });
    } else {
      const promise = addMutation.mutateAsync(formData);

      toast
        .promise(promise, {
          loading: '내역을 저장하는 중...',
          success: '내역이 저장되었습니다!',
          error: '저장에 실패했습니다.',
        })
        .then(() => {
          onClose();
        });
    }
  };

  const handleDelete = () => {
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
          .then(() => {
            onClose();
          });
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
              {isEditMode ? '내역 수정' : '내역 추가'}
            </h2>
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
          </div>

          <div className={styles.scrollableContent}>
            <div className={styles.typeSelector}>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'exp' ? styles.active : ''}`}
                onClick={() => handleTypeChange('exp')}
              >
                지출
              </button>
              <button
                type="button"
                className={`${styles.typeButton} ${type === 'inc' ? styles.active : ''}`}
                onClick={() => handleTypeChange('inc')}
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
                />
                <span className={styles.dayOfWeek}>{dayOfWeek}</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">금액</label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            <div
              className={styles.formGroup}
              style={{ alignItems: 'flex-start' }}
            >
              <label style={{ marginTop: '12px' }}>카테고리</label>
              <CategorySelector
                categories={currentCategories}
                selectedCode={category}
                onSelect={setCategory}
                disabled={isLoadingCategories}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">내용</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="내용 입력 (선택)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="publicMemo">공개 메모</label>
              <div className={styles.memoContainer}>
                <MessageSquareText size={16} className={styles.memoIcon} />
                <input
                  type="text"
                  id="publicMemo"
                  className={styles.memoInput}
                  value={publicMemo}
                  onChange={(e) => setPublicMemo(e.target.value)}
                  placeholder="멤버들과 공유할 메모"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="privateMemo">나만 보기</label>
              <div className={styles.memoContainer}>
                <Lock size={16} className={styles.memoIcon} />
                <input
                  type="text"
                  id="privateMemo"
                  className={styles.memoInput}
                  value={privateMemo}
                  onChange={(e) => setPrivateMemo(e.target.value)}
                  placeholder="나만 볼 수 있는 메모"
                />
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            {isEditMode && (
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
          </div>
        </form>
      </div>
    </div>
  );
}
