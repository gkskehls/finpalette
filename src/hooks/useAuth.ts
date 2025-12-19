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

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // 'SIGNED_IN' 이벤트가 발생했을 때 데이터 마이그레이션을 백그라운드에서 실행합니다.
        if (event === 'SIGNED_IN' && session) {
          // 즉시 실행 함수(IIFE)로 감싸서 백그라운드에서 비동기 작업을 처리합니다.
          // 이 함수를 'await'하지 않으므로 UI 렌더링을 차단하지 않습니다.
          (async () => {
            console.log(
              'Detected SIGNED_IN event. Starting migration in background...'
            );
            const migrationOccurred = await migrateGuestData(session.user);
            if (migrationOccurred) {
              console.log(
                'Migration successful. Invalidating transactions query.'
              );
              await queryClient.invalidateQueries({
                queryKey: ['transactions'],
              });
            }
          })();
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
      // 로그아웃 후 데이터 재조회를 위해 쿼리 무효화
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      console.error('Unexpected error during sign-out:', error);
    }
  };

  return { user, isLoading, signInWithGoogle, signOut };
}
