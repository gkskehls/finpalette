import React from 'react';
import * as Lucide from 'lucide-react';
import type { Category, Transaction } from '../../types/transaction';
import styles from './CategorySection.module.css';

interface CategorySectionProps {
  categories: Category[];
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()}원`;
};

export function CategorySection({
  categories,
  transactions,
}: CategorySectionProps) {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const amountByCategoryId = expenseTransactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.category_id]) {
        acc[transaction.category_id] = 0;
      }
      acc[transaction.category_id] += transaction.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoriesWithAmount = categories
    .map((category) => ({
      ...category,
      amount: amountByCategoryId[category.id] || 0,
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>카테고리별 지출</h2>
      <div className={styles.list}>
        {categoriesWithAmount.map((category) => {
          const Icon = Lucide[category.icon] as React.ElementType;
          return (
            <div key={category.id} className={styles.item}>
              <div className={styles.categoryInfo}>
                <div
                  className={styles.iconContainer}
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon
                    className={styles.icon}
                    style={{ color: category.color }}
                  />
                </div>
                <span className={styles.name}>{category.name}</span>
              </div>
              <span className={styles.amount}>
                {formatCurrency(category.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
