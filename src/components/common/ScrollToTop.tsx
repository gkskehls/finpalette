import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// 스크롤 위치를 복원할 페이지 경로 목록
const PAGES_TO_RESTORE_SCROLL = ['/', '/transactions'];

/**
 * React Router에서 페이지 이동 시 스크롤 동작을 관리하는 컴포넌트입니다.
 * - PAGES_TO_RESTORE_SCROLL 목록에 없는 페이지는 항상 최상단으로 이동시킵니다.
 * - 목록에 있는 페이지는 각 페이지의 useScrollRestoration 훅이 담당하도록 아무 작업도 하지 않습니다.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!PAGES_TO_RESTORE_SCROLL.includes(pathname)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
