'use client';

import { ReactNode } from 'react';
import { useRouteGuard } from '@/hooks/useRouteGuard';

interface DashboardSubLayoutProps {
  children: ReactNode;
}

/**
 * This layout ensures all dashboard sub-routes are protected
 * The useRouteGuard hook will handle redirects for unauthorized access
 */
export default function DashboardSubLayout({ children }: DashboardSubLayoutProps) {
  useRouteGuard();
  
  return <>{children}</>;
}
