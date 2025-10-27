import { Loader } from 'lucide-react';
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
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader className="animate-spin" size={36} />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <div>UNAUTHORIZED</div>;
    }

    return <Component {...props} />;
  };
}
