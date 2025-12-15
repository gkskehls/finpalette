import type { Transaction } from '../../types/transaction';
import type { Category } from '../../types/category';
import styles from './CategorySection.module.css';
import { Icon } from '../common/Icon';

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
  const expenseTransactions = transactions.filter((t) => t.type === 'exp');

  const amountByCategoryCode = expenseTransactions.reduce(
    (acc, transaction) => {
      if (!acc[transaction.category_code]) {
        acc[transaction.category_code] = 0;
      }
      acc[transaction.category_code] += transaction.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoriesWithAmount = categories
    .filter((category) => category.code.startsWith('c'))
    .map((category) => ({
      ...category,
      amount: amountByCategoryCode[category.code] || 0,
    }))
    .filter((category) => category.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>카테고리별 지출</h2>
      {categoriesWithAmount.length > 0 ? (
        <div className={styles.list}>
          {categoriesWithAmount.map((category) => (
            <div key={category.code} className={styles.item}>
              <div className={styles.categoryInfo}>
                <div
                  className={styles.iconContainer}
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <Icon
                    name={category.icon}
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
          ))}
        </div>
      ) : (
        <p className={styles.emptyMessage}>이번 달 지출 내역이 없습니다.</p>
      )}
    </div>
  );
}
