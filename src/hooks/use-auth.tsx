import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useEffect } from 'react';

import { AuthContext } from '~/context/AuthContext';

export const useAuth = () => useContext(AuthContext);

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        void router.push('/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
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
