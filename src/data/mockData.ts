import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';

const MOCK_PALETTE_ID = 'mock-palette-id';
const MOCK_USER_ID = 'mock-user-id';

// 1. 카테고리 목업 데이터 (DB `categories` 테이블 역할)
export const mockCategories: Category[] = [
  {
    palette_id: MOCK_PALETTE_ID,
    code: 'c01',
    name: '식비',
    color: '#FBBF24',
    icon: 'Utensils',
  },
  {
    palette_id: MOCK_PALETTE_ID,
    code: 'c02',
    name: '교통',
    color: '#60A5FA',
    icon: 'Bus',
  },
  {
    palette_id: MOCK_PALETTE_ID,
    code: 'c03',
    name: '쇼핑',
    color: '#F87171',
    icon: 'ShoppingBag',
  },
  {
    palette_id: MOCK_PALETTE_ID,
    code: 'c04',
    name: '급여',
    color: '#818CF8',
    icon: 'Landmark',
  },
  {
    palette_id: MOCK_PALETTE_ID,
    code: 'c05',
    name: '기타',
    color: '#A78BFA',
    icon: 'PlusSquare',
  },
];

// 2. 거래 내역 원본 목업 데이터 (DB `transactions` 테이블 역할)
export const mockTransactions: Transaction[] = [
  {
    localId: 'local-1',
    id: 'tran-1',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'exp',
    amount: 15000,
    category_code: 'c01',
    description: '친구와 점심 식사',
  },
  {
    localId: 'local-2',
    id: 'tran-2',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: new Date().toISOString().split('T')[0], // 오늘
    type: 'exp',
    amount: 4500,
    category_code: 'c01',
    description: '카페라떼',
  },
  {
    localId: 'local-3',
    id: 'tran-3',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'exp',
    amount: 1250,
    category_code: 'c02',
    description: '출근 버스비',
  },
  {
    localId: 'local-4',
    id: 'tran-4',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 어제
    type: 'exp',
    amount: 50000,
    category_code: 'c03',
    description: '친구 생일선물',
  },
  {
    localId: 'local-5',
    id: 'tran-5',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: '2024-07-25',
    type: 'inc',
    amount: 3000000,
    category_code: 'c04',
    description: '7월 급여',
  },
  {
    localId: 'local-6',
    id: 'tran-6',
    palette_id: MOCK_PALETTE_ID,
    user_id: MOCK_USER_ID,
    date: '2024-07-20',
    type: 'exp',
    amount: 89000,
    category_code: 'c05',
    description: '인터넷 요금',
  },
];
