import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  // DashboardLayout component will handle route guard via useRouteGuard hook
  return <DashboardLayout>{children}</DashboardLayout>;
}
