'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Droplet, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  ClipboardList,
  UserCog,
  FileHeart,
  Package,
  icons
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

function MarqueeBanner({ name }: { name?: string }) {
  // useRef: giữ tham chiếu DOM; thay đổi .current không gây re-render
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const messages = [
    `Chào mừng ${name || 'bạn'} đến với hệ thống quản lý Ngân hàng máu`,
    'Theo dõi kho máu dễ dàng',
    'Báo cáo thống kê trực quan',
    'Bảo mật dữ liệu cao',
    'Quy trình tối giản',
    'Hiệu năng ổn định',
  ];

  // useEffect: chạy sau render DOM; deps [name] → chạy lại khi name đổi
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const speed = 80; // px / second

    const start = () => {
      const contentWidth = track.scrollWidth;
      const containerWidth = container.clientWidth;
      const distance = contentWidth + containerWidth; // run through all once
      const duration = (distance / speed) * 1000;

      const anim = track.animate(
        [
          { transform: `translateX(${containerWidth}px)` },
          { transform: `translateX(-${contentWidth}px)` },
        ],
        { duration, iterations: Infinity, easing: 'linear' }
      );
      return anim;
    };

    let anim = start();
    const onResize = () => {
      if (anim) anim.cancel();
      anim = start();
    };
    // Đăng ký listener và cleanup khi unmount/đổi deps
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (anim) anim.cancel();
    };
  }, [name]);

  return (
    <div className="pt-3 border-t overflow-hidden">
      <div ref={containerRef} className="relative w-full">
        <div ref={trackRef} className="inline-flex gap-50 items-center will-change-transform whitespace-nowrap">
          {messages.map((m, i) => (
            <span key={i} className="text-sm font-semibold text-gray-900">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  // usePathname: lấy đường dẫn hiện tại để đánh dấu menu đang active
  const pathname = usePathname();
  // useState: quản lý mở/đóng sidebar; setSidebarOpen → re-render UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // useRouteGuard (custom hook): kiểm tra quyền truy cập sau mount
  useRouteGuard();

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    ];

    // ADMIN - Full access to all features
    if (user?.vaitro === 'Admin') {
      return [
        ...baseItems,
        { href: '/dashboard/nhan-vien', icon: UserCog, label: 'Quản lý nhân viên' },
        { href: '/dashboard/nguoi-hien-mau', icon: Users, label: 'Quản lý Người hiến máu' },
        { href: '/dashboard/quan-ly-tai-khoan', icon: User, label: 'Quản lý tài khoản' },
        { href: '/dashboard/thong-ke', icon: BarChart3, label: 'Báo cáo và Thống kê' },
        { href: '/dashboard/profile/admin', icon: Settings, label: 'Thông tin tài khoản' },
      ];
    }

    // NHÂN VIÊN Y TẾ - Can manage donors, create health checks, donation records, blood bags
    if (user?.vaitro === 'Nhân viên y tế') {
      return [
        ...baseItems,
        { href: '/dashboard/nguoi-hien-mau', icon: Users, label: 'Người hiến máu' },
        { href: '/dashboard/phieu-kham', icon: ClipboardList, label: 'Phiếu khám sàng lọc' },
        { href: '/dashboard/phieu-hien', icon: FileHeart, label: 'Phiếu hiến máu' },
        { href: '/dashboard/kho-mau', icon: Droplet, label: 'Kho máu và Túi máu' },
        { href: '/dashboard/thong-ke', icon: BarChart3, label: 'Báo cáo' },
        { href: '/dashboard/profile/staff', icon: Settings, label: 'Thông tin tài khoản' },
      ];
    }

    // NGƯỜI HIẾN MÁU - Can view their own donation history and update personal info
    if (user?.vaitro === 'Người hiến máu') {
      return [
        ...baseItems,
        { href: '/dashboard/profile/donor', icon: User, label: 'Thông tin cá nhân' },
        { href: '/dashboard/lich-su', icon: FileText, label: 'Lịch sử hiến máu' },
      ];
    }

    return baseItems;
  };

  // Tính danh sách menu theo vai trò hiện tại
  const navItems = getNavItems();

  // Get dashboard title based on role
  const getDashboardTitle = () => {
    switch (user?.vaitro) {
      case 'Admin':
        return {
          title: 'Dashboard Admin',
          subtitle: 'Quản lý hệ thống và nhân sự'
        };
      case 'Nhân viên y tế':
        return {
          title: 'Dashboard Nhân viên Y tế',
          subtitle: 'Quản lý người hiến máu và kho máu'
        };
      case 'Người hiến máu':
        return {
          title: 'Dashboard Người hiến máu',
          subtitle: 'Theo dõi lịch sử hiến máu của bạn'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Chào mừng bạn đến với hệ thống quản lý ngân hàng máu'
        };
    }
  };

  // Tính tiêu đề/subtitle dashboard theo vai trò
  const dashboardInfo = getDashboardTitle();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Ngân hàng máu</h1>
              <p className="text-xs text-gray-500">{user?.vaitro}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out transform ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/40 scale-[1.02] font-semibold'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600 hover:scale-[1.01]'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3 px-4 py-2 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  {user?.hotennvyt}
                </p>
                <p className="text-sm text-gray-900 truncate">
                  {user?.hotennguoihien}
                </p>
                <p className="text-sm text-gray-900 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 border border-gray-300 py-2 w-full text-left text-gray-700 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 ml-3" />
              <span className="font-medium ml-3">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="px-4 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mb-3"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            
            {/* Dashboard Title */}
            <div className="mb-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardInfo.title}
              </h1>
              <p className="text-sm text-gray-600">
                {dashboardInfo.subtitle}
              </p>
            </div>

            {/* Marquee Banner */}
            <MarqueeBanner name={user?.hotennvyt} />
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
