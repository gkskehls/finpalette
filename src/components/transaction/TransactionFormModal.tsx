import React, { useState } from 'react';
import styles from './TransactionFormModal.module.css';
import { X } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../config/constants';
import type { Transaction } from '../../types/transaction';

type NewTransactionData = Omit<Transaction, 'localId' | 'id'>;

interface TransactionFormModalProps {
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (_data: NewTransactionData) => void;
}

export function TransactionFormModal({
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const [type, setType] = useState('exp');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]?.code || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleTypeChange = (newType: 'inc' | 'exp') => {
    setType(newType);
    if (newType === 'inc') {
      setCategory(INCOME_CATEGORIES[0]?.code || '');
    } else {
      setCategory(EXPENSE_CATEGORIES[0]?.code || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      alert('카테고리를 선택해주세요.');
      return;
    }
    onSubmit({
      type,
      amount: Number(amount),
      category_code: category,
      date,
      description,
    });
  };

  const currentCategories =
    type === 'inc' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>내역 추가</h2>
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
            >
              <option value="" disabled>
                카테고리 선택
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
            <label htmlFor="description">내용</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>
            <button type="submit" className={styles.submitButton}>
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
