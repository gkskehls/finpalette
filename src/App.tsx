import {
  useState,
  Suspense,
  lazy,
  useEffect,
  useRef,
  createRef,
  useMemo,
} from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useRegisterSW } from 'virtual:pwa-register/react';

// Utils
import { hexToHsl, getContrastColor } from './utils/colorUtils';

// Hooks
import { useCurrentPalette } from './hooks/useCurrentPalette';

// Dynamic Imports for Code Splitting with Named Exports
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);
const StatsPage = lazy(() =>
  import('./pages/StatsPage').then((module) => ({ default: module.StatsPage }))
);
// `TransactionListPage` has a default export, so we can import it directly.
const TransactionListPage = lazy(() => import('./pages/TransactionListPage'));
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);
const InvitePage = lazy(() =>
  import('./pages/InvitePage').then((module) => ({
    default: module.InvitePage,
  }))
);
const CategorySettingsPage = lazy(() =>
  import('./pages/CategorySettingsPage').then((module) => ({
    default: module.CategorySettingsPage,
  }))
);
const SearchPage = lazy(() =>
  import('./pages/SearchPage').then((module) => ({
    default: module.SearchPage,
  }))
);

import { BottomNav } from './components/common/BottomNav';
import { Header } from './components/common/Header';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionFormModal } from './components/transaction/TransactionFormModal';
import './App.css';

// Declare LoadingIndicator outside of the App component
const LoadingIndicator = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}
  >
    로딩 중...
  </div>
);

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { currentPalette } = useCurrentPalette();

  // 동적 테마 적용 로직
  useEffect(() => {
    const themeColor = currentPalette?.theme_color || '#646cff'; // 기본 색상
    const hsl = hexToHsl(themeColor);

    if (hsl) {
      const root = document.documentElement;

      // HSL 색상 변수 설정
      root.style.setProperty('--palette-hue', String(hsl.h));
      root.style.setProperty('--palette-saturation', `${hsl.s}%`);

      // 주 색상의 밝기(Lightness) 가져오기
      const primaryLightnessValue = parseFloat(
        getComputedStyle(root)
          .getPropertyValue('--palette-primary-lightness')
          .trim()
      );

      // 대비 색상 계산 및 설정
      const contrastColor = getContrastColor(primaryLightnessValue);
      root.style.setProperty('--palette-contrast-text', contrastColor);
    }
  }, [currentPalette]);

  const currentKey = location.key;

  // 각 페이지 전환(location.key)마다 고유한 nodeRef를 생성
  // useMemo를 사용하여 렌더링 중에 안전하게 ref 객체 생성
  const nodeRef = useMemo(() => createRef<HTMLDivElement>(), [currentKey]);

  // PWA 업데이트 감지 및 알림
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast(
        (t) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>새로운 버전이 출시되었습니다!</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  updateServiceWorker(true);
                  toast.dismiss(t.id);
                  setNeedRefresh(false);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                업데이트
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setNeedRefresh(false);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#E5E7EB',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                나중에
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity, // 사용자가 닫을 때까지 유지
          position: 'bottom-center',
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E5E7EB',
          },
        }
      );
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);

  const isFullScreenPage =
    location.pathname.startsWith('/invite') ||
    location.pathname.startsWith('/categories') ||
    location.pathname.startsWith('/search');

  // TransactionListPage에서는 날짜 연동을 위해 자체 FAB를 사용하므로 App 레벨 FAB는 숨김
  const isTransactionPage = location.pathname === '/transactions';

  // 페이지 이동 시 스크롤 최상단으로 이동
  useEffect(() => {
    // window 스크롤 초기화
    window.scrollTo(0, 0);

    // mainContent 내부 스크롤 초기화
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  return (
    <div className="appContainer">
      {!isFullScreenPage && <Header />}

      <main className="mainContent" ref={mainContentRef}>
        <Suspense fallback={<LoadingIndicator />}>
          <TransitionGroup component={null}>
            <CSSTransition
              key={currentKey}
              nodeRef={nodeRef}
              timeout={200}
              classNames="page-transition"
              unmountOnExit
            >
              <div ref={nodeRef} className="page">
                <Routes location={location}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route
                    path="/transactions"
                    element={<TransactionListPage />}
                  />
                  <Route path="/stats" element={<StatsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/invite" element={<InvitePage />} />
                  <Route
                    path="/categories"
                    element={<CategorySettingsPage />}
                  />
                  <Route path="/search" element={<SearchPage />} />
                </Routes>
              </div>
            </CSSTransition>
          </TransitionGroup>
        </Suspense>
      </main>

      {!isFullScreenPage && (
        <>
          <BottomNav />
          {!isTransactionPage && (
            <FloatingActionButton onClick={() => setIsModalOpen(true)} />
          )}
        </>
      )}

      {isModalOpen && !isTransactionPage && (
        <TransactionFormModal onClose={() => setIsModalOpen(false)} />
      )}

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 2000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '20px',
            fontSize: '0.9rem',
            maxWidth: '90%',
          },
          success: {
            duration: 2000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #E0E0E0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
