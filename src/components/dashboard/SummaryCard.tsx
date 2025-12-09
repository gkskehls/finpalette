import { Icon } from '../common/Icon';

interface SummaryCardProps {
  year: number;
  month: number;
  income: number;
  expense: number;
}

export function SummaryCard({ year, month, income, expense }: SummaryCardProps) {
  const total = income - expense;

  return (
    <section className="summary-card">
      <div className="month-selector">
        <Icon name="ChevronLeft" size={20} />
        <span>{year}년 {month}월</span>
        <Icon name="ChevronRight" size={20} />
      </div>
      <div className="summary-details">
        <div>
          <span className="label">수입</span>
          <span className="amount income">+{income.toLocaleString()}</span>
        </div>
        <div>
          <span className="label">지출</span>
          <span className="amount expense">-{expense.toLocaleString()}</span>
        </div>
      </div>
      <div className="summary-total">
        <span className="label">합계</span>
        <span className="amount total">{total.toLocaleString()}원</span>
      </div>
    </section>
  );
}
