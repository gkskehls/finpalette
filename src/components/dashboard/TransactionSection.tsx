import { Icon } from '../common/Icon';
import type { TransactionGroup } from '../../types/transaction';

interface TransactionSectionProps {
  transactionGroups: TransactionGroup[];
}

export function TransactionSection({ transactionGroups }: TransactionSectionProps) {
  return (
    <section className="transactions-section">
      <h3>최근 내역</h3>
      {transactionGroups.map(group => (
        <div key={group.date} className="transaction-group">
          <h4 className="transaction-date">{group.date}</h4>
          <ul>
            {group.items.map(item => (
              <li key={item.id} className="transaction-item">
                <div className="item-category">
                  <div className="icon-wrapper" style={{ backgroundColor: `${item.categoryColor}20` }}>
                    <Icon name={item.categoryIcon} size={20} color={item.categoryColor} />
                  </div>
                  <span>{item.description}</span>
                </div>
                <span className={`item-amount ${item.amount > 0 ? 'income' : 'expense'}`}>
                  {item.amount.toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
