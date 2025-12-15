import type { Category } from './category';
import type { Transaction } from './transaction';

// 대시보드 상단 요약 카드 데이터 형태
export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

// Transaction 데이터에 Category 상세 정보를 포함한 형태
export interface TransactionItem extends Omit<Transaction, 'category_code'> {
  category: Category;
}

// 날짜별로 그룹화된 거래 내역 데이터 형태
export interface TransactionGroup {
  date: string; // '오늘', '어제', '7월 25일' 등
  transactions: TransactionItem[];
}
