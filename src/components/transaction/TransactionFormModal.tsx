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
          <h2>Add Transaction</h2>
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
              Expense
            </button>
            <button
              type="button"
              className={`${styles.typeButton} ${type === 'income' ? styles.active : ''}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount" required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select id="category" required>
              {/* Categories will be populated here */}
              <option value="food">Food</option>
              <option value="transport">Transport</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <input type="text" id="description" />
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
