'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/utils/constants';

// Define allowed routes by role
const ROLE_ROUTES: Record<string, string[]> = {
  [ROLES.DONOR]: [
    '/dashboard',
    '/dashboard/profile/donor',
    '/dashboard/profile/donor/edit',
    '/dashboard/profile/donor/change-password',
    '/dashboard/lich-su',
  ],
  [ROLES.STAFF]: [
    '/dashboard',
    '/dashboard/profile/staff',
    '/dashboard/profile/staff/edit',
    '/dashboard/nhan-vien',
    '/dashboard/phieu-kham',
    '/dashboard/phieu-hien',
    '/dashboard/kho-mau',
    '/dashboard/tui-mau/them',
    '/dashboard/nguoi-hien-mau',
    '/dashboard/thong-ke',
  ],
  [ROLES.ADMIN]: [
    // Admin can access all routes
    '/dashboard',
    '/dashboard/profile/admin',
    '/dashboard/profile/admin/edit',
    '/dashboard/nhan-vien',
    '/dashboard/phieu-kham',
    '/dashboard/phieu-hien',
    // '/dashboard/kho-mau' (merged operational page) intentionally omitted for Admin
    // '/dashboard/tui-mau' intentionally omitted; Admin cannot create/update/delete bags
    '/dashboard/nguoi-hien-mau',
    '/dashboard/thong-ke',
    '/dashboard/lich-su',
  ],
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * Component to protect routes based on user role
 * Redirects to login if not authenticated
 * Redirects to dashboard if user doesn't have permission
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.push('/auth/login');
      return;
    }

    // If allowedRoles is specified, check permission
    if (allowedRoles && !allowedRoles.includes(user.vaitro)) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  // Show nothing while loading or redirecting
  if (isLoading || !isAuthenticated || !user) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  return <>{children}</>;
}

/**
 * Utility function to check if a route is allowed for a specific role
 */
export function isRouteAllowedForRole(route: string, role: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  
  // Check exact match
  if (allowedRoutes.includes(route)) {
    return true;
  }

  // Check if route starts with any allowed route pattern
  for (const allowedRoute of allowedRoutes) {
    // Handle dynamic routes like /dashboard/profile/[id]/edit
    const pattern = allowedRoute.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}(/.*)?$`);
    if (regex.test(route)) {
      return true;
    }
  }

  return false;
}

export default ProtectedRoute;
