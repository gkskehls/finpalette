import React, { useState } from 'react';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import type { Transaction } from '../types/transaction';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  TRANSACTION_TYPES,
} from '../config/constants';
import { Icon } from '../components/common/Icon';
import styles from './TransactionListPage.module.css';
import { useDeleteTransactionMutation } from '../hooks/queries/useTransactionsMutation';
import { Trash2 } from 'lucide-react';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (_item: Transaction) => void;
}

const TransactionItem = (props: TransactionItemProps) => {
  const { transaction, onEdit } = props;
  const deleteMutation = useDeleteTransactionMutation();

  const category = ALL_CATEGORIES.find(
    (c) => c.code === transaction.category_code
  );
  const transactionType = TRANSACTION_TYPES[transaction.type];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('이 내역을 정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(transaction.localId);
    }
  };

  if (!category || !transactionType) {
    return null;
  }

  const amountColor = transaction.type === 'inc' ? 'blue' : 'red';

  return (
    <div className={styles.transactionItem} onClick={() => onEdit(transaction)}>
      <div
        className={styles.categoryIcon}
        style={{ backgroundColor: `${category.color}20` }} // 대시보드와 동일한 배경색 적용
      >
        <Icon name={category.icon} color={category.color} size={20} />{' '}
        {/* 아이콘 크기 지정 */}
      </div>
      <div className={styles.transactionDetails}>
        <span className={styles.description}>{transaction.description}</span>
        <span className={styles.categoryName}>{category.name}</span>
      </div>
      <div className={styles.amountAndButton}>
        <div
          className={styles.transactionAmount}
          style={{ color: amountColor }}
        >
          {transactionType.sign}
          {transaction.amount.toLocaleString()}원
        </div>
        <button onClick={handleDelete} className={styles.deleteButton}>
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const TransactionListPage = () => {
  const { data: transactions, isLoading, error } = useTransactionsQuery();

  // 스크롤 위치 복원 훅 적용 (데이터 로딩이 끝난 후 복원)
  useScrollRestoration('transactions', isLoading);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  const renderContent = () => {
    if (isLoading) {
      return <p>로딩 중...</p>;
    }

    if (error) {
      return <p>에러가 발생했습니다: {error.message}</p>;
    }

    if (!transactions || transactions.length === 0) {
      return <p>거래 내역이 없습니다.</p>;
    }

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div>
        {sortedTransactions.map((tx) => (
          <TransactionItem
            key={tx.localId}
            transaction={tx}
            onEdit={handleOpenEditModal}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {renderContent()}
      {isModalOpen && (
        <TransactionFormModal
          onClose={handleCloseModal}
          transactionToEdit={selectedTransaction}
        />
      )}
    </div>
  );
};

export default TransactionListPage;
