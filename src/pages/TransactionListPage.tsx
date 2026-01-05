import { useState, useMemo } from 'react';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';
import { Icon } from '../components/common/Icon';
import styles from './TransactionListPage.module.css';
import { Lock, MessageSquareText, Palette } from 'lucide-react';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (_item: Transaction) => void;
}

const TransactionItem = (props: TransactionItemProps) => {
  const { transaction, category, onEdit } = props;
  const { user } = useAuth();

  if (!category) {
    // 카테고리를 찾을 수 없는 경우, 기본 UI 렌더링
    return (
      <div
        className={styles.transactionItem}
        onClick={() => onEdit(transaction)}
      >
        <div className={styles.leftContent}>
          <div
            className={styles.categoryIcon}
            style={{ backgroundColor: '#88888815' }}
          >
            <Icon name="HelpCircle" color="#888888" size={18} />
          </div>
          <div className={styles.transactionDetails}>
            <span className={styles.description}>
              {transaction.description || '미분류'}
            </span>
          </div>
        </div>
        <div className={styles.rightContent}>
          <span
            className={`${styles.amount} ${
              transaction.type === 'inc' ? styles.income : styles.expense
            }`}
          >
            {transaction.type === 'inc' ? '+' : '-'}
            {transaction.amount.toLocaleString()}
          </span>
        </div>
      </div>
    );
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
          {transaction.public_memo && (
            <span className={styles.publicMemo}>
              <MessageSquareText size={10} className={styles.memoIcon} />
              {transaction.public_memo}
            </span>
          )}
          {isMyMemo && (
            <span className={styles.privateMemo}>
              <Lock size={10} className={styles.memoIcon} />
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

const TransactionListSkeleton = () => {
  return (
    <div className={styles.listContainer}>
      {[1, 2].map((groupIndex) => (
        <div key={groupIndex} className={styles.dateGroup}>
          <div className={styles.dateHeaderSkeleton}>
            <Skeleton width={120} height={20} />
            <Skeleton width={100} height={16} />
          </div>
          <div className={styles.groupList}>
            {[1, 2, 3].map((itemIndex) => (
              <div key={itemIndex} className={styles.transactionItem}>
                <div className={styles.leftContent}>
                  <Skeleton
                    width={36}
                    height={36}
                    borderRadius={8}
                    style={{ flexShrink: 0 }}
                  />
                  <div
                    className={styles.transactionDetails}
                    style={{ width: '100%' }}
                  >
                    <Skeleton width="60%" height={16} />
                    <Skeleton
                      width="40%"
                      height={12}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>
                <div className={styles.rightContent}>
                  <Skeleton width={60} height={18} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TransactionListPage = () => {
  const {
    data: transactionsData,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactionsQuery();

  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategoriesQuery();

  const isLoading = isLoadingTransactions || isLoadingCategories;
  const error = transactionsError || categoriesError;

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

  const allTransactions = useMemo(() => {
    return transactionsData?.pages.flatMap((page) => page) || [];
  }, [transactionsData]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.code, cat]));
  }, [categories]);

  const groupedTransactions = useMemo(() => {
    if (allTransactions.length === 0) return [];

    type Group = {
      originalDate: string;
      displayDate: string;
      transactions: Transaction[];
      dailyIncome: number;
      dailyExpense: number;
    };

    const groupMap = new Map<string, Group>();

    allTransactions.forEach((tx) => {
      const originalDate = tx.date;
      let group = groupMap.get(originalDate);

      if (!group) {
        const dateObj = new Date(originalDate);
        const displayDate = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]}요일`;
        group = {
          originalDate,
          displayDate,
          transactions: [],
          dailyIncome: 0,
          dailyExpense: 0,
        };
        groupMap.set(originalDate, group);
      }

      group.transactions.push(tx);
      if (tx.type === 'inc') {
        group.dailyIncome += tx.amount;
      } else {
        group.dailyExpense += tx.amount;
      }
    });

    return Array.from(groupMap.values()).sort((a, b) => {
      return (
        new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime()
      );
    });
  }, [allTransactions]);

  const renderContent = () => {
    if (isLoading) return <TransactionListSkeleton />;
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
          <div key={group.originalDate} className={styles.dateGroup}>
            <h3 className={styles.dateHeader}>
              <span>{group.displayDate}</span>
              <span className={styles.dailySummary}>
                {group.dailyIncome > 0 && (
                  <span className={styles.dailyIncome}>
                    +{group.dailyIncome.toLocaleString()}
                  </span>
                )}
                {group.dailyExpense > 0 && (
                  <span className={styles.dailyExpense}>
                    -{group.dailyExpense.toLocaleString()}
                  </span>
                )}
              </span>
            </h3>
            <div className={styles.groupList}>
              {group.transactions.map((tx) => (
                <TransactionItem
                  key={tx.localId}
                  transaction={tx}
                  category={categoryMap.get(tx.category_code)}
                  onEdit={handleOpenEditModal}
                />
              ))}
            </div>
          </div>
        ))}

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
