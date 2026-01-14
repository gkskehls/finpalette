import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MessageSquareText, Lock, ChevronLeft } from 'lucide-react';
import { useSearchTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
import { useAuth } from '../hooks/useAuth';
import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';
import { Icon } from '../components/common/Icon';
import { EmptyState } from '../components/common/EmptyState';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import styles from './SearchPage.module.css';

// --- Helper Components ---

interface SearchResultItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (_item: Transaction) => void;
}

const SearchResultItem = ({
  transaction,
  category,
  onEdit,
}: SearchResultItemProps) => {
  const { user } = useAuth();
  const isIncome = transaction.type === 'inc';
  const isMyMemo = transaction.private_memo && transaction.user_id === user?.id;

  // 날짜 포맷팅 (YYYY. MM. DD)
  const dateObj = new Date(transaction.date);
  const formattedDate = `${dateObj.getFullYear()}. ${dateObj.getMonth() + 1}. ${dateObj.getDate()}`;

  return (
    <div className={styles.transactionItem} onClick={() => onEdit(transaction)}>
      <div className={styles.leftContent}>
        <div
          className={styles.categoryIcon}
          style={{
            backgroundColor: category ? `${category.color}15` : '#88888815',
          }}
        >
          <Icon
            name={category?.icon || 'HelpCircle'}
            color={category?.color || '#888888'}
            size={20}
          />
        </div>
        <div className={styles.transactionDetails}>
          <span className={styles.description}>
            {transaction.description || category?.name || '미분류'}
          </span>
          <div className={styles.dateAndMemo}>
            <span>{formattedDate}</span>
            {transaction.public_memo && (
              <>
                <span>•</span>
                <MessageSquareText size={10} className={styles.memoIcon} />
                <span>{transaction.public_memo}</span>
              </>
            )}
            {isMyMemo && (
              <>
                <span>•</span>
                <Lock size={10} className={styles.memoIcon} />
                <span>{transaction.private_memo}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className={styles.rightContent}>
        <span
          className={`${styles.amount} ${
            isIncome ? styles.income : styles.expense
          }`}
        >
          {isIncome ? '+' : '-'}
          {transaction.amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

// --- Main Component ---

export function SearchPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 검색 쿼리
  const {
    data: searchResults = [],
    isLoading,
    error,
  } = useSearchTransactionsQuery(keyword);

  // 카테고리 정보
  const { data: categories = [] } = useCategoriesQuery();
  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.code, cat]));
  }, [categories]);

  const handleClear = () => {
    setKeyword('');
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchHeader}>
        <div className={styles.searchInputWrapper}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="내용, 메모, 금액으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
            {keyword && (
              <button className={styles.clearButton} onClick={handleClear}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        {keyword && !isLoading && (
          <div className={styles.resultCount}>
            총 {searchResults.length}건의 내역을 찾았습니다.
          </div>
        )}
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingText}>검색 중...</div>
        ) : error ? (
          <div className={styles.errorText}>
            에러가 발생했습니다: {error.message}
          </div>
        ) : keyword && searchResults.length === 0 ? (
          <EmptyState
            icon={Search}
            title="검색 결과가 없어요"
            description={`'${keyword}'에 대한 내역을 찾을 수 없습니다.`}
          />
        ) : !keyword ? (
          <EmptyState
            icon={Search}
            title="거래 내역 검색"
            description="궁금한 지출 내역을 검색해보세요."
          />
        ) : (
          <div className={styles.resultList}>
            {searchResults.map((tx) => (
              <SearchResultItem
                key={tx.localId}
                transaction={tx}
                category={categoryMap.get(tx.category_code)}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {isModalOpen && (
        <TransactionFormModal
          onClose={handleCloseModal}
          transactionToEdit={selectedTransaction}
        />
      )}
    </div>
  );
}
