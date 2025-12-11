import type {
  Category,
  SummaryData,
  Transaction,
  TransactionGroup,
  TransactionItem,
} from '../types/transaction';

// 1. 카테고리 목업 데이터 (DB `categories` 테이블 역할)
export const mockCategories: Category[] = [
  { id: 'cat-1', name: '식비', color: '#FBBF24', icon: 'Utensils' },
  { id: 'cat-2', name: '교통', color: '#60A5FA', icon: 'Bus' },
  { id: 'cat-3', name: '쇼핑', color: '#F87171', icon: 'ShoppingBag' },
  { id: 'cat-4', name: '급여', color: '#818CF8', icon: 'Landmark' },
  { id: 'cat-5', name: '기타', color: '#A78BFA', icon: 'Archive' },
];

// 2. 거래 내역 원본 목업 데이터 (DB `transactions` 테이블 역할)
export const mockTransactions: Transaction[] = [
  {
    id: 'tran-1',
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'expense',
    amount: 15000,
    category_id: 'cat-1',
    description: '친구와 점심 식사',
  },
  {
    id: 'tran-2',
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'expense',
    amount: 4500,
    category_id: 'cat-1',
    description: '카페라떼',
  },
  {
    id: 'tran-3',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'expense',
    amount: 1250,
    category_id: 'cat-2',
    description: '출근 버스비',
  },
  {
    id: 'tran-4',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'expense',
    amount: 50000,
    category_id: 'cat-3',
    description: '친구 생일선물',
  },
  {
    id: 'tran-5',
    date: '2024-07-25',
    type: 'income',
    amount: 3000000,
    category_id: 'cat-4',
    description: '7월 급여',
  },
  {
    id: 'tran-6',
    date: '2024-07-20',
    type: 'expense',
    amount: 89000,
    category_id: 'cat-5',
    description: '인터넷 요금',
  },
];

// 3. 월별 요약 데이터 목업
export const mockSummary: SummaryData = {
  totalIncome: 3000000,
  totalExpense: 159750,
  balance: 2840250,
};

// 4. (유틸리티 함수) 원본 데이터를 UI 표시용 데이터로 가공
const categoryMap = new Map(mockCategories.map((cat) => [cat.id, cat]));

const enrichedTransactions: TransactionItem[] = mockTransactions.map(
  (transaction) => {
    const category = categoryMap.get(transaction.category_id);
    if (!category) {
      throw new Error(`Category not found for id: ${transaction.category_id}`);
    }
    return {
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type,
      category: category,
    };
  }
);

export const groupTransactionsByDate = (
  transactions: TransactionItem[]
): TransactionGroup[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const groups = transactions.reduce(
    (acc, transaction) => {
      let groupDate: string;
      if (transaction.date === todayStr) {
        groupDate = '오늘';
      } else if (transaction.date === yesterdayStr) {
        groupDate = '어제';
      } else {
        const date = new Date(transaction.date);
        groupDate = `${date.getMonth() + 1}월 ${date.getDate()}일`;
      }

      if (!acc[groupDate]) {
        acc[groupDate] = [];
      }
      acc[groupDate].push(transaction);
      return acc;
    },
    {} as Record<string, TransactionItem[]>
  );

  return Object.entries(groups).map(([date, transactions]) => ({
    date,
    transactions,
  }));
};

export const mockTransactionGroups: TransactionGroup[] =
  groupTransactionsByDate(enrichedTransactions);
