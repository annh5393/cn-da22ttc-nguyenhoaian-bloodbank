'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import DonorDashboard from '@/components/dashboard/DonorDashboard';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/account?mode=login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.vaitro) {
      case 'Admin':
        return <AdminDashboard />;
      case 'Nhân viên y tế':
        return <StaffDashboard />;
      case 'Người hiến máu':
        return <DonorDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Vai trò không hợp lệ</p>
          </div>
        );
    }
  };

  return renderDashboard();
}