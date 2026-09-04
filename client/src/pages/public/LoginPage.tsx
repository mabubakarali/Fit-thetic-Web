import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      // Redirect based on role
      navigate('/schedule');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-24 text-white">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-center group-hover:border-[#CCFF00] transition-colors">
              <span className="font-black text-[#CCFF00] text-2xl tracking-tighter">F</span>
            </div>
          </Link>
          <h2 className="text-3xl font-black uppercase tracking-tight">WELCOME BACK</h2>
          <p className="text-sm text-zinc-400 mt-1">Sign in to manage your training sessions and slot bookings.</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-3xl bg-[#111111] border border-[#242424] shadow-2xl space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00] text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00] text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center text-base mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              SIGN IN
            </Button>
          </form>

          {/* Quick Demo Fill Box for Evaluators */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center">
              One-Click Demo Credentials
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@forgegym.com', 'ForgeAdmin2026!')}
                className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#262626] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#CCFF00]">
                  <Shield className="w-3.5 h-3.5" /> Gym Owner
                </div>
                <div className="text-[10px] text-zinc-400 truncate">admin@forgegym.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('zayn@gmail.com', 'Customer123!')}
                className="p-2.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#262626] text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <User className="w-3.5 h-3.5 text-[#CCFF00]" /> Customer
                </div>
                <div className="text-[10px] text-zinc-400 truncate">zayn@gmail.com</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-400 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#CCFF00] font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
