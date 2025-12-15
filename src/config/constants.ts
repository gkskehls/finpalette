import type { IconName } from '../types/icon';

interface Category {
  code: string;
  name: string;
  icon: IconName;
  color: string;
}

export const INCOME_CATEGORIES: Category[] = [
  { code: 'i01', name: '월급', icon: 'Briefcase', color: '#4CAF50' },
  { code: 'i02', name: '용돈', icon: 'Coins', color: '#81C784' },
  { code: 'i03', name: '금융소득', icon: 'Landmark', color: '#66BB6A' },
  { code: 'i04', name: '사업소득', icon: 'Store', color: '#A5D6A7' },
  { code: 'i99', name: '기타', icon: 'PlusSquare', color: '#C8E6C9' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { code: 'c01', name: '식비', icon: 'Utensils', color: '#FF7043' },
  { code: 'c02', name: '교통', icon: 'Bus', color: '#5C6BC0' },
  { code: 'c03', name: '통신', icon: 'Smartphone', color: '#26A69A' },
  { code: 'c04', name: '쇼핑', icon: 'ShoppingBag', color: '#FFCA28' },
  { code: 'c05', name: '주거', icon: 'Home', color: '#78909C' },
  { code: 'c06', name: '의료/건강', icon: 'HeartPulse', color: '#EF5350' },
  { code: 'c07', name: '여가/문화', icon: 'Film', color: '#AB47BC' },
  { code: 'c08', name: '교육', icon: 'GraduationCap', color: '#42A5F5' },
  { code: 'c09', name: '경조사', icon: 'Users', color: '#8D6E63' },
  { code: 'c10', name: '저축/투자', icon: 'PiggyBank', color: '#66BB6A' },
  { code: 'c99', name: '기타', icon: 'PlusSquare', color: '#BDBDBD' },
];

export const TRANSACTION_TYPES = {
  INCOME: 'inc',
  EXPENSE: 'exp',
};
