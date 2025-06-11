import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only check after initial loading is complete
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // Check role requirements if specified
    if (requiredRole && user) {
      let hasRequiredRole = false;

      if (Array.isArray(requiredRole)) {
        hasRequiredRole = requiredRole.includes(user.role);
      } else {
        hasRequiredRole = user.role === requiredRole;
      }

      if (!hasRequiredRole) {
        // Redirect to dashboard if user doesn't have required role
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router, requiredRole, user]);

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  // Don't render children until authentication is confirmed
  if (!isAuthenticated) {
    return <div className="flex items-center justify-center h-screen">Redirection vers la page de connexion...</div>;
  }

  // If role check is needed and user doesn't have it, show a message
  if (requiredRole && user) {
    let hasRequiredRole = false;

    if (Array.isArray(requiredRole)) {
      hasRequiredRole = requiredRole.includes(user.role);
    } else {
      hasRequiredRole = user.role === requiredRole;
    }

    if (!hasRequiredRole) {
      return <div className="flex items-center justify-center h-screen">Accès non autorisé</div>;
    }
  }

  // Render children if authenticated and has required role (if specified)
  return <>{children}</>;
} 