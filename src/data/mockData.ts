import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';

// 1. 카테고리 목업 데이터 (DB `categories` 테이블 역할)
export const mockCategories: Category[] = [
  { code: 'c01', name: '식비', color: '#FBBF24', icon: 'Utensils' },
  { code: 'c02', name: '교통', color: '#60A5FA', icon: 'Bus' },
  { code: 'c03', name: '쇼핑', color: '#F87171', icon: 'ShoppingBag' },
  { code: 'c04', name: '급여', color: '#818CF8', icon: 'Landmark' },
  { code: 'c05', name: '기타', color: '#A78BFA', icon: 'Archive' },
];

// 2. 거래 내역 원본 목업 데이터 (DB `transactions` 테이블 역할)
// DashboardPage 리팩토링 이후 이 데이터는 직접 사용되지 않지만,
// 다른 컴포넌트의 스토리북이나 테스트를 위해 남겨둘 수 있습니다.
export const mockTransactions: Transaction[] = [
  {
    localId: 'local-1',
    id: 'tran-1',
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'exp',
    amount: 15000,
    category_code: 'c01',
    description: '친구와 점심 식사',
  },
  {
    localId: 'local-2',
    id: 'tran-2',
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'exp',
    amount: 4500,
    category_code: 'c01',
    description: '카페라떼',
  },
  {
    localId: 'local-3',
    id: 'tran-3',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'exp',
    amount: 1250,
    category_code: 'c02',
    description: '출근 버스비',
  },
  {
    localId: 'local-4',
    id: 'tran-4',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'exp',
    amount: 50000,
    category_code: 'c03',
    description: '친구 생일선물',
  },
  {
    localId: 'local-5',
    id: 'tran-5',
    date: '2024-07-25',
    type: 'inc',
    amount: 3000000,
    category_code: 'c04',
    description: '7월 급여',
  },
  {
    localId: 'local-6',
    id: 'tran-6',
    date: '2024-07-20',
    type: 'exp',
    amount: 89000,
    category_code: 'c05',
    description: '인터넷 요금',
  },
];
