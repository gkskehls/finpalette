import { Icon } from '../components/common/Icon';
import './DashboardPage.css';
import type { icons } from 'lucide-react';

// --- Mock Data (데이터가 있다는 가정) ---
const mockSummary = {
    year: 2023,
    month: 10,
    income: 3000000,
    expense: 1250000,
};

// 타입을 명시적으로 지정하여 타입 추론 오류를 방지합니다.
type Category = {
    id: string;
    name: string;
    color: string;
    amount: number;
    icon: keyof typeof icons;
};

type TransactionItem = {
    id: string;
    categoryIcon: keyof typeof icons;
    categoryColor: string;
    description: string;
    amount: number;
};

const mockCategories: Category[] = [
    { id: 'cat1', name: '식비', color: '#FBBF24', amount: 450000, icon: 'Utensils' },
    { id: 'cat2', name: '쇼핑', color: '#F87171', amount: 300000, icon: 'ShoppingBag' },
    { id: 'cat3', name: '교통', color: '#60A5FA', amount: 150000, icon: 'Bus' },
    { id: 'cat4', name: '기타', color: '#A78BFA', amount: 350000, icon: 'Archive' }, // 'MoreHorizontal' 대신 'Archive' 아이콘으로 임시 대체
];
const mockTransactions: { date: string; items: TransactionItem[] }[] = [
    { date: '오늘', items: [
            { id: 't1', categoryIcon: 'Utensils', categoryColor: '#FBBF24', description: '친구와 점심 식사', amount: -15000 },
            { id: 't2', categoryIcon: 'Coffee', categoryColor: '#FBBF24', description: '카페라떼', amount: -4500 },
        ]},
    { date: '어제', items: [
            { id: 't3', categoryIcon: 'Bus', categoryColor: '#60A5FA', description: '출근 버스비', amount: -1250 },
            { id: 't4', categoryIcon: 'Gift', categoryColor: '#F87171', description: '친구 생일선물', amount: -50000 },
        ]},
    { date: '10월 28일', items: [
            { id: 't5', categoryIcon: 'Landmark', categoryColor: '#A78BFA', description: '월급', amount: 3000000 },
        ]},
];
// --- End of Mock Data ---

export function DashboardPage() {
    const total = mockSummary.income - mockSummary.expense;

    return (
        <div className="dashboard-container">
            {/* 1. 헤더 */}
            <header className="dashboard-header">
                <h2>Finpalette</h2>
                <Icon name="Bell" />
            </header>

            <main className="dashboard-main">
                {/* 2. 월별 요약 카드 */}
                <section className="summary-card">
                    <div className="month-selector">
                        <Icon name="ChevronLeft" size={20} />
                        <span>{mockSummary.year}년 {mockSummary.month}월</span>
                        <Icon name="ChevronRight" size={20} />
                    </div>
                    <div className="summary-details">
                        <div>
                            <span className="label">수입</span>
                            <span className="amount income">+{mockSummary.income.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="label">지출</span>
                            <span className="amount expense">-{mockSummary.expense.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="summary-total">
                        <span className="label">합계</span>
                        <span className="amount total">{total.toLocaleString()}원</span>
                    </div>
                </section>

                {/* 3. 카테고리별 지출 현황 */}
                <section className="category-section">
                    <h3>카테고리별 지출</h3>
                    <ul className="category-list">
                        {mockCategories.map(cat => (
                            <li key={cat.id}>
                                <div className="category-name">
                                    <span className="color-dot" style={{ backgroundColor: cat.color }}></span>
                                    {cat.name}
                                </div>
                                <span className="category-amount">{cat.amount.toLocaleString()}원</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* 4. 최근 거래 내역 */}
                <section className="transactions-section">
                    <h3>최근 내역</h3>
                    {mockTransactions.map(group => (
                        <div key={group.date} className="transaction-group">
                            <h4 className="transaction-date">{group.date}</h4>
                            <ul>
                                {group.items.map(item => (
                                    <li key={item.id} className="transaction-item">
                                        <div className="item-category">
                                            <div className="icon-wrapper" style={{ backgroundColor: `${item.categoryColor}20` }}>
                                                <Icon name={item.categoryIcon} size={20} color={item.categoryColor} />
                                            </div>
                                            <span>{item.description}</span>
                                        </div>
                                        <span className={`item-amount ${item.amount > 0 ? 'income' : 'expense'}`}>
                      {item.amount.toLocaleString()}원
                    </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </section>
            </main>

            {/* 5. 내역 추가 버튼 (FAB) */}
            <button className="fab">
                <Icon name="Plus" size={32} />
            </button>

            {/* 6. 하단 네비게이션 */}
            <footer className="bottom-nav">
                <button className="nav-item active">
                    <Icon name="LayoutDashboard" />
                    <span>대시보드</span>
                </button>
                <button className="nav-item">
                    {/* <Icon name="BarChart" /> 아이콘 타입 문제로 임시 주석 처리 */}
                    <span>통계</span>
                </button>
                <button className="nav-item">
                    <Icon name="User" />
                    <span>마이</span>
                </button>
            </footer>
        </div>
    );
}