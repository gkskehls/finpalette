import type { TransactionGroup } from '../../types/ui';
import styles from './TransactionSection.module.css';
import { Icon } from '../common/Icon';
import { useAuth } from '../../hooks/useAuth';
import { Lock } from 'lucide-react';

interface TransactionSectionProps {
  transactionGroups: TransactionGroup[];
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString();
};

export function TransactionSection({
  transactionGroups,
}: TransactionSectionProps) {
  const { user } = useAuth();

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>최근 내역</h2>
      {transactionGroups.map((group) => (
        <div key={group.date} className={styles.group}>
          <h3 className={styles.dateHeader}>{group.date}</h3>
          <div className={styles.itemList}>
            {group.transactions.map((item) => {
              const isIncome = item.type === 'inc';
              const isMyMemo = item.private_memo && item.user_id === user?.id;

              return (
                <div key={item.localId} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div
                      className={styles.iconContainer}
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      <Icon
                        name={item.category.icon}
                        className={styles.icon}
                        style={{ color: item.category.color }}
                      />
                    </div>
                    <div className={styles.textContainer}>
                      <span className={styles.description}>
                        {item.description || item.category.name}
                      </span>
                      {isMyMemo && (
                        <span className={styles.privateMemo}>
                          <Lock size={10} className={styles.lockIcon} />
                          {item.private_memo}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`${styles.amount} ${
                      isIncome ? styles.income : styles.expense
                    }`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(item.amount)}원
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
