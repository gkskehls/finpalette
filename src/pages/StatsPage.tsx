import { useMemo } from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { EXPENSE_CATEGORIES } from '../config/constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Page } from '../App';

interface StatsPageProps {
  activePage: Page;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (_page: Page) => void;
}

export function StatsPage({ activePage, onPageChange }: StatsPageProps) {
  const { data: transactions = [] } = useTransactionsQuery();

  const monthlyExpenseData = useMemo(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getFullYear() === year &&
        transactionDate.getMonth() === month &&
        t.type === 'exp'
      );
    });

    const amountByCategory = monthlyTransactions.reduce(
      (acc, transaction) => {
        if (!acc[transaction.category_code]) {
          acc[transaction.category_code] = 0;
        }
        acc[transaction.category_code] += transaction.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    return EXPENSE_CATEGORIES.map((category) => ({
      name: category.name,
      value: amountByCategory[category.code] || 0,
      color: category.color,
    })).filter((item) => item.value > 0);
  }, [transactions]);

  return (
    <div className="stats-container">
      <Header title="통계" />
      <main className="stats-main" style={{ padding: '1rem' }}>
        <h2>이번 달 지출 분석</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={monthlyExpenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={(entry) => `${entry.name}`}
              >
                {monthlyExpenseData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value.toLocaleString()}원`,
                  '지출액',
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </main>
      <BottomNav activePage={activePage} onPageChange={onPageChange} />
    </div>
  );
}
