import { useMemo, useState } from 'react';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { EXPENSE_CATEGORIES } from '../config/constants';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
} from 'recharts';
import type { Transaction } from '../types/transaction';
import styles from './StatsPage.module.css';

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export function StatsPage() {
  const { data: transactions = [] } = useTransactionsQuery();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePrevMonth = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const monthlyExpenseData = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

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
  }, [transactions, selectedDate]);

  const monthlySummaryData: MonthlySummary[] = useMemo(() => {
    const summaryMap = new Map<string, { income: number; expense: number }>();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      summaryMap.set(monthKey, { income: 0, expense: 0 });
    }

    transactions.forEach((t: Transaction) => {
      const transactionDate = new Date(t.date);
      const year = transactionDate.getFullYear();
      const month = transactionDate.getMonth();
      const monthKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;

      if (summaryMap.has(monthKey)) {
        const currentSummary = summaryMap.get(monthKey)!;
        if (t.type === 'inc') {
          currentSummary.income += t.amount;
        } else if (t.type === 'exp') {
          currentSummary.expense += t.amount;
        }
        summaryMap.set(monthKey, currentSummary);
      }
    });

    return Array.from(summaryMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => {
        const monthNum = parseInt(key.split('-')[1]);
        return {
          month: `${monthNum}월`,
          income: value.income,
          expense: value.expense,
        };
      });
  }, [transactions, selectedDate]);

  const formattedMonth = `${selectedDate.getFullYear()}.${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handlePrevMonth} className={styles.navButton}>
          {'<'}
        </button>
        <h2 className={styles.monthTitle}>{formattedMonth}</h2>
        <button onClick={handleNextMonth} className={styles.navButton}>
          {'>'}
        </button>
      </div>
      <h3 className={styles.sectionTitle}>카테고리별 지출</h3>
      <div className={styles.chartContainer}>
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

      <h3 className={styles.sectionTitle}>월별 수입/지출</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart
            data={monthlySummaryData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value: number) =>
                `${(value / 10000).toLocaleString()}만`
              }
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()}원`,
                name === 'income' ? '수입' : '지출',
              ]}
            />
            <Legend />
            <Bar dataKey="income" fill="#82ca9d" name="수입" />
            <Bar dataKey="expense" fill="#ff7300" name="지출" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
