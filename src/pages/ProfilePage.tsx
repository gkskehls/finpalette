import { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfileQuery } from '../hooks/queries/useProfileQuery';
import { useUpdateProfileMutation } from '../hooks/queries/useProfileMutation';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import {
  getLocalStorageUsage,
  formatBytes,
  LOCAL_STORAGE_MAX_BYTES,
  LOCAL_STORAGE_WARNING_THRESHOLD_BYTES,
  LOCAL_STORAGE_DANGER_THRESHOLD_BYTES,
} from '../utils/storage';
import styles from './ProfilePage.module.css';
import { Skeleton } from '../components/common/Skeleton';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const [localStorageUsage, setLocalStorageUsage] = useState(0);
  const { data: profile } = useProfileQuery(user?.id);
  const updateProfileMutation = useUpdateProfileMutation();
  const { uploadAvatar, isUploading } = useAvatarUpload();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  // 세션 메타데이터와 DB 프로필 데이터 동기화 (Self-Healing)
  useEffect(() => {
    if (!user || !profile) return;

    const { full_name: metaName, avatar_url: metaAvatar } =
      user.user_metadata || {};
    const { full_name: dbName, avatar_url: dbAvatar } = profile;

    // DB 데이터가 존재하고, 메타데이터와 다를 경우에만 업데이트
    // (다른 기기에서 변경된 정보를 현재 기기의 세션에 반영하기 위함)
    const shouldUpdateName = dbName && dbName !== metaName;
    const shouldUpdateAvatar = dbAvatar && dbAvatar !== metaAvatar;

    if (shouldUpdateName || shouldUpdateAvatar) {
      supabase.auth
        .updateUser({
          data: {
            ...(shouldUpdateName && { full_name: dbName }),
            ...(shouldUpdateAvatar && { avatar_url: dbAvatar }),
          },
        })
        .then(({ error }) => {
          if (error) {
            console.error('세션 동기화 실패:', error);
          } else {
            // 동기화 성공 시 로그 (개발 모드 확인용)
            // console.log('세션 데이터가 최신 프로필로 동기화되었습니다.');
          }
        });
    }
  }, [user, profile]);

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

  const handleUpdateName = () => {
    if (!user || !newName.trim()) return;

    const promise = updateProfileMutation.mutateAsync({
      id: user.id,
      full_name: newName,
    });

    toast
      .promise(promise, {
        loading: '이름을 변경하는 중...',
        success: '이름이 변경되었습니다!',
        error: '이름 변경에 실패했습니다.',
      })
      .then(() => {
        setIsEditingName(false);
      });
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    const file = e.target.files[0];

    // 이미지 업로드 및 프로필 업데이트 과정을 하나의 Promise로 묶어 토스트 처리
    const uploadProcess = async () => {
      const publicUrl = await uploadAvatar(file);
      if (publicUrl) {
        await updateProfileMutation.mutateAsync({
          id: user.id,
          avatar_url: publicUrl,
        });
      } else {
        throw new Error('Upload failed');
      }
    };

    toast.promise(uploadProcess(), {
      loading: '프로필 사진을 업로드 중...',
      success: '프로필 사진이 변경되었습니다!',
      error: '사진 업로드에 실패했습니다.',
    });
  };

  if (isLoading) {
    return (
      <div className={styles.profileContainer}>
        <h2 className={styles.sectionTitle}>계정 정보</h2>
        <div className={styles.authSection}>
          <div className={styles.profileHeader}>
            <Skeleton width={64} height={64} borderRadius="50%" />
            <div className={styles.profileInfo} style={{ width: '100%' }}>
              <div className={styles.profileRow}>
                <Skeleton width={50} height={16} />
                <Skeleton width={150} height={16} />
              </div>
              <div className={styles.profileRow}>
                <Skeleton width={50} height={16} />
                <Skeleton width={100} height={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 프로필 이미지 URL 결정 로직
  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      // 캐시 버스팅을 위해 updated_at 타임스탬프를 쿼리 파라미터로 추가
      const timestamp = profile.updated_at
        ? new Date(profile.updated_at).getTime()
        : 0;
      return `${profile.avatar_url}?t=${timestamp}`;
    }
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile?.full_name || user?.email || 'User'
    )}&background=random`;
  };

  return (
    <div className={styles.profileContainer} style={{ position: 'relative' }}>
      {/* 앱 버전 표시 (우측 상단) */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          right: '10px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          opacity: 0.7,
          fontFamily: 'monospace',
        }}
      >
        v1.1.26
      </div>

      <h2 className={styles.sectionTitle}>계정 정보</h2>
      {user ? (
        <div className={styles.authSection}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapper}>
              <img
                src={getAvatarUrl()}
                alt="Profile"
                className={styles.avatar}
                // 이미지 로드 실패 시 대체 이미지 처리 (선택 사항)
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    profile?.full_name || user.email || 'User'
                  )}&background=random`;
                }}
              />
              <label
                htmlFor="avatar-upload"
                className={`${styles.avatarOverlay} ${isUploading ? styles.uploading : ''}`}
              >
                {isUploading ? (
                  <div className={styles.spinner} />
                ) : (
                  <Camera size={20} color="white" />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.hiddenInput}
                disabled={isUploading}
              />
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileRow}>
                <span className={styles.label}>이메일</span>
                <span className={styles.value}>{user.email}</span>
              </div>
              <div className={styles.profileRow}>
                <span className={styles.label}>이름</span>
                {isEditingName ? (
                  <div className={styles.editNameWrapper}>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className={styles.nameInput}
                    />
                    <button
                      onClick={handleUpdateName}
                      className={styles.saveButton}
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className={styles.cancelButton}
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className={styles.nameDisplay}>
                    <span className={styles.value}>
                      {profile?.full_name ||
                        user.user_metadata?.full_name ||
                        '이름 없음'}
                    </span>
                    <button
                      onClick={() => {
                        setNewName(profile?.full_name || '');
                        setIsEditingName(true);
                      }}
                      className={styles.editButton}
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
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
      <div
        className={styles.menuItem}
        onClick={() => navigate('/categories')}
        style={{ cursor: 'pointer' }}
      >
        <span>카테고리 설정</span>
        <span>&gt;</span>
      </div>
    </div>
  );
}
