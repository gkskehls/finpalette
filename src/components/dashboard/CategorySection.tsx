import type { Category } from '../../types/transaction';

interface CategorySectionProps {
  categories: Category[];
}

export function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section className="category-section">
      <h3>카테고리별 지출</h3>
      <ul className="category-list">
        {categories.map(cat => (
          <li key={cat.id}>
            <div className="category-name">
              <span className="color-dot" style={{ backgroundColor: cat.color }}></span>
              {cat.name}
            </div>
            <span className="category-amount">{cat.amount.toLocaleString()}원</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
