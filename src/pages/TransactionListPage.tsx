import { useState, useMemo } from 'react';
import { useTransactionsQuery } from '../hooks/queries/useTransactionsQuery';
import { useCategoriesQuery } from '../hooks/queries/useCategoriesQuery';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import type { Transaction } from '../types/transaction';
import type { Category } from '../types/category';
import { Icon } from '../components/common/Icon';
import styles from './TransactionListPage.module.css';
import {
  Lock,
  MessageSquareText,
  Palette,
  List,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { TransactionFormModal } from '../components/transaction/TransactionFormModal';
import { useAuth } from '../hooks/useAuth';
import { EmptyState } from '../components/common/EmptyState';
import { Skeleton } from '../components/common/Skeleton';

// --- Helper Functions ---

// 금액 축약 함수 (예: 12000 -> 1.2만)
const formatCompactNumber = (num: number): string => {
  if (num >= 10000) {
    const value = num / 10000;
    // 소수점 첫째 자리까지 표시하되, .0이면 제거
    return `${parseFloat(value.toFixed(1))}만`;
  }
  return num.toLocaleString();
};

// --- Components ---

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (_item: Transaction) => void;
}

const TransactionItem = (props: TransactionItemProps) => {
  const { transaction, category, onEdit } = props;
  const { user } = useAuth();

  const handleClick = () => {
    onEdit(transaction);
  };

  if (!category) {
    return (
      <div className={styles.transactionItem} onClick={handleClick}>
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
    <div className={styles.transactionItem} onClick={handleClick}>
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

// --- Main Page Component ---

const TransactionListPage = () => {
  // 1. View Mode State
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // 2. Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 3. Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >(undefined);
  // 모달에 전달할 초기 날짜 (달력에서 선택한 날짜가 있으면 그 날짜로 설정)
  const [initialDateForAdd, setInitialDateForAdd] = useState<
    string | undefined
  >(undefined);

  // 4. Data Fetching
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

  // 5. Infinite Scroll Observer
  const loadMoreRef = useIntersectionObserver({
    onIntersect: fetchNextPage,
    enabled: hasNextPage && !isFetchingNextPage && viewMode === 'list', // 리스트 뷰에서만 동작
    rootMargin: '300px',
  });

  // 6. Data Processing
  const allTransactions = useMemo(() => {
    return transactionsData?.pages.flatMap((page) => page) || [];
  }, [transactionsData]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((cat) => [cat.code, cat]));
  }, [categories]);

  // --- Handlers ---

  const handleOpenEditModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setInitialDateForAdd(undefined);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setSelectedTransaction(undefined);
    // 달력 뷰이고 날짜가 선택되어 있으면 해당 날짜를 초기값으로 설정
    if (viewMode === 'calendar' && selectedDate) {
      setInitialDateForAdd(selectedDate);
    } else {
      setInitialDateForAdd(undefined);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(undefined);
    setInitialDateForAdd(undefined);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDate(null); // 월 이동 시 선택 날짜 초기화
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const handleDateClick = (dateStr: string) => {
    if (selectedDate === dateStr) {
      setSelectedDate(null); // 이미 선택된 날짜면 선택 해제
    } else {
      setSelectedDate(dateStr);
    }
  };

  // --- Render Helpers ---

  // 리스트 뷰 렌더링
  const renderListView = () => {
    if (allTransactions.length === 0) {
      return (
        <EmptyState
          icon={Palette}
          title="아직 기록된 내역이 없어요"
          description="오늘의 소비는 어떤 색인가요? 첫 내역을 추가해보세요!"
          actionLabel="내역 추가하기"
          onAction={handleOpenAddModal}
        />
      );
    }

    // 날짜별 그룹화
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

    const groupedTransactions = Array.from(groupMap.values()).sort((a, b) => {
      return (
        new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime()
      );
    });

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
      </div>
    );
  };

  // 달력 뷰 렌더링
  const renderCalendarView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // 해당 월의 첫 날과 마지막 날
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // 달력 그리드 시작 날짜 (첫 주 일요일)
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(1 - startDate.getDay());

    // 달력 그리드 종료 날짜 (마지막 주 토요일)
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

    const calendarDays = [];
    let currentDate = new Date(startDate);

    // 날짜별 데이터 집계 (현재 월 데이터만 필터링하지 않고 전체 데이터 사용 - 성능 최적화 필요 시 수정)
    const dailyStats = new Map<
      string,
      { income: number; expense: number; transactions: Transaction[] }
    >();

    allTransactions.forEach((tx) => {
      const dateStr = tx.date;
      if (!dailyStats.has(dateStr)) {
        dailyStats.set(dateStr, { income: 0, expense: 0, transactions: [] });
      }
      const stats = dailyStats.get(dateStr)!;
      if (tx.type === 'inc') stats.income += tx.amount;
      else stats.expense += tx.amount;
      stats.transactions.push(tx);
    });

    while (currentDate <= endDate) {
      calendarDays.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 오늘 날짜 확인
    const todayStr = new Date().toISOString().split('T')[0];

    // 선택된 날짜의 상세 내역
    const selectedDateStats = selectedDate
      ? dailyStats.get(selectedDate)
      : null;

    return (
      <div className={styles.calendarContainer}>
        {/* 월 이동 네비게이션 */}
        <div className={styles.calendarHeader}>
          <button onClick={handlePrevMonth} className={styles.monthNavButton}>
            <ChevronLeft size={24} />
          </button>
          <span className={styles.currentMonth}>
            {year}년 {month + 1}월
          </span>
          <button onClick={handleNextMonth} className={styles.monthNavButton}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* 요일 헤더 */}
        <div className={styles.weekDaysHeader}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <div
              key={day}
              className={`${styles.weekDay} ${index === 0 ? styles.sunday : index === 6 ? styles.saturday : ''}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className={styles.calendarGrid}>
          {calendarDays.map((day) => {
            // 로컬 시간대 기준으로 날짜 문자열 생성 (YYYY-MM-DD)
            // 주의: toISOString()은 UTC 기준이므로 사용하면 안됨
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const date = String(day.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${date}`;

            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const stats = dailyStats.get(dateStr);

            if (!isCurrentMonth) {
              return (
                <div key={dateStr} className={`${styles.calendarCell} empty`} />
              );
            }

            return (
              <div
                key={dateStr}
                className={`${styles.calendarCell} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                onClick={() => handleDateClick(dateStr)}
              >
                <span className={styles.dateNumber}>{day.getDate()}</span>
                <div className={styles.cellContent}>
                  {stats && stats.income > 0 && (
                    <span
                      className={`${styles.cellAmount} ${styles.cellIncome}`}
                    >
                      +{formatCompactNumber(stats.income)}
                    </span>
                  )}
                  {stats && stats.expense > 0 && (
                    <span
                      className={`${styles.cellAmount} ${styles.cellExpense}`}
                    >
                      -{formatCompactNumber(stats.expense)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 상세 내역 (Bottom Sheet) */}
        {selectedDate && (
          <div className={styles.selectedDateDetails}>
            <div className={styles.detailHeader}>
              <span className={styles.detailDate}>
                {parseInt(selectedDate.split('-')[1])}월{' '}
                {parseInt(selectedDate.split('-')[2])}일
              </span>
              {selectedDateStats && (
                <span className={styles.detailSummary}>
                  {selectedDateStats.income > 0 && (
                    <span className={styles.dailyIncome}>
                      +{selectedDateStats.income.toLocaleString()}
                    </span>
                  )}
                  {selectedDateStats.income > 0 &&
                    selectedDateStats.expense > 0 &&
                    ' / '}
                  {selectedDateStats.expense > 0 && (
                    <span className={styles.dailyExpense}>
                      -{selectedDateStats.expense.toLocaleString()}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className={styles.groupList}>
              {selectedDateStats?.transactions &&
              selectedDateStats.transactions.length > 0 ? (
                selectedDateStats.transactions.map((tx) => (
                  <TransactionItem
                    key={tx.localId}
                    transaction={tx}
                    category={categoryMap.get(tx.category_code)}
                    onEdit={handleOpenEditModal}
                  />
                ))
              ) : (
                <div className={styles.emptyDetail}>
                  기록된 내역이 없습니다.
                </div>
              )}
            </div>
            {/* 하단 여백 추가 (FAB에 가려지지 않도록) */}
            <div style={{ height: '60px' }} />
          </div>
        )}
      </div>
    );
  };

  if (isLoading) return <TransactionListSkeleton />;
  if (error)
    return (
      <p className={styles.errorText}>에러가 발생했습니다: {error.message}</p>
    );

  return (
    <div className={styles.container}>
      {/* 뷰 모드 토글 */}
      <div className={styles.viewToggleContainer}>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
            리스트
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.active : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon size={18} />
            달력
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      {viewMode === 'list' ? renderListView() : renderCalendarView()}

      {/* 하단 여백 (리스트 뷰일 때만) */}
      {viewMode === 'list' && (
        <div style={{ height: '100px' }} aria-hidden="true" />
      )}

      {/* 내역 추가/수정 모달 */}
      {isModalOpen && (
        <TransactionFormModal
          onClose={handleCloseModal}
          transactionToEdit={selectedTransaction}
          initialDate={initialDateForAdd}
        />
      )}
    </div>
  );
};

export default TransactionListPage;
