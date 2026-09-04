import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { BRAND } from '../../config/brand';
import { Button } from './Button';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 relative overflow-hidden">
      {/* Massive Top CTA Banner */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#050505] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
              SLOTS OPEN FOR TODAY
            </div>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
              READY TO <span className="text-[#CCFF00]">TRAIN?</span>
            </h2>
            <p className="text-zinc-400 mt-2 text-lg max-w-xl">
              Lock in your training slot. Show up. Leave nothing on the floor.
            </p>
          </div>
          <Link to="/schedule">
            <Button size="xl" rightIcon={<ArrowUpRight className="w-6 h-6" />}>
              RESERVE YOUR SLOT NOW
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-center">
                <span className="font-black text-[#CCFF00] text-lg">F</span>
              </div>
              <span className="font-black text-xl tracking-wider text-white">{BRAND.name}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{BRAND.description}</p>
            <div className="pt-2 text-xs text-zinc-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
              Guaranteed Spot Reservation System
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-4">Facility & Schedule</h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>
                <Link to="/schedule" className="hover:text-[#CCFF00] transition-colors">
                  Live Slot Booking
                </Link>
              </li>
              <li>
                <Link to="/trainers" className="hover:text-[#CCFF00] transition-colors">
                  Master Coaches
                </Link>
              </li>
              <li>
                <Link to="/membership" className="hover:text-[#CCFF00] transition-colors">
                  Membership Tiers
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#CCFF00] transition-colors">
                  Facility Specifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge & Hours */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-4">Operating Hours</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Monday – Friday</div>
                  <div className="text-xs text-zinc-500">06:00 AM – 11:00 PM</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Saturday – Sunday</div>
                  <div className="text-xs text-zinc-500">07:00 AM – 09:00 PM</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Location & Contact */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300 mb-4">Location & Concierge</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
                <span>{BRAND.contact.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span>{BRAND.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#CCFF00] shrink-0" />
                <span>{BRAND.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            © {new Date().getFullYear()} {BRAND.fullName}. All rights reserved. Built to Perform.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">
              Member Login
            </Link>
            <Link to="/admin" className="hover:text-[#CCFF00] transition-colors">
              Owner Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
