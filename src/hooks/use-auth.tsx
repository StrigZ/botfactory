import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useEffect } from 'react';

import { AuthContext } from '~/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        void router.push('/login');
      }
    }, [isAuthenticated, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return <div>UNAUTHoRIZED</div>;
    }

    return <Component {...props} />;
  };
}
