import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User as UserIcon, Shield, ChevronRight, LogOut } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Trainers', path: '/trainers' },
    { name: 'Membership', path: '/membership' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#080808]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center group-hover:border-[#CCFF00] transition-colors">
              <span className="font-black text-[#CCFF00] text-xl tracking-tighter">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider text-white group-hover:text-[#CCFF00] transition-colors">
                {BRAND.name}
              </span>
              <span className="text-[10px] tracking-[0.25em] text-zinc-500 font-semibold uppercase -mt-1">
                PERFORMANCE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-semibold tracking-wide transition-colors duration-150 relative py-1 ${
                    isActive ? 'text-[#CCFF00]' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CCFF00] rounded-full shadow-[0_0_8px_#CCFF00]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link to="/admin">
                    <Button variant="secondary" size="sm" leftIcon={<Shield className="w-4 h-4 text-[#CCFF00]" />}>
                      Admin Portal
                    </Button>
                  </Link>
                ) : (
                  <Link to="/account">
                    <Button variant="secondary" size="sm" leftIcon={<UserIcon className="w-4 h-4 text-[#CCFF00]" />}>
                      My Account
                    </Button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-zinc-400 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            <Link to="/schedule">
              <Button variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Book a Slot
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/schedule">
              <Button variant="primary" size="sm">
                Book
              </Button>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-[#141414] border border-[#222222] text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[73px] bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-zinc-800 py-6 px-6 shadow-2xl transition-all">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-zinc-300 hover:text-[#CCFF00] py-2 border-b border-white/5"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full justify-center">
                        Admin Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full justify-center">
                        My Bookings & Account
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" className="w-full justify-center" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    Sign In / Register
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
