import { useEffect } from 'react';

const STORAGE_KEY_PREFIX = 'scroll_pos_';

/**
 * 특정 페이지의 스크롤 위치를 세션 스토리지에 저장하고 복원하는 훅입니다.
 * @param pageKey 페이지를 식별하는 고유 키 (예: 'transactions')
 * @param isLoading 데이터 로딩 상태 (로딩이 끝난 후 스크롤을 복원하기 위함)
 */
export function useScrollRestoration(pageKey: string, isLoading: boolean) {
  const storageKey = `${STORAGE_KEY_PREFIX}${pageKey}`;

  // 1. 페이지를 떠날 때(Unmount) 현재 스크롤 위치 저장
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(storageKey, window.scrollY.toString());
    };

    // 컴포넌트가 언마운트될 때 실행
    return () => {
      saveScrollPosition();
    };
  }, [storageKey]);

  // 2. 페이지에 들어왔을 때(Mount) 및 데이터 로딩 완료 시 스크롤 복원
  useEffect(() => {
    if (!isLoading) {
      const savedPosition = sessionStorage.getItem(storageKey);
      if (savedPosition) {
        // 약간의 지연을 주어 DOM 렌더링이 확실히 끝난 후 이동하도록 함
        // requestAnimationFrame은 브라우저가 다음 리페인트를 수행하기 전에 실행됨
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        });
      }
    }
  }, [isLoading, storageKey]);
}
