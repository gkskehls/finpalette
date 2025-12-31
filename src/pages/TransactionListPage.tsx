import { useState, useMemo } from 'react';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useScrollRestoration } from '../hooks/useScrollRestoration';
import type { Transaction } from '../types/transaction';
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  TRANSACTION_TYPES,
} from '../config/constants';
import { Icon } from '../components/common/Icon';
import styles from './TransactionListPage.module.css';
import { Lock, Palette } from 'lucide-react';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/common/EmptyState';

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (_item: Transaction) => void;
}

const TransactionItem = (props: TransactionItemProps) => {
  const { transaction, onEdit } = props;
  const { user } = useAuth();

  const category = ALL_CATEGORIES.find(
    (c) => c.code === transaction.category_code
  );
  const transactionType = TRANSACTION_TYPES[transaction.type];

  if (!category || !transactionType) {
    return null;
  }

  const isIncome = transaction.type === 'inc';
  const isMyMemo = transaction.private_memo && transaction.user_id === user?.id;

  return (
    <div className={styles.transactionItem} onClick={() => onEdit(transaction)}>
      <div className={styles.leftContent}>
        <div
          className={styles.categoryIcon}
          style={{ backgroundColor: `${category.color}15` }}
        >
          <Icon name={category.icon} color={category.color} size={18} />
        </div>
        <div className={styles.transactionDetails}>
          <span className={styles.description}>
            {transaction.description || category.name}
          </span>
          {isMyMemo && (
            <span className={styles.privateMemo}>
              <Lock size={10} className={styles.lockIcon} />
              {transaction.private_memo}
            </span>
          )}
        </div>
      </div>
      <div className={styles.rightContent}>
        <span
          className={`${styles.amount} ${isIncome ? styles.income : styles.expense}`}
        >
          {isIncome ? '+' : '-'}
          {transaction.amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const TransactionListPage = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionsQuery();

  // 스크롤 위치 복원
  useScrollRestoration('transactions', isLoading);

  // 무한 스크롤 감지 (바닥에서 300px 남았을 때 미리 로딩)
  const loadMoreRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage,
    rootMargin: '300px',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setSelectedTransaction(undefined);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  // 모든 페이지의 데이터를 하나의 배열로 병합
  const allTransactions = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  // 날짜별 그룹화 로직
  const groupedTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];

    const groups: { date: string; transactions: Transaction[] }[] = [];

    allTransactions.forEach((tx) => {
      const dateStr = tx.date; // YYYY-MM-DD
      const dateObj = new Date(dateStr);
      const formattedDate = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]}요일`;

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === formattedDate) {
        lastGroup.transactions.push(tx);
      } else {
        groups.push({ date: formattedDate, transactions: [tx] });
      }
    });

    return groups;
  }, [allTransactions]);

  const renderContent = () => {
    if (isLoading) return <p className={styles.loadingText}>로딩 중...</p>;
    if (error)
      return (
        <p className={styles.errorText}>에러가 발생했습니다: {error.message}</p>
      );
    if (allTransactions.length === 0)
      return (
        <EmptyState
          icon={Palette}
          title="아직 기록된 내역이 없어요"
          description="오늘의 소비는 어떤 색인가요? 첫 내역을 추가해보세요!"
          actionLabel="내역 추가하기"
          onAction={handleOpenAddModal}
        />
      );

    return (
      <div className={styles.listContainer}>
        {groupedTransactions.map((group) => (
          <div key={group.date} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>{group.date}</h3>
            <div className={styles.groupList}>
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.localId}
                  transaction={tx}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>
          </div>
        ))}

        {/* 무한 스크롤 감지 영역 (Loading Indicator) */}
        <div ref={loadMoreRef} className={styles.loadingIndicator}>
          {isFetchingNextPage && <span>추가 내역 불러오는 중...</span>}
        </div>

        <div style={{ height: '100px' }} aria-hidden="true" />
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
