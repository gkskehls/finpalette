import React, { useState } from 'react';
import styles from './TransactionFormModal.module.css';
import { X } from 'lucide-react';

interface TransactionFormModalProps {
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (data: any) => void; // Replace 'any' with a proper type later
}

export function TransactionFormModal({
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const [type, setType] = useState('expense'); // 'expense' or 'income'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form data processing logic will be here
    onSubmit({}); // Pass actual data
    onClose();
  };

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
              className={`${styles.typeButton} ${type === 'expense' ? styles.active : ''}`}
              onClick={() => setType('expense')}
            >
              지출
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${type === 'income' ? styles.active : ''}`}
              onClick={() => setType('income')}
            >
              수입
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">금액</label>
            <input type="number" id="amount" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">카테고리</label>
            <select id="category" required>
              {/* Categories will be populated here */}
              <option value="food">식비</option>
              <option value="transport">교통</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">날짜</label>
            <input
              type="date"
              id="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">내용</label>
            <input type="text" id="description" />
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
