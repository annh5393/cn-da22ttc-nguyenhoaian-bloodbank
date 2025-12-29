'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isRouteAllowedForRole } from '@/utils/routeConfig';

/**
 * Hook to check route access and redirect if not allowed
 */
export function useRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      setIsChecking(true);
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      if (pathname.startsWith('/dashboard')) {
        router.push('/auth/login');
      }
      setIsChecking(false);
      return;
    }

    // Check if current route is allowed for user's role
    const isAllowed = isRouteAllowedForRole(pathname, user.vaitro);

    // If not allowed, redirect to dashboard
    if (!isAllowed && pathname.startsWith('/dashboard') && pathname !== '/dashboard') {
      console.warn(`Truy cập bị từ chối: ${user.vaitro} không có quyền truy cập ${pathname}`);
      router.push('/dashboard');
      setIsChecking(false);
      return;
    }
    
    setIsChecking(false);
  }, [isAuthenticated, isLoading, user, pathname, router]);

  return { isChecking };
}

export default useRouteGuard;
