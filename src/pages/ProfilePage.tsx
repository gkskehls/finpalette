import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getLocalStorageUsage,
  formatBytes,
  LOCAL_STORAGE_MAX_BYTES,
  LOCAL_STORAGE_WARNING_THRESHOLD_BYTES,
  LOCAL_STORAGE_DANGER_THRESHOLD_BYTES,
} from '../utils/storage';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const [localStorageUsage, setLocalStorageUsage] = useState(0);

  useEffect(() => {
    // 페이지 로드 시 및 로컬 스토리지 변경 시 사용량 업데이트
    const updateUsage = () => {
      setLocalStorageUsage(getLocalStorageUsage());
    };

    updateUsage(); // 초기 로드 시 한 번 실행

    window.addEventListener('storage', updateUsage);

    return () => {
      window.removeEventListener('storage', updateUsage);
    };
  }, []);

  const storageStatus = useMemo(() => {
    const percentage = (localStorageUsage / LOCAL_STORAGE_MAX_BYTES) * 100;
    let message = '';
    let barColor = '#4A90E2'; // 기본: 파란색
    let showWarningIcon = false;
    let showCTA = false;

    if (localStorageUsage >= LOCAL_STORAGE_DANGER_THRESHOLD_BYTES) {
      message =
        '⚠️ 저장 공간이 가득 찼습니다! 데이터 유실 방지를 위해 지금 바로 계정을 연동하세요.';
      barColor = '#D0021B'; // 위험: 붉은색
      showWarningIcon = true;
      showCTA = true;
    } else if (localStorageUsage >= LOCAL_STORAGE_WARNING_THRESHOLD_BYTES) {
      message =
        '저장 공간이 거의 다 차가고 있어요. 계정 연동으로 데이터를 안전하게 백업하세요!';
      barColor = '#F5A623'; // 경고: 주황색
      showWarningIcon = true;
    } else {
      message =
        '현재 기기에 데이터를 저장하고 있어요. 데이터를 안전하게 보관하려면 계정을 연동하세요.';
    }

    return { percentage, message, barColor, showWarningIcon, showCTA };
  }, [localStorageUsage]);

  if (isLoading) {
    return <div className={styles.profileContainer}>로딩 중...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h2 className={styles.sectionTitle}>계정 정보</h2>
      {user ? (
        <div className={styles.authSection}>
          <p>환영합니다, {user.email ?? '사용자'}님!</p>
          <button onClick={signOut} className={styles.authButton}>
            로그아웃
          </button>
        </div>
      ) : (
        <div className={styles.authSection}>
          <p>로그인하여 데이터를 안전하게 관리하세요.</p>
          <button onClick={signInWithGoogle} className={styles.authButton}>
            Google로 로그인
          </button>
        </div>
      )}

      {!user && ( // 게스트 모드일 때만 저장 공간 관리 섹션 표시
        <div className={styles.storageSection}>
          <h2 className={styles.sectionTitle}>저장 공간 관리</h2>
          <p className={styles.storageMessage}>{storageStatus.message}</p>
          <div className={styles.progressBarBackground}>
            <div
              className={styles.progressBarFill}
              style={{
                width: `${storageStatus.percentage}%`,
                backgroundColor: storageStatus.barColor,
              }}
            ></div>
          </div>
          <div className={styles.storageDetails}>
            <span>
              사용량: {formatBytes(localStorageUsage)} /{' '}
              {formatBytes(LOCAL_STORAGE_MAX_BYTES)}
            </span>
            <span className={styles.percentageText}>
              {storageStatus.percentage.toFixed(0)}%
            </span>
            {storageStatus.showWarningIcon && (
              <span className={styles.warningIcon}>⚠️</span>
            )}
          </div>
          {storageStatus.showCTA && (
            <button onClick={signInWithGoogle} className={styles.ctaButton}>
              무료로 계정 연동하고 데이터 백업하기
            </button>
          )}
        </div>
      )}

      <h2 className={styles.sectionTitle}>카테고리 관리</h2>
      <div className={styles.menuItem}>
        <span>카테고리 설정</span>
        <span>&gt;</span>
      </div>

      <h2 className={styles.sectionTitle}>기타 설정</h2>
      <div className={styles.menuItem}>
        <span>앱 버전</span>
        <span>1.0.12</span>
      </div>
    </div>
  );
}
