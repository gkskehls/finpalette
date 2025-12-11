import type { SummaryData } from '../../types/transaction';
import styles from './SummaryCard.module.css';

interface SummaryCardProps extends SummaryData {}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()}원`;
};

export function SummaryCard({
  totalIncome,
  totalExpense,
  balance,
}: SummaryCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.label}>총수입</span>
        <span className={`${styles.amount} ${styles.income}`}>
          {formatCurrency(totalIncome)}
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>총지출</span>
        <span className={`${styles.amount} ${styles.expense}`}>
          {formatCurrency(totalExpense)}
        </span>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.row}>
        <span className={styles.label}>합계</span>
        <span className={`${styles.amount} ${styles.balance}`}>
          {formatCurrency(balance)}
        </span>
      </div>
    </div>
  );
}
