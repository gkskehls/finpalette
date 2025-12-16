import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (_email: string) => void;
  logout: () => void;
}

// 임시 인증 훅 (Supabase 연동 시 실제 구현으로 대체될 예정)
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('mock_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  // 초기 상태를 true로 변경하여 첫 렌더링 시 로딩 상태가 되도록 함
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 실제 Supabase에서는 onAuthStateChange 리스너를 사용합니다.
    // 여기서는 초기 로딩 상태를 흉내냅니다.
    const timer = setTimeout(() => {
      setIsLoading(false); // 0.5초 후 로딩 상태를 false로 변경
    }, 500);
    return () => clearTimeout(timer);
  }, []); // 의존성 배열이 비어 있으므로 컴포넌트 마운트 시 한 번만 실행됩니다.

  const login = (email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const mockUser: User = { id: 'mock-user-id-123', email };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.removeItem('mock_user');
      setUser(null);
      setIsLoading(false);
    }, 500);
  };

  return { user, isLoading, login, logout };
}
