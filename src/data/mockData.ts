import type { Category, TransactionGroup } from '../types/transaction';

export const mockSummary = {
  year: 2023,
  month: 10,
  income: 3000000,
  expense: 1250000,
};

export const mockCategories: Category[] = [
  { id: 'cat1', name: '식비', color: '#FBBF24', amount: 450000, icon: 'Utensils' },
  { id: 'cat2', name: '쇼핑', color: '#F87171', amount: 300000, icon: 'ShoppingBag' },
  { id: 'cat3', name: '교통', color: '#60A5FA', amount: 150000, icon: 'Bus' },
  { id: 'cat4', name: '기타', color: '#A78BFA', amount: 350000, icon: 'Archive' },
];

export const mockTransactions: TransactionGroup[] = [
  {
    date: '오늘',
    items: [
      { id: 't1', categoryIcon: 'Utensils', categoryColor: '#FBBF24', description: '친구와 점심 식사', amount: -15000 },
      { id: 't2', categoryIcon: 'Coffee', categoryColor: '#FBBF24', description: '카페라떼', amount: -4500 },
    ],
  },
  {
    date: '어제',
    items: [
      { id: 't3', categoryIcon: 'Bus', categoryColor: '#60A5FA', description: '출근 버스비', amount: -1250 },
      { id: 't4', categoryIcon: 'Gift', categoryColor: '#F87171', description: '친구 생일선물', amount: -50000 },
    ],
  },
  {
    date: '10월 28일',
    items: [
      { id: 't5', categoryIcon: 'Landmark', categoryColor: '#A78BFA', description: '월급', amount: 3000000 },
    ],
  },
];
