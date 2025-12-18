import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
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
  const previousSession = useRef<Session | null>(null);

  useEffect(() => {
    // 1. 컴포넌트 마운트 시 현재 세션 정보를 가져옵니다.
    const fetchInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching initial session:', error);
      }
      const session = data?.session ?? null;
      previousSession.current = session;
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    fetchInitialSession();

    // 2. 인증 상태 변경(로그인, 로그아웃)을 감지하는 리스너를 설정합니다.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // 3. 로그인 상태 변화 감지 (로그아웃 -> 로그인)
        if (session && !previousSession.current) {
          console.log('Detected login event. Starting migration check...');
          const migrationOccurred = await migrateGuestData(session.user);
          if (migrationOccurred) {
            // 4. 마이그레이션이 발생했다면, 서버 데이터를 다시 불러오도록 쿼리를 무효화합니다.
            console.log(
              'Migration successful. Invalidating transactions query.'
            );
            await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          }
        }

        // 현재 세션 상태를 업데이트합니다.
        setUser(session?.user ?? null);
        previousSession.current = session;
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
    } catch (error) {
      console.error('Unexpected error during sign-out:', error);
    }
  };

  return { user, isLoading, signInWithGoogle, signOut };
}
