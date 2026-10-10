import React from 'react';
import { Menu, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Multi-Tenant JWT Authenticated Session</span>
        </div>
      </div>

      {/* Right: User Profile & Logout */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-semibold text-xs flex items-center justify-center border border-sky-200">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          leftIcon={<LogOut className="w-3.5 h-3.5 text-slate-500" />}
          className="text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
        >
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};
