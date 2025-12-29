"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { register } from "@/api/auth.api";
import { UserRole } from "@/types/api.types";
import { Loader2, ArrowLeft, Droplet } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

// Simple, theme-fitting SVGs drawn inline so we don't rely on assets
const RegisterIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 540 300" xmlns="http://www.w3.org/2000/svg" {...props}>
    {/* soft background */}
    <defs>
      <linearGradient id="bgGrad" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stopColor="rgba(254,226,226,0.4)"/>
        <stop offset="100%" stopColor="rgba(252,165,165,0.3)"/>
      </linearGradient>
      <linearGradient id="bagGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#FECACA" stopOpacity="0.95"/>
        <stop offset="100%" stopColor="#FCA5A5"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="540" height="300" fill="url(#bgGrad)" rx="28" />

    {/* blood bag */}
    <g transform="translate(340,40)">
      <rect x="0" y="0" width="140" height="190" rx="18" fill="url(#bagGrad)" stroke="#EF4444" strokeWidth="3" />
      <rect x="18" y="20" width="104" height="150" rx="10" fill="#FEE2E2" stroke="#EF4444" strokeOpacity="0.6" strokeWidth="2" />
      {/* blood level */}
      <path d="M22 140c20-8 32 6 52 6s36-14 48-6v30H22z" fill="#DC2626" opacity="0.95" />
      {/* droplet icon */}
      <path d="M70 70c0 0-18 20-18 34a18 18 0 1 0 36 0C88 90 70 70 70 70z" fill="#B91C1C" opacity="0.95" />
      {/* bag cap */}
      <rect x="58" y="-16" width="24" height="16" rx="6" fill="#EF4444" opacity="0.9" />
      {/* tube */}
      <path d="M70 170 C 70 210, 30 220, -40 210" fill="none" stroke="#DC2626" strokeWidth="6" />
      <path d="M70 170 C 70 210, 30 220, -40 210" fill="none" stroke="#EF4444" strokeOpacity="0.8" strokeWidth="2" />
    </g>

    {/* donor arm */}
    <g transform="translate(40,160)">
      <rect x="0" y="24" width="260" height="52" rx="26" fill="#FDE68A" opacity="0.15" />
      <rect x="0" y="0" width="260" height="48" rx="24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
      {/* elbow round */}
      <circle cx="260" cy="24" r="24" fill="#FBBF24" stroke="#F59E0B" strokeWidth="3" />
      {/* bandage */}
      <rect x="90" y="10" width="56" height="28" rx="8" fill="#F3F4F6" opacity="0.95" />
      <rect x="100" y="16" width="14" height="16" rx="3" fill="#E5E7EB" />
      <rect x="122" y="16" width="14" height="16" rx="3" fill="#E5E7EB" />
      {/* heart */}
      <path d="M34 18c4-8 16-8 20 0 4-8 16-8 20 0 6 12-12 22-20 28-8-6-26-16-20-28z" fill="#DC2626" opacity="0.9" />
    </g>
  </svg>
);

const LoginIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 540 300" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <linearGradient id="bankGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#DBEAFE"/>
        <stop offset="100%" stopColor="#BFDBFE"/>
      </linearGradient>
    </defs>
    {/* glow */}
    <circle cx="430" cy="40" r="120" fill="rgba(191,219,254,0.3)" />
    {/* bank building */}
    <g transform="translate(70,70)">
      <polygon points="200,0 20,60 380,60" fill="#3B82F6" opacity="0.9" />
      <rect x="40" y="60" width="320" height="150" fill="url(#bankGrad)" stroke="#3B82F6" strokeOpacity="0.9" strokeWidth="3" rx="14" />
      {/* columns */}
      {[0,1,2,3,4].map((i)=>(
        <rect key={i} x={60 + i*60} y={78} width="24" height="112" rx="8" fill="#93C5FD" />
      ))}
      <rect x="40" y="190" width="320" height="20" fill="#3B82F6" opacity="0.9" />
    </g>
    {/* shield with droplet */}
    <g transform="translate(360,120)">
      <path d="M60 0l60 16v42c0 40-28 67-60 82-32-15-60-42-60-82V16L60 0z" fill="#FEE2E2" opacity="0.95" />
      <path d="M60 22c0 0-22 24-22 42a22 22 0 1 0 44 0C82 46 60 22 60 22z" fill="#DC2626" />
    </g>
  </svg>
);

const AccountAuthContent: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const [isRightPanelActive, setIsRightPanelActive] = useState(mode === 'login');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerBirthDate, setRegisterBirthDate] = useState("");
  const [registerGender, setRegisterGender] = useState("Nam");
  const [registerAddress, setRegisterAddress] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // When mode changes, update panel state
    // mode=login → show login form (isRightPanelActive=true)
    // mode=register → show register form (isRightPanelActive=false)
    setIsRightPanelActive(mode === 'login');
  }, [mode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoadingLogin(true);
    try {
      console.log('Attempting login with:', { email: loginEmail });
      await login({ email: loginEmail, password: loginPassword });
      console.log('Login successful, redirecting...');
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Đăng nhập thất bại";
      setErrorMsg(errorMessage);
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoadingRegister(true);
    try {
      console.log('Attempting register with:', { 
        email: registerEmail, 
        name: registerName,
        phone: registerPhone 
      });
      
      const result = await register({
        email: registerEmail,
        password: registerPassword,
        hotennvyt: registerName,
        sodienthoai: registerPhone,
        ngaysinh: registerBirthDate ? new Date(registerBirthDate) : undefined,
        gioitinh: registerGender,
        diachi: registerAddress,
        vaitro: 'Người hiến máu', // Default role for registration
      });
      
      console.log('Register successful:', result);
      setSuccessMsg("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      
      // Clear form
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPhone("");
      setRegisterBirthDate("");
      setRegisterAddress("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      
      setTimeout(() => {
        setIsRightPanelActive(true);
      }, 1500);
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || "Đăng ký thất bại";
      setErrorMsg(errorMessage);
    } finally {
      setLoadingRegister(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center font-[Arial] p-4 relative"
      style={{ 
        backgroundColor: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Back Button - Fixed outside main container for always visible */}
      <button
        onClick={() => router.push('/')}
        className="fixed top-6 left-6 z-[200] flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-lg shadow-lg hover:bg-white hover:shadow-xl transition-all border border-gray-200/50 text-gray-700 hover:text-red-600"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại</span>
      </button>

      <div className={`relative w-full max-w-7xl min-h-[800px] bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-700 
      ${ isRightPanelActive ? 'right-panel-active' : '' }`}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        {/* Sign Up Form */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-[600ms] ease-in-out z-[2] ${
            isRightPanelActive ? 'translate-x-full' : ''
          }`}
          style={{
            animation: !isRightPanelActive ? 'show 0.6s' : 'none'
          }}
        >
          <div className="bg-white flex flex-col justify-center px-6 h-full overflow-y-auto">
            <div className="w-full max-w-xl mx-auto py-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">Đăng ký tài khoản</h2>
                <p className="text-sm text-neutral-600">Tạo tài khoản mới để bắt đầu</p>
              </div>

              {errorMsg && !isRightPanelActive && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{successMsg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                {/* Họ tên và Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0123456789"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    required
                    maxLength={10}
                  />
                </div>

                {/* Ngày sinh và Giới tính */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <DatePicker
                      value={registerBirthDate ? new Date(registerBirthDate) : undefined}
                      onChange={(date) => setRegisterBirthDate(date ? date.toISOString().split('T')[0] : '')}
                      placeholder="Chọn ngày sinh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <select
                      value={registerGender}
                      onChange={(e) => setRegisterGender(e.target.value)}
                      className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    placeholder="123 Nguyễn Văn Linh, Quận 7, TP.HCM"
                    value={registerAddress}
                    onChange={(e) => setRegisterAddress(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingRegister}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loadingRegister ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang đăng ký...</span>
                    </div>
                  ) : (
                    'Đăng ký'
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-sm text-neutral-600">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRightPanelActive(true)}
                    className="text-red-600 font-medium hover:underline"
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Form */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full transition-all duration-[600ms] ease-in-out ${
            isRightPanelActive ? 'translate-x-full opacity-100 z-[5]' : 'opacity-0 z-[1]'
          }`}
          style={{
            animation: isRightPanelActive ? 'show 0.6s' : 'none'
          }}
        >
          <div className="bg-white flex flex-col justify-center px-8 h-full">
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Đăng nhập</h2>
                <p className="text-neutral-600">Nhập thông tin đăng nhập để tiếp tục</p>
              </div>

              {errorMsg && isRightPanelActive && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loadingLogin ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </div>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-neutral-600">
                  Bạn chưa có tài khoản? Hãy {' '}
                  <button 
                    type="button"
                    onClick={() => setIsRightPanelActive(false)}
                    className="text-red-600 font-medium hover:underline"
                  >
                     Đăng ký ngay
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Container */}
        <div 
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-[600ms] ease-in-out z-[100] ${
            isRightPanelActive ? '-translate-x-full' : ''
          }`}>
          <div 
            className={`relative -left-full w-[200%] h-full transition-transform duration-[600ms] ease-in-out ${
              isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'
            }`}
            style={{
              background: 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 50%, rgba(226,232,240,0.98) 100%)'
            }}
          >
            {/* Decorative background for blood bank theme */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* soft glows */}
              <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-red-200/50 blur-3xl" />
              <div className="absolute -right-28 top-10 w-80 h-80 rounded-full bg-blue-200/40 blur-3xl" />
              <div className="absolute right-20 -bottom-24 w-[28rem] h-[28rem] rounded-full bg-pink-200/35 blur-[90px]" />

              {/* subtle dotted pattern */}
              <div
                className="absolute inset-0 opacity-[0.12] mix-blend-multiply"
                style={{
                  backgroundImage:
                    'radial-gradient(currentColor 1px, transparent 1px), radial-gradient(currentColor 1px, transparent 1px)',
                  backgroundPosition: '0 0, 12px 12px',
                  backgroundSize: '24px 24px',
                  color: 'rgba(220,38,38,0.4)'
                }}
              />

              {/* floating droplets */}
              <div className="absolute left-10 top-16 animate-float-slow opacity-40">
                <svg width="44" height="60" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 0C22 0 2 24 2 38.5C2 50.9264 11.2975 60 22 60C32.7025 60 42 50.9264 42 38.5C42 24 22 0 22 0Z" fill="#DC2626" fillOpacity="0.25"/>
                </svg>
              </div>
              <div className="absolute left-1/2 top-8 animate-float opacity-35">
                <svg width="28" height="38" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 0C22 0 2 24 2 38.5C2 50.9264 11.2975 60 22 60C32.7025 60 42 50.9264 42 38.5C42 24 22 0 22 0Z" fill="#DC2626" fillOpacity="0.22"/>
                </svg>
              </div>
              <div className="absolute right-10 bottom-20 animate-float-slower opacity-30">
                <svg width="36" height="50" viewBox="0 0 44 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 0C22 0 2 24 2 38.5C2 50.9264 11.2975 60 22 60C32.7025 60 42 50.9264 42 38.5C42 24 22 0 22 0Z" fill="#DC2626" fillOpacity="0.2"/>
                </svg>
              </div>
            </div>
            {/* Left Overlay Panel - Đăng nhập */}
            <div 
              className={`absolute flex flex-col justify-between p-8 text-center top-0 h-full w-1/2 transition-transform duration-[600ms] ease-in-out ${
                isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'
              }`}
            >
              {/* Illustration for Login side */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-[6] pointer-events-none animate-float">
                <LoginIllustration className="w-[340px] h-auto opacity-90" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 justify-center">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-md">
                    <Droplet className="w-8 h-8 text-red-600 fill-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">Ngân Hàng Máu</span>
                </div>

                <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-4xl font-arial text-gray-900 leading-tight font-bold">
                    Chào mừng bạn!
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed text-justify">
                    <Droplet className="inline-block w-4 h-4 mr-1 text-red-600"/> Đăng nhập để truy cập hệ thống quản lý ngân hàng máu và hiến máu tình nguyện.<br />
                    <Droplet className="inline-block w-4 h-4 mr-1 text-red-600"/> Theo dõi lịch sử hiến máu của bạn, nhận nhắc lịch an toàn.
                  </p>

                  <div className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Đăng ký hiến máu tình nguyện</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Theo dõi lịch sử hiến máu</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Quản lý ngân hàng máu an toàn</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <button
                type="button"
                onClick={() => setIsRightPanelActive(true)}
                className="text-red-600 bg-white relative z-10 rounded-lg border border-white bg-transparent text-2xs font-bold py-3 px-11 tracking-wider transition-transform active:scale-95 hover:bg-white/20 hover:text-white"
              >
                Đăng nhập
              </button> */}

              <div className="relative z-10 text-gray-600 text-sm">
                © 2025 Ngân hàng máu.
              </div>
            </div>

            {/* Right Overlay Panel - Đăng ký */}
            <div 
              className={`absolute right-0 flex flex-col justify-between p-8 text-center top-0 h-full w-1/2 transition-transform duration-[600ms] ease-in-out ${
                isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'
              }`}
            >
              {/* Illustration for Register side */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-24 z-[6] pointer-events-none animate-float-slow">
                <RegisterIllustration className="w-[340px] h-auto opacity-95" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 justify-center">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shadow-md">
                    <Droplet className="w-8 h-8 text-red-600 fill-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">Ngân Hàng Máu</span>
                </div>

                <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-4xl font-arial text-gray-900 leading-tight">
                    Tham gia cùng chúng tôi!
                  </h2>
                  <p className="text-gray-700 text-lg leading-relaxed">
                    Cùng xây dựng cộng đồng hiến máu an toàn, minh bạch.
                  </p>

                  <div className="space-y-4 pt-6">
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Quản lý thông tin hiến máu</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Theo dõi kho máu an toàn</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-800">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Báo cáo và thống kê chi tiết</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* <button
                type="button"
                onClick={() => setIsRightPanelActive(false)}
                className="text-red-600 bg-white relative z-10 rounded-lg border border-white bg-transparent text-2xs font-bold py-3 px-11 tracking-wider transition-transform active:scale-95 hover:bg-white/20 hover:text-white"
              >
                Đăng ký
              </button> */}

              <div className="relative z-10 text-gray-600 text-sm">
                © 2025 Ngân hàng máu.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-slow { animation: float 12s ease-in-out infinite; }
        .animate-float-slower { animation: float 16s ease-in-out infinite; }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

const AccountAuthPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    }>
      <AccountAuthContent />
    </Suspense>
  );
};

export default AccountAuthPage;
