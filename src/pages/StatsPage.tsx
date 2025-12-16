import { useMemo, useState } from 'react';
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
  BarChart, // BarChart import 추가
  XAxis, // XAxis import 추가
  YAxis, // YAxis import 추가
  Bar, // Bar import 추가
  CartesianGrid, // CartesianGrid import 추가
} from 'recharts';
import type { Page } from '../App';
import type { Transaction } from '../types/transaction'; // Transaction 타입 import

interface StatsPageProps {
  activePage: Page;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (_page: Page) => void;
}

interface MonthlySummary {
  month: string; // 예: "1월", "2월"
  income: number;
  expense: number;
}

export function StatsPage({ activePage, onPageChange }: StatsPageProps) {
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

  // 월별 수입/지출 데이터를 계산하는 useMemo 추가
  const monthlySummaryData: MonthlySummary[] = useMemo(() => {
    // MonthlySummary[] 타입 명시
    const summaryMap = new Map<string, { income: number; expense: number }>();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    // 현재 월로부터 이전 5개월까지 (총 6개월)의 데이터를 집계
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

    // Map을 배열로 변환하고 월 이름으로 포맷팅
    return Array.from(summaryMap.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // 월별로 정렬
      .map(([key, value]) => {
        const monthNum = parseInt(key.split('-')[1]);
        return {
          month: `${monthNum}월`,
          income: value.income,
          expense: value.expense,
        };
      });
  }, [transactions, selectedDate]);

  const formattedMonth = `${selectedDate.getFullYear()}년 ${selectedDate.getMonth() + 1}월`;

  return (
    <div className="stats-container">
      <Header title="통계" />
      <main className="stats-main" style={{ padding: '1rem' }}>
        {/* 기간 선택 UI */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <button
            onClick={handlePrevMonth}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            {'<'}
          </button>
          <h2 style={{ margin: 0 }}>{formattedMonth} 지출 분석</h2>
          <button
            onClick={handleNextMonth}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            {'>'}
          </button>
        </div>
        <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
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

        {/* 월별 수입/지출 막대그래프 추가 */}
        <h2 style={{ marginTop: '2rem' }}>월별 수입/지출</h2>
        <div style={{ width: '100%', height: 300 }}>
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
                } // 만원 단위로 표시
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
      </main>
      <BottomNav activePage={activePage} onPageChange={onPageChange} />
    </div>
  );
}
