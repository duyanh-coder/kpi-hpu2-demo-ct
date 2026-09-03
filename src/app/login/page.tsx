'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Shield, Users, CheckCircle, Building, FileText, X } from 'lucide-react';
import usersData from '@/data/users.json';
import rolesData from '@/data/roles.json';
import userRolesData from '@/data/user-roles.json';

const roleNameById: Record<string, string> = {};
(rolesData as { id: string; name: string }[]).forEach((r) => { roleNameById[r.id] = r.name; });

const roleByUserId: Record<string, string> = {};
(userRolesData as { userId: string; roleId: string }[]).forEach((ur) => { roleByUserId[ur.userId] = ur.roleId; });

const roleKeyByUsername: Record<string, string> = {};
(usersData as any[]).forEach((u) => {
  const roleId = roleByUserId[u.id];
  if (roleId) roleKeyByUsername[u.username] = roleNameById[roleId];
});

const demoAccounts = [
  { username: 'admin', label: 'Quản trị viên', desc: 'Toàn quyền hệ thống', icon: Shield, color: '#f44336' },
  { username: 'bgh01', label: 'Ban Giám hiệu', desc: 'Xem toàn trường, phê duyệt', icon: Users, color: '#9c27b0' },
  { username: 'hdkpi01', label: 'Hội đồng KPI', desc: 'Rà soát, khóa kết quả', icon: CheckCircle, color: '#2196f3' },
  { username: 'pdt01', label: 'Trưởng đơn vị', desc: 'Quản lý KPI đơn vị', icon: Building, color: '#ff9800' },
  { username: 'cbkpi01', label: 'Cán bộ KPI', desc: 'Cập nhật tiến độ, minh chứng', icon: FileText, color: '#4caf50' },
  { username: 'gvtoan', label: 'Nhân viên', desc: 'KPI cá nhân, tự đánh giá', icon: Users, color: '#607d8b' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const authError = searchParams.get('error');
  const { data: session } = useSession();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authErrorMessage = authError
    ? { CredentialsSignin: 'Tên đăng nhập hoặc mật khẩu không đúng' }[authError] || 'Đã có lỗi xác thực, vui lòng thử lại'
    : null;

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');

  useEffect(() => {
    if (session?.user) {
      router.replace('/');
    }
  }, [session, router]);

  const handleDemoLogin = async (acc: { username: string; label: string }) => {
    const user = (usersData as any[]).find((u) => u.username === acc.username);
    if (!user) return;
    setError('');
    setDemoLoading(acc.username);
    try {
      const result = await signIn('credentials', {
        username: user.username,
        password: user.password,
        redirect: false,
      });
      if (result?.error) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else {
        const roleName = roleKeyByUsername[acc.username] || 'staff';
        localStorage.setItem('activeRole', roleName);
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setDemoLoading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      } else {
        const matched = (usersData as any[]).find((u) => u.username === username);
        if (matched && roleKeyByUsername[matched.username]) {
          localStorage.setItem('activeRole', roleKeyByUsername[matched.username]);
        }
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-heading font-bold text-text-dark">
              Hệ thống KPI
            </h1>
            <p className="text-text-light mt-1">Trường Đại học Sư phạm Hà Nội 2</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(error || authErrorMessage) && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error || authErrorMessage}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-dark mb-1.5">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Nhập tên đăng nhập"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-dark"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="flex-1 h-px bg-border"></span>
            <span className="text-xs text-text-light">hoặc</span>
            <span className="flex-1 h-px bg-border"></span>
          </div>

          <div>
            <p className="text-sm font-medium text-text-dark mb-3">Demo vai trò</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  disabled={!!demoLoading}
                  onClick={() => handleDemoLogin(acc)}
                  className="flex items-center gap-2 p-3 rounded-lg border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${acc.color}20` }}>
                    {demoLoading === acc.username ? <Loader2 size={16} className="animate-spin" style={{ color: acc.color }} /> : <acc.icon size={16} style={{ color: acc.color }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-dark truncate">{acc.label}</div>
                    <div className="text-xs text-text-light truncate">{acc.username}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => { setShowForgotModal(true); setForgotEmail(''); setForgotMessage(null); }} className="text-sm text-primary hover:text-primary-dark underline">
              Quên mật khẩu?
            </button>
          </div>

          <div className="mt-4 text-center text-xs text-text-light">
            <p>Sử dụng tài khoản được cấp bởi Quản trị viên</p>
          </div>
        </div>

        <p className="text-center text-white/60 text-xs mt-6">
          © 2026 Trường Đại học Sư phạm Hà Nội 2. Hệ thống Quản lý KPI.
        </p>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForgotModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold text-text-dark">Quên mật khẩu</h2>
              <button onClick={() => setShowForgotModal(false)} className="p-1 text-text-light hover:text-text-dark rounded-lg"><X size={20} /></button>
            </div>
            {forgotMessage ? (
              <div className={`p-4 rounded-lg text-sm ${forgotMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {forgotMessage.text}
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setForgotLoading(true);
                setForgotMessage(null);
                await new Promise(r => setTimeout(r, 500));
                const found = (usersData as { id: string; email: string }[]).find(u => u.email === forgotEmail);
                if (found) {
                  setForgotMessage({ type: 'success', text: 'Vui lòng liên hệ quản trị viên để cấp lại mật khẩu' });
                } else {
                  setForgotMessage({ type: 'error', text: 'Email không tồn tại trong hệ thống' });
                }
                setForgotLoading(false);
              }} className="space-y-4">
                <p className="text-sm text-text-light">Nhập email đã đăng ký để yêu cầu cấp lại mật khẩu.</p>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" size={16} />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      placeholder="nhap@email.com" required />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading}
                  className="w-full py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-dark disabled:opacity-50">
                  {forgotLoading ? 'Đang xử lý...' : 'Yêu cầu cấp lại mật khẩu'}
                </button>
              </form>
            )}
            {forgotMessage && (
              <button onClick={() => setShowForgotModal(false)}
                className="mt-4 w-full py-2.5 border border-border text-text-dark rounded-lg font-medium text-sm hover:bg-bg-cream">
                Đóng
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 size={24} className="animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
