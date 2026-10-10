import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Link as LinkIcon,
  Activity,
  FileCode2,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      to: '/patients',
      label: 'Patients',
      icon: <Users className="w-5 h-5" />,
    },
    {
      to: '/doctors',
      label: 'Doctor Directory',
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      to: '/assignments',
      label: 'Patient-Doctor Mapping',
      icon: <LinkIcon className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-200">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight">CarePulse</span>
                <span className="block text-[10px] font-semibold text-sky-600 tracking-wider uppercase">Portal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Management
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <a
            href="http://127.0.0.1:8000/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50/60 transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-sky-600" />
            <span>Interactive Swagger API</span>
          </a>
        </div>
      </aside>
    </>
  );
};
