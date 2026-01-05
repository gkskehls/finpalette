import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router에서 페이지 이동 시 스크롤을 항상 최상단으로 이동시키는 컴포넌트입니다.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
