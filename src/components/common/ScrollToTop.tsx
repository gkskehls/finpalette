import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 페이지 이동 시 스크롤을 최상단으로 초기화하는 컴포넌트입니다.
 * 단, '전체 내역' 페이지(/transactions)는 스크롤 위치를 유지해야 하므로 제외합니다.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // '/transactions' 경로가 아닐 때만 스크롤을 최상단으로 이동
    if (!pathname.startsWith('/transactions')) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
