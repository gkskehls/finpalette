import { useState } from 'react';
import { MailOpen, LogIn, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAcceptInvitationMutation } from '../hooks/queries/useAcceptInvitationMutation';
import styles from './InvitePage.module.css';

export function InvitePage() {
  const { user, signInWithGoogle } = useAuth();
  const acceptInvitationMutation = useAcceptInvitationMutation();

  // useState 초기화 함수에서 URL 파라미터 파싱
  const [code] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code');
  });

  // 코드가 없으면 초기 에러 설정
  const [error, setError] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('code') ? null : '유효하지 않은 초대 링크입니다.';
  });

  const handleAccept = () => {
    if (!code) return;
    acceptInvitationMutation.mutate(code, {
      onSuccess: () => {
        // 성공 시 홈으로 이동 (쿼리 파라미터 제거)
        window.location.href = '/';
      },
      onError: (err) => {
        setError(err.message || '초대 수락 중 오류가 발생했습니다.');
      },
    });
  };

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div
            className={styles.iconWrapper}
            style={{ backgroundColor: '#FEE2E2', color: '#EF4444' }}
          >
            <AlertCircle size={40} />
          </div>
          <h1 className={styles.title}>오류 발생</h1>
          <p className={styles.description}>{error}</p>
          <button
            className={styles.button}
            onClick={() => (window.location.href = '/')}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <MailOpen size={40} />
        </div>
        <h1 className={styles.title}>공유 가계부 초대</h1>
        <p className={styles.description}>
          공유 가계부(팔레트)에 초대되셨습니다.
          <br />
          함께 가계부를 관리해보세요!
        </p>

        {user ? (
          <button
            className={styles.button}
            onClick={handleAccept}
            disabled={acceptInvitationMutation.isPending}
          >
            {acceptInvitationMutation.isPending ? (
              '처리 중...'
            ) : (
              <>
                <CheckCircle size={20} />
                초대 수락하기
              </>
            )}
          </button>
        ) : (
          <button className={styles.button} onClick={signInWithGoogle}>
            <LogIn size={20} />
            로그인하고 참여하기
          </button>
        )}
      </div>
    </div>
  );
}
