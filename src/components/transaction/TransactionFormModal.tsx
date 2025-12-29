import React, { useState, useMemo } from 'react';
import styles from './TransactionFormModal.module.css';
import { X, Lock } from 'lucide-react';
import { useCategoriesQuery } from '../../hooks/queries/useCategoriesQuery';
import type { Transaction } from '../../types/transaction';
import {
  useAddTransactionMutation,
  useUpdateTransactionMutation,
} from '../../hooks/queries/useTransactionsMutation';
import type {
  NewTransaction,
  UpdateTransactionPayload,
} from '../../hooks/queries/useTransactionsMutation';

interface TransactionFormModalProps {
  onClose: () => void;
  transactionToEdit?: Transaction;
}

export function TransactionFormModal({
  onClose,
  transactionToEdit,
}: TransactionFormModalProps) {
  const isEditMode = !!transactionToEdit;

  // DB에서 카테고리 목록을 가져옵니다.
  const { data: categories, isLoading: isLoadingCategories } =
    useCategoriesQuery();

  // 수입/지출 카테고리를 분리합니다.
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
    transactionToEdit?.category_code || expenseCategories[0]?.code || ''
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

  const handleTypeChange = (newType: 'inc' | 'exp') => {
    setType(newType);
    // 타입 변경 시, 해당 타입의 첫 번째 카테고리를 기본값으로 설정
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
      alert('카테고리를 선택해주세요.');
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
      const payload: UpdateTransactionPayload = {
        id: transactionToEdit.id!,
        data: formData,
      };
      updateMutation.mutate(payload, {
        onSuccess: onClose,
      });
    } else {
      addMutation.mutate(formData, {
        onSuccess: onClose,
      });
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
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
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
              disabled={addMutation.isPending || updateMutation.isPending}
            >
              {isEditMode ? '수정' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
