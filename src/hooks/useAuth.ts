import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 현재 사용자 정보를 가져옵니다.
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      }
      setUser(data?.user ?? null);
      setIsLoading(false);
    };

    fetchUser();

    // 인증 상태 변경(로그인, 로그아웃)을 감지하는 리스너를 설정합니다.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // 로그인/로그아웃 시에는 로딩 상태를 변경할 필요가 없습니다.
        // 초기 로딩은 fetchUser에서 처리합니다.
      }
    );

    // 컴포넌트 언마운트 시 리스너를 정리합니다.
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) {
        console.error('Error signing in with Google:', error);
        // 사용자에게 에러를 알리는 로직을 추가할 수 있습니다 (예: toast 메시지)
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
