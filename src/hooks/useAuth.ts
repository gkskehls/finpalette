import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { migrateGuestData } from '../lib/migration';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 마이그레이션 중복 실행 방지 플래그 (컴포넌트 생명주기 바깥에 위치)
let isMigrationRunning = false;

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // 프로필 동기화 함수 (재사용을 위해 분리)
    const syncUserProfile = async (session: { user: User }) => {
      try {
        const { user } = session;
        const updates = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(updates, { onConflict: 'id' });

        if (error) {
          console.error('Failed to sync user profile:', error);
        } else {
          console.log('User profile synced successfully.');
        }
      } catch (err) {
        console.error('Error syncing profile:', err);
      }
    };

    // 초기 로드 시 세션 확인 및 프로필 동기화
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        syncUserProfile(session);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 'SIGNED_IN' 이벤트가 발생했을 때 데이터 마이그레이션 및 프로필 동기화를 실행합니다.
        if (event === 'SIGNED_IN' && session) {
          // 1. 프로필 정보 동기화 (Self-Healing)
          syncUserProfile(session);

          // 2. 게스트 데이터 마이그레이션
          if (!isMigrationRunning) {
            isMigrationRunning = true;
            (async () => {
              try {
                console.log(
                  'Detected SIGNED_IN event. Starting migration in background...'
                );
                const migrationOccurred = await migrateGuestData(session.user);
                if (migrationOccurred) {
                  console.log(
                    'Migration successful. Invalidating transactions query.'
                  );
                  // 마이그레이션 후 최신 데이터를 반영하기 위해 쿼리를 무효화합니다.
                  await queryClient.invalidateQueries({
                    queryKey: ['palettes'],
                  });
                  await queryClient.invalidateQueries({
                    queryKey: ['transactions'],
                  });
                }
              } finally {
                isMigrationRunning = false;
              }
            })();
          }
        }

        // 세션 정보를 바탕으로 유저 상태를 즉시 업데이트합니다.
        setUser(session?.user ?? null);
        // 인증 상태 확인이 완료되었으므로 로딩 상태를 즉시 해제합니다.
        setIsLoading(false);
      }
    );

    // 컴포넌트 언마운트 시 리스너를 정리합니다.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [queryClient]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Unexpected error during Google sign-in:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      // 로그아웃 후 모든 쿼리를 초기화하여 깨끗한 상태로 만듭니다.
      queryClient.clear();
      // 로그아웃 후 페이지를 새로고침하여 상태를 완전히 초기화합니다.
      window.location.reload();
    } catch (error) {
      console.error('Unexpected error during sign-out:', error);
    }
  };

  return { user, isLoading, signInWithGoogle, signOut };
}
