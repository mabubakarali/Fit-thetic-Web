import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  BookOpen,
  Users,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BRAND } from '../../config/brand';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);

  const navItems = [
    { name: 'Operations HUD', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Schedule View', path: '/admin/schedule', icon: Calendar },
    { name: 'Slot Manager', path: '/admin/slots', icon: Layers },
    { name: 'Bookings Registry', path: '/admin/bookings', icon: BookOpen },
    { name: 'Trainers & Staff', path: '/admin/trainers', icon: UserCheck },
    { name: 'Customer CRM', path: '/admin/customers', icon: Users },
    { name: 'Gym Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Trail', path: '/admin/audit-logs', icon: ShieldAlert },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0D0D0D] border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center font-black text-[#CCFF00]">
            F
          </div>
          <span className="font-black text-sm uppercase tracking-wider text-white">
            ADMIN CONTROL
          </span>
        </div>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg bg-[#141414] text-zinc-300"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B0B0B] border-r border-[#1C1C1C] flex flex-col justify-between p-5 z-40 transition-transform duration-300 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Gym Status */}
          <Link to="/" className="flex items-center gap-3 mb-8 px-2 group">
            <div className="w-9 h-9 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#CCFF00] transition-colors">
              <span className="font-black text-[#CCFF00] text-lg">F</span>
            </div>
            <div>
              <div className="font-black text-base tracking-wider text-white">FORGE OPS</div>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Owner Control Center
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#CCFF00] text-black shadow-[0_0_15px_rgba(204,255,0,0.25)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Badge & Logout */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="px-2 py-2 rounded-xl bg-[#121212] border border-[#202020] flex items-center justify-between">
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</div>
              <div className="text-[10px] text-zinc-400 truncate">{user?.email}</div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20">
              OWNER
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-white py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span>Public Site</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#CCFF00]" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 min-h-screen overflow-x-hidden p-4 sm:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};
