'use client';

import { Bell, Search, User, ChevronDown, Menu, LogOut, Settings as SettingsIcon, Repeat, Shield, Users, CheckCircle, Building, FileText, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import usersData from '@/data/users.json';
import rolesData from '@/data/roles.json';
import userRolesData from '@/data/user-roles.json';

const roleNameById: Record<string, string> = {};
(rolesData as { id: string; name: string }[]).forEach((r) => { roleNameById[r.id] = r.name; });

const roleByUserId: Record<string, string> = {};
(userRolesData as { userId: string; roleId: string }[]).forEach((ur) => { roleByUserId[ur.userId] = ur.roleId; });

const demoAccounts = [
  { username: 'admin', label: 'Quản trị viên', icon: Shield, color: '#f44336' },
  { username: 'bgh01', label: 'Ban Giám hiệu', icon: Users, color: '#9c27b0' },
  { username: 'hdkpi01', label: 'Hội đồng KPI', icon: CheckCircle, color: '#2196f3' },
  { username: 'pdt01', label: 'Trưởng đơn vị', icon: Building, color: '#ff9800' },
  { username: 'cbkpi01', label: 'Cán bộ KPI', icon: FileText, color: '#4caf50' },
  { username: 'gvtoan', label: 'Nhân viên', icon: Users, color: '#607d8b' },
];

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [activeRoleLabel, setActiveRoleLabel] = useState('');
  const [showSwitch, setShowSwitch] = useState(false);
  const [switchLoading, setSwitchLoading] = useState('');

  useEffect(() => {
    const updateRole = () => {
      const role = localStorage.getItem('activeRole');
      const labels: Record<string, string> = {
        admin: 'Quản trị viên', board: 'Ban Giám hiệu', council: 'Hội đồng KPI',
        unit_manager: 'Trưởng đơn vị', kpi_staff: 'Cán bộ KPI', staff: 'Nhân viên',
      };
      setActiveRoleLabel(role ? labels[role] || role : '');
    };
    updateRole();
    window.addEventListener('roleChange', updateRole);
    return () => window.removeEventListener('roleChange', updateRole);
  }, []);

  const user = session?.user;
  const displayName = user?.name || '';
  const displayRole = activeRoleLabel || 'Người dùng';

  const currentUsername = user?.username || '';
  const switchableAccounts = demoAccounts
    .map((acc) => {
      const userRec = (usersData as any[]).find((u) => u.username === acc.username);
      const roleId = userRec ? roleByUserId[userRec.id] : undefined;
      const roleName = roleId ? roleNameById[roleId] : '';
      return { ...acc, userRec, roleName };
    });

  const handleSwitchAccount = async (acc: { username: string; roleName: string }) => {
    const userRec = (usersData as any[]).find((u) => u.username === acc.username);
    if (!userRec || !userRec.password) return;
    setSwitchLoading(acc.username);
    try {
      await signOut({ redirect: false });
      const result = await signIn('credentials', {
        username: userRec.username,
        password: userRec.password,
        redirect: false,
      });
      if (!result?.error) {
        localStorage.setItem('activeRole', acc.roleName || 'staff');
        setShowSwitch(false);
        setShowDropdown(false);
        window.dispatchEvent(new Event('roleChange'));
        window.location.assign('/');
      } else {
        setSwitchLoading('');
      }
    } catch {
      setSwitchLoading('');
    }
  };

  return (
    <header className="h-16 bg-primary flex items-center justify-between px-4 sm:px-6 shadow-sm fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={onToggleSidebar} className="p-2 text-white hover:bg-white/10 rounded-lg lg:hidden" aria-label="Mở menu">
          <Menu size={20} />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm KPI, đơn vị..."
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-white text-sm w-full sm:w-80 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative p-2 text-white hover:bg-white/10 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-red rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
              <User size={16} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-medium text-white">{displayRole}</div>
              <div className="text-xs text-white/70">{displayName}</div>
            </div>
            <ChevronDown size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-border py-2 z-50">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-dark truncate">{displayRole}</div>
                    {displayName && <div className="text-xs text-text-light truncate">{displayName}</div>}
                  </div>
                </div>
              </div>
              <div className="py-1">
                <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg-cream">
                  <SettingsIcon size={16} />
                  Cài đặt
                </Link>
                <button
                  onClick={() => { setShowSwitch(true); setShowDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-text-dark hover:bg-bg-cream w-full text-left"
                >
                  <Repeat size={16} />
                  Đổi tài khoản
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={async () => {
                    await signOut({ redirect: false });
                    localStorage.removeItem('activeRole');
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-accent-red hover:bg-bg-cream w-full text-left"
                >
                  <LogOut size={16} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showSwitch} onClose={() => setShowSwitch(false)} title="Đổi tài khoản (Demo)">        <p className="text-sm text-text-light mb-3">
          Chọn tài khoản để xem giao diện theo từng vai trò.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {switchableAccounts.map((acc) => {
            const Icon = acc.icon;
            const isCurrent = acc.username === currentUsername;
            return (
              <button
                key={acc.username}
                type="button"
                disabled={!!switchLoading}
                onClick={() => handleSwitchAccount(acc)}
                className="flex items-center gap-2 p-3 rounded-lg border border-border text-left hover:border-primary hover:bg-primary-light/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${acc.color}20` }}>
                  {switchLoading === acc.username ? <Loader2 size={16} className="animate-spin" style={{ color: acc.color }} /> : <Icon size={16} style={{ color: acc.color }} />}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-text-dark truncate">{acc.label}</div>
                  <div className="text-xs text-text-light truncate">{acc.username}{isCurrent ? ' · hiện tại' : ''}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>
    </header>
  );
}
