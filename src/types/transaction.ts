import type { icons } from 'lucide-react';

export type IconName = keyof typeof icons;

/**
 * @description 데이터베이스 `categories` 테이블과 일치하는 타입
 */
export type Category = {
  id: string; // uuid
  name: string;
  color: string;
  icon: IconName;
};

/**
 * @description 데이터베이스 `transactions` 테이블과 일치하는 타입
 */
export type Transaction = {
  id: string; // uuid
  created_at?: string; // timestamptz
  date: string; // date
  type: 'income' | 'expense';
  amount: number;
  category_id: string; // uuid
  description: string;
};

/**
 * @description 대시보드 월별 요약 카드 데이터 타입
 */
export type SummaryData = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

/**
 * @description UI 표시에 사용될 거래 내역 아이템 타입 (Transaction + Category 정보 조합)
 */
export type TransactionItem = {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category: Category;
};

/**
 * @description 날짜별로 그룹화된 거래 내역 목록 타입
 */
export type TransactionGroup = {
  date: string;
  transactions: TransactionItem[];
};
