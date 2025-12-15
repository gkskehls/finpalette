import React, { useState } from 'react';
import styles from './TransactionFormModal.module.css';
import { X } from 'lucide-react';
import { mockCategories } from '../../data/mockData';
import type { Transaction } from '../../types/transaction';

type NewTransactionData = Omit<Transaction, 'localId' | 'id'>;

interface TransactionFormModalProps {
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: NewTransactionData) => void;
}

export function TransactionFormModal({
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const [type, setType] = useState('exp');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(
    mockCategories.find((c) => c.code.startsWith('c'))?.code || ''
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: Number(amount),
      category_code: category,
      date,
      description,
    });
  };

  const incomeCategories = mockCategories.filter(
    (c) => c.code.startsWith('inc') || c.code === 'c04'
  );
  const expenseCategories = mockCategories.filter(
    (c) => !c.code.startsWith('inc') && c.code !== 'c04'
  );

  const currentCategories =
    type === 'inc' ? incomeCategories : expenseCategories;

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
              onClick={() => setType('exp')}
            >
              지출
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${type === 'inc' ? styles.active : ''}`}
              onClick={() => setType('inc')}
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
