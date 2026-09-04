import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const MembershipPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
            TIERS & PRICING
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            PERFORMANCE <span className="text-[#CCFF00]">MEMBERSHIPS</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Engineered for high-performing individuals. No hidden lock-ins. Guaranteed slot reservation rights.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Day Pass */}
          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">SINGLE ENTRY</div>
              <h3 className="text-2xl font-black text-white">DAY PASS</h3>
              <p className="text-xs text-zinc-400 mt-1">Ideal for traveling athletes & drop-ins.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white">$35</span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest ml-1">/ SESSION</span>
              </div>
              <ul className="space-y-3.5 text-xs text-zinc-300 mb-8 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> 1 Scheduled Training Slot
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Full Facility & Equipment Access
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> On-floor Coach Form Guidance
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Premium Towel & Shower Amenities
                </li>
              </ul>
            </div>
            <Link to="/schedule">
              <Button variant="outline" className="w-full justify-center">
                Book Single Slot
              </Button>
            </Link>
          </div>

          {/* Performance */}
          <div className="p-8 rounded-3xl bg-[#141414] border-2 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.15)] flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest">
              MOST POPULAR
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-2">UNLIMITED ACCESS</div>
              <h3 className="text-2xl font-black text-white">PERFORMANCE</h3>
              <p className="text-xs text-zinc-400 mt-1">For athletes training 4–6 times weekly.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-[#CCFF00]">$185</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest ml-1">/ MONTH</span>
              </div>
              <ul className="space-y-3.5 text-xs text-zinc-200 mb-8 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Unlimited Slot Reservations
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> 14-Day Advance Booking Window
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Full Recovery Suite (Ice Bath & Sauna)
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Monthly InBody Biometric Scans
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> 2 Free Guest Passes / Month
                </li>
              </ul>
            </div>
            <Link to="/register">
              <Button variant="primary" size="lg" className="w-full justify-center font-bold">
                Join Performance Tier
              </Button>
            </Link>
          </div>

          {/* Black Tier */}
          <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">ELITE CONCIERGE</div>
              <h3 className="text-2xl font-black text-white">BLACK TIER</h3>
              <p className="text-xs text-zinc-400 mt-1">The apex private training & recovery tier.</p>
              <div className="my-6">
                <span className="text-4xl font-black text-white">$320</span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest ml-1">/ MONTH</span>
              </div>
              <ul className="space-y-3.5 text-xs text-zinc-300 mb-8 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Priority Slot Lock Guarantee
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> 4 1-on-1 Master Coach Sessions / mo
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Private Permanent Locker & Laundry
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> Unlimited Guest Passes
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#CCFF00]" /> FORGE Custom Performance Kit
                </li>
              </ul>
            </div>
            <Link to="/contact">
              <Button variant="outline" className="w-full justify-center">
                Inquire Concierge
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto pt-12 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-3">
            <HelpCircle className="w-4 h-4" /> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase mb-8">
            EVERYTHING YOU NEED TO KNOW
          </h2>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
              <h4 className="font-bold text-white mb-2">How does slot booking work?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We cap each 60-minute training block to a maximum of 12 athletes. This guarantees you always have immediate access to calibrated power racks, barbells, and free weights without waiting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
              <h4 className="font-bold text-white mb-2">What is the cancellation policy?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                You can cancel any confirmed slot up to 2 hours before the start time with zero penalty. The spot is automatically returned to the public schedule for other members.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#111111] border border-[#222222]">
              <h4 className="font-bold text-white mb-2">Can I drop in with a Day Pass?</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Yes. Day Pass athletes can book any available slot directly from our schedule page. Once booked, you receive your reference ticket and full access.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
