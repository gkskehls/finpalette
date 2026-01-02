import React, { useState, useMemo, useEffect } from 'react';
import styles from './TransactionFormModal.module.css';
import { X, Lock, Trash2 } from 'lucide-react';
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
  const [privateMemo, setPrivateMemo] = useState(
    transactionToEdit?.private_memo || ''
  );

  const addMutation = useAddTransactionMutation();
  const updateMutation = useUpdateTransactionMutation();
  const deleteMutation = useDeleteTransactionMutation();

  const dayOfWeek = useMemo(() => {
    if (!date) return '';
    const dateObj = new Date(date);
    // UTC 기준 날짜로 계산하여 시간대 문제 방지
    const utcDate = new Date(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate()
    );
    return ['일', '월', '화', '수', '목', '금', '토'][utcDate.getDay()];
  }, [date]);

  useEffect(() => {
    if (isEditMode && category) return;
    const currentList = type === 'inc' ? incomeCategories : expenseCategories;
    if (currentList.length > 0) {
      const isValid = currentList.some((c) => c.code === category);
      if (!category || !isValid) {
        const timer = setTimeout(() => {
          setCategory(currentList[0].code);
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [incomeCategories, expenseCategories, type, category, isEditMode]);

  const handleTypeChange = (newType: 'inc' | 'exp') => {
    setType(newType);
    if (!isEditMode) {
      setCategory(
        newType === 'inc'
          ? incomeCategories[0]?.code || ''
          : expenseCategories[0]?.code || ''
      );
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
        <div className={styles.modalHeader}>
          <h2>{isEditMode ? '내역 수정' : '내역 추가'}</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
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

          <div className={styles.formGroup}>
            <label htmlFor="category">카테고리</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoadingCategories}
            >
              <option value="" disabled>
                {isLoadingCategories ? '카테고리 로딩 중...' : '카테고리 선택'}
              </option>
              {currentCategories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
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
            <label htmlFor="description">내용 (공개)</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="모든 멤버에게 보여지는 내용"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="privateMemo">나만 보기 메모 (비공개)</label>
            <div className={styles.privateMemoContainer}>
              <Lock size={16} className={styles.privateMemoIcon} />
              <input
                type="text"
                id="privateMemo"
                className={styles.privateMemoInput}
                value={privateMemo}
                onChange={(e) => setPrivateMemo(e.target.value)}
                placeholder="나만 볼 수 있는 상세 내용"
              />
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
              {isEditMode ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
