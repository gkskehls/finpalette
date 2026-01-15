import { useMemo, useState } from 'react';
import { useCalendarTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
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
import { EmptyState } from '../components/common/EmptyState';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
}

export function StatsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedMonth = `${selectedDate.getFullYear()}.${(
    selectedDate.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}`;

  // 1. 쿼리에서 로딩 상태(isLoading)를 함께 가져옵니다.
  const { data: transactions = [], isLoading: isLoadingTransactions } =
    useCalendarTransactionsQuery(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      true
    );

  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategoriesQuery();

  const isLoading = isLoadingTransactions || isLoadingCategories;

  const expenseCategoryMap = useMemo(() => {
    return new Map(
      categories
        .filter((c) => !c.code.startsWith('i'))
        .map((cat) => [cat.code, cat])
    );
  }, [categories]);

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

    return Array.from(expenseCategoryMap.values())
      .map((category) => ({
        name: category.name,
        value: amountByCategory[category.code] || 0,
        color: category.color,
      }))
      .filter((item) => item.value > 0);
  }, [transactions, selectedDate, expenseCategoryMap]);

  const monthlySummaryData: MonthlySummary[] = useMemo(() => {
    const summaryMap = new Map<string, { income: number; expense: number }>();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    // 현재 선택된 월을 포함하여 최근 6개월치 키 생성
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}`;
      summaryMap.set(monthKey, { income: 0, expense: 0 });
    }

    // 불러온 데이터(transactions)를 바탕으로 집계
    // 주의: useCalendarTransactionsQuery는 현재 선택된 월의 데이터만 반환하므로,
    // 바 차트에는 선택된 월의 데이터만 표시될 수 있음.
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

  // 2. 로딩 중일 때 스켈레톤 UI를 먼저 보여줍니다.
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            onClick={handlePrevMonth}
            className={styles.navButton}
            disabled
          >
            {'<'}
          </button>
          <h2 className={styles.monthTitle}>{formattedMonth}</h2>
          <button
            onClick={handleNextMonth}
            className={styles.navButton}
            disabled
          >
            {'>'}
          </button>
        </div>
        <h3 className={styles.sectionTitle}>카테고리별 지출</h3>
        <div className={styles.chartContainer}>
          <Skeleton height={250} />
        </div>

        <h3 className={styles.sectionTitle}>월별 수입/지출</h3>
        <div className={styles.chartContainer}>
          <Skeleton height={250} />
        </div>
      </div>
    );
  }

  // 3. 로딩이 끝난 후 데이터가 없으면 EmptyState를 보여줍니다.
  if (transactions.length === 0) {
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
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyState
            icon={PieChartIcon}
            title="분석할 데이터가 충분하지 않아요"
            description="내역이 쌓이면 멋진 차트를 보여드릴게요!"
          />
        </div>
      </div>
    );
  }

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
        {monthlyExpenseData.length > 0 ? (
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
                animationDuration={800}
                animationBegin={0}
                animationEasing="ease-out"
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
        ) : (
          <div className={styles.noDataMessage}>
            이번 달 지출 내역이 없습니다.
          </div>
        )}
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
