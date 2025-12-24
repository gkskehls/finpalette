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
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 'SIGNED_IN' 이벤트가 발생했을 때 데이터 마이그레이션을 백그라운드에서 실행합니다.
        if (event === 'SIGNED_IN' && session) {
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
                  // 팔레트 목록과 트랜잭션 목록 모두를 무효화하는 것이 안전합니다.
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
    } catch (error) {
      console.error('Unexpected error during sign-out:', error);
    }
  };

  return { user, isLoading, signInWithGoogle, signOut };
}
