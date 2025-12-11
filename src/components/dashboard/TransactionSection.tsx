import React from 'react';
import * as Lucide from 'lucide-react';
import type { TransactionGroup } from '../../types/transaction';
import styles from './TransactionSection.module.css';

interface TransactionSectionProps {
  transactionGroups: TransactionGroup[];
}

const formatCurrency = (amount: number) => {
  return amount.toLocaleString();
};

export function TransactionSection({
  transactionGroups,
}: TransactionSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>최근 내역</h2>
      {transactionGroups.map((group) => (
        <div key={group.date} className={styles.group}>
          <h3 className={styles.dateHeader}>{group.date}</h3>
          <div className={styles.itemList}>
            {group.transactions.map((item) => {
              const Icon = Lucide[item.category.icon] as React.ElementType;
              const isIncome = item.type === 'income';
              return (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <div
                      className={styles.iconContainer}
                      style={{ backgroundColor: `${item.category.color}20` }}
                    >
                      <Icon
                        className={styles.icon}
                        style={{ color: item.category.color }}
                      />
                    </div>
                    <span className={styles.description}>
                      {item.description}
                    </span>
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
