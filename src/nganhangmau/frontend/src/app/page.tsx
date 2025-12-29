'use client';

import Link from 'next/link';
import { BookOpen, CircleHelp, Contact, Droplet, LogIn, LogOut, Mail, MapPin, Newspaper, Phone } from 'lucide-react';
import RegisterPage from './auth/register/page';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Blood Bank</h1>
              <p className="text-xs text-gray-500">Hệ thống quản lý ngân hàng máu</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/account?mode=login"
              className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/account?mode=register"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Cứu sống người bằng{' '}
            <span className="text-red-600">giọt máu đỏ</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tham gia hiến máu tình nguyện để mang lại hy vọng cho những người cần máu. 
            <br></br>Mỗi giọt máu của bạn có thể cứu sống một mạng người.
          </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/account?mode=register"
            className="px-8 py-4 bg-red-600 text-white text-lg font-semibold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            Tham gia hiến máu ngay
          </Link>
          <Link
            href="#info"
            className="px-8 py-4 border-2 border-red-600 text-red-600 text-lg font-semibold rounded-lg hover:bg-red-50 transition-all"
          >
            Tìm hiểu thêm
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Lượt hiến máu</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">1,500+</div>
              <div className="text-gray-600">Người được cứu</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-gray-600">Tình nguyện viên</div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="info" className="container mx-auto px-4 py-18">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-3 mt-3">
            Tin tức & Sự kiện hiến máu
          </h3>
          <p className="text-gray-600">
            Cập nhật những thông tin mới nhất về các chương trình, sự kiện hiến máu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* News Card 1 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
              <Droplet className="w-16 h-16 text-red-400" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded-full">
                  Chương trình
                </span>
                <span className="text-sm text-gray-500">15/11/2024</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Chương trình 'Giọt máu hồng' - Cứu sống hàng nghìn người
              </h4>
              <p className="text-gray-600 mb-4">
                Tham gia chương trình hiến máu tình nguyện 'Giọt máu hồng' để mang lại hy vọng cho những bệnh nhân cần máu...
              </p>
              <Link href="#" className="text-red-600 font-semibold hover:underline">
                Đọc thêm →
              </Link>
            </div>
          </div>

          {/* News Card 2 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
              <Droplet className="w-16 h-16 text-red-400" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                  Sự kiện
                </span>
                <span className="text-sm text-gray-500">20/1/2024</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Sự kiện 'Ngày hội hiến máu' tại các trường đại học
              </h4>
              <p className="text-gray-600 mb-4">
                Các trường đại học trên cả nước tổ chức ngày hội hiến máu với sự tham gia của hàng nghìn sinh viên...
              </p>
              <Link href="#" className="text-red-600 font-semibold hover:underline">
                Đọc thêm →
              </Link>
            </div>
          </div>

          {/* News Card 3 */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
              <Droplet className="w-16 h-16 text-red-400" />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full">
                  Câu chuyện
                </span>
                <span className="text-sm text-gray-500">25/1/2024</span>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                Câu chuyện cảm động: Cô gái trẻ hiến máu cứu người lạ
              </h4>
              <p className="text-gray-600 mb-4">
                Câu chuyện về cô gái 22 tuổi đã hiến máu để cứu sống một bệnh nhân không quen biết...
              </p>
              <Link href="#" className="text-red-600 font-semibold hover:underline">
                Đọc thêm →
              </Link>
            </div>
          </div>
        </div>

        {/* More Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplet className="w-12 h-12 text-purple-500" />
              </div>
              <div className="flex-1">
                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                  Kiến thức
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">
                  Những điều cần biết trước khi hiến máu
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Hướng dẫn chi tiết về quy trình, điều kiện và chuẩn bị trước khi hiến máu...
                </p>
                <Link href="#" className="text-purple-600 text-sm font-semibold hover:underline">
                  Đọc thêm →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplet className="w-12 h-12 text-orange-500" />
              </div>
              <div className="flex-1">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs rounded-full">
                  Sức khỏe
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">
                  Lợi ích của việc hiến máu đối với sức khỏe
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Hiến máu không chỉ giúp người khác mà còn mang lại nhiều lợi ích cho sức khỏe...
                </p>
                <Link href="#" className="text-orange-600 text-sm font-semibold hover:underline">
                  Đọc thêm →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplet className="w-12 h-12 text-teal-500" />
              </div>
              <div className="flex-1">
                <span className="px-3 py-1 bg-teal-100 text-teal-600 text-xs rounded-full">
                  Hướng dẫn
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">
                  Quy trình hiến máu an toàn và chuyên nghiệp
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Tìm hiểu về quy trình hiến máu tiêu chuẩn quốc tế, đảm bảo an toàn tuyệt đối...
                </p>
                <Link href="#" className="text-teal-600 text-sm font-semibold hover:underline">
                  Đọc thêm →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplet className="w-12 h-12 text-pink-500" />
              </div>
              <div className="flex-1">
                <span className="px-3 py-1 bg-pink-100 text-pink-600 text-xs rounded-full">
                  Thông báo
                </span>
                <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2">
                  Kêu gọi hiến máu khẩn cấp nhóm O, AB
                </h4>
                <p className="text-gray-600 text-sm mb-2">
                  Kho máu đang thiếu hụt trầm trọng nhóm O và AB. Kêu gọi mọi người tham gia...
                </p>
                <Link href="#" className="text-pink-600 text-sm font-semibold hover:underline">
                  Đọc thêm →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  {/* <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg> */}
                  <Droplet className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold">Ngân Hàng Máu</span>
              </div>
              <p className="text-gray-400">
                Hệ thống quản lý ngân hàng máu <br /> và hiến máu tình nguyện. <br />An toàn và tiện lợi.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên kết nhanh</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/auth/account?mode=login" className="hover:text-white transition-colors"><LogIn className="inline-block w-4 h-4 mr-1" /> Đăng nhập</Link></li>
                <li><Link href="/auth/account?mode=register" className="hover:text-white transition-colors"><LogOut className="inline-block w-4 h-4 mr-1" /> Đăng ký</Link></li>
                <li><a href="#info" className="hover:text-white transition-colors"><Newspaper className="inline-block w-4 h-4 mr-1" /> Tin tức</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors"><BookOpen className="inline-block w-4 h-4 mr-1" /> Hướng dẫn</a></li>
                <li><a href="#" className="hover:text-white transition-colors"><Contact className="inline-block w-4 h-4 mr-1" /> Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition-colors"><CircleHelp className="inline-block w-4 h-4 mr-1" /> FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Mail className="inline-block w-4 h-4 mr-1" /> annguyen@gmail.com</li>
                <li><Phone className="inline-block w-4 h-4 mr-1" /> 5973738478</li>
                <li><MapPin className="inline-block w-4 h-4 mr-1" /> Vĩnh Long, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Ngân hàng máu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
