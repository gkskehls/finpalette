import type { icons } from 'lucide-react';

export type IconName = keyof typeof icons;

export type Category = {
  id: string;
  name: string;
  color: string;
  amount: number;
  icon: IconName;
};

export type TransactionItem = {
  id: string;
  categoryIcon: IconName;
  categoryColor: string;
  description: string;
  amount: number;
};

export type TransactionGroup = {
  date: string;
  items: TransactionItem[];
};
