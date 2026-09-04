import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Shield,
  Zap,
  Flame,
  Award,
  ChevronDown,
  Sparkles,
  Layers,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { format } from 'date-fns';
import { BRAND } from '../../config/brand';
import { slotService } from '../../services/slotService';
import { trainerService } from '../../services/trainerService';
import { Slot, Booking } from '../../types';
import { Button } from '../../components/common/Button';
import { Scrollytelling } from '../../components/scrollytelling/Scrollytelling';
import { SlotCard } from '../../components/booking/SlotCard';
import { BookingDrawer } from '../../components/booking/BookingDrawer';
import { BookingSuccessModal } from '../../components/booking/BookingSuccessModal';

export const HomePage: React.FC = () => {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Query today's slots for live homepage preview
  const { data: todaySlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['slots', todayStr],
    queryFn: () => slotService.getSlots({ date: todayStr }),
  });

  // Query trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainerService.getAll(),
  });

  const handleOpenBook = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsDrawerOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setIsDrawerOpen(false);
    setConfirmedBooking(booking);
  };

  return (
    <div className="relative bg-[#080808]">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
        {/* Full-bleed Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/hero_gym.jpg"
            alt="FORGE Performance Gym"
            className="w-full h-full object-cover object-center scale-105 transform animate-pulse-subtle"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/75 to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#080808]/60 to-[#080808]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Top Live Ticker Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#161616]/90 border border-white/15 backdrop-blur-md mb-8 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
              LIVE TRAINING SCHEDULE ACTIVE
            </span>
            <span className="text-[#CCFF00] font-mono text-xs font-black">
              • {todaySlots.filter((s) => s.status === 'AVAILABLE').length} SLOTS OPEN TODAY
            </span>
          </div>

          {/* Massive Bold Athletic Typography */}
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black uppercase tracking-tighter text-white max-w-5xl leading-[0.9] text-glow">
            TRAIN WITHOUT <br />
            <span className="text-[#CCFF00]">LIMITS.</span>
          </h1>

          <p className="mt-8 text-lg sm:text-2xl text-zinc-300 max-w-2xl font-medium tracking-wide">
            {BRAND.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link to="/schedule" className="w-full sm:w-auto">
              <Button size="xl" className="w-full justify-center" rightIcon={<ArrowRight className="w-5 h-5" />}>
                BOOK A SLOT
              </Button>
            </Link>
            <a href="#scrolly-section" className="w-full sm:w-auto">
              <Button variant="secondary" size="xl" className="w-full justify-center">
                EXPLORE GYM
              </Button>
            </a>
          </div>

          {/* Subtle Scroll Cue */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest pointer-events-none">
            <span>SCROLL TO EXPERIENCE</span>
            <ChevronDown className="w-4 h-4 text-[#CCFF00] animate-bounce" />
          </div>
        </div>
      </section>

      {/* 2. SCROLLYTELLING EXPERIENCE ("YOUR SESSION. YOUR TIME.") */}
      <div id="scrolly-section">
        <Scrollytelling />
      </div>

      {/* 3. "HOW IT WORKS" 3-STEP SECTION */}
      <section className="py-24 bg-[#0B0B0B] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-4">
              THE WORKFLOW
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              THREE STEPS TO <span className="text-[#CCFF00]">PERFORMANCE</span>
            </h2>
            <p className="text-zinc-400 text-base mt-2">
              Simple, guaranteed slot reservation designed to eliminate friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#121212] border border-[#222222] hover:border-[#CCFF00]/40 transition-all group relative">
              <div className="text-5xl font-black text-white/10 group-hover:text-[#CCFF00]/20 transition-colors mb-4">
                01
              </div>
              <h3 className="text-xl font-bold uppercase text-white mb-2">CHOOSE YOUR TIME</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Find a slot that fits your schedule across morning, afternoon, or evening sessions with live capacity visibility.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#121212] border border-[#222222] hover:border-[#CCFF00]/40 transition-all group relative">
              <div className="text-5xl font-black text-white/10 group-hover:text-[#CCFF00]/20 transition-colors mb-4">
                02
              </div>
              <h3 className="text-xl font-bold uppercase text-white mb-2">BOOK YOUR SESSION</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Reserve your spot in seconds with our atomic booking engine. Receive your instant ticket and add to your calendar.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#121212] border border-[#222222] hover:border-[#CCFF00]/40 transition-all group relative">
              <div className="text-5xl font-black text-white/10 group-hover:text-[#CCFF00]/20 transition-colors mb-4">
                03
              </div>
              <h3 className="text-xl font-bold uppercase text-white mb-2">SHOW UP & TRAIN</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Walk in knowing your lifting platform, equipment, and coach are 100% prepared for you. No overcrowding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TODAY'S LIVE SCHEDULE PREVIEW */}
      <section className="py-24 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                TODAY'S SCHEDULE
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                RESERVE TODAY'S <span className="text-[#CCFF00]">SLOTS</span>
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Real-time database-backed availability for {format(new Date(), 'EEEE, MMMM d')}
              </p>
            </div>

            <Link to="/schedule">
              <Button variant="secondary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View Full 14-Day Calendar
              </Button>
            </Link>
          </div>

          {/* Slots Grid */}
          {isLoadingSlots ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-[#121212] animate-pulse border border-[#222222]" />
              ))}
            </div>
          ) : todaySlots.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#121212] border border-[#222222] text-zinc-400">
              No slots scheduled for today. Check the upcoming calendar!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {todaySlots.slice(0, 8).map((slot) => (
                <SlotCard key={slot._id} slot={slot} onBook={handleOpenBook} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. MASTER COACHES SHOWCASE */}
      <section className="py-24 bg-[#0C0C0C] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
              THE ROSTER
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              MASTER <span className="text-[#CCFF00]">COACHES</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              World-class strength, conditioning, and mobility specialists driving every session.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trainers.map((trainer) => (
              <div
                key={trainer._id}
                className="group rounded-3xl bg-[#121212] border border-[#222222] overflow-hidden hover:border-[#CCFF00]/40 transition-all flex flex-col justify-between"
              >
                <div className="h-80 relative overflow-hidden bg-[#181818]">
                  <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-[#CCFF00]">
                    ACTIVE COACH
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#CCFF00] transition-colors">
                      {trainer.name}
                    </h3>
                    <div className="text-xs font-semibold text-zinc-400 mb-3">{trainer.position}</div>
                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                      {trainer.bio}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {trainer.specialization.slice(0, 3).map((spec, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-[#1B1B1B] text-[10px] font-medium text-zinc-300 border border-white/5"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link to="/schedule">
                    <Button variant="outline" size="sm" className="w-full justify-center">
                      Book Session with {trainer.name.split(' ')[0]}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. MEMBERSHIP TIERS PREVIEW */}
      <section className="py-24 bg-[#080808] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
              MEMBERSHIP TIERS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              CHOOSE YOUR <span className="text-[#CCFF00]">COMMITMENT</span>
            </h2>
            <p className="text-zinc-400 text-sm mt-2">
              Transparent access to high-performance facilities and master coaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Day Pass */}
            <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">SINGLE ENTRY</div>
                <h3 className="text-2xl font-black text-white">DAY PASS</h3>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">$35</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest ml-1">/ SESSION</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-400 mb-8">
                  <li className="flex items-center gap-2">✓ 1 Scheduled Training Slot</li>
                  <li className="flex items-center gap-2">✓ Full Facility & Equipment Access</li>
                  <li className="flex items-center gap-2">✓ Master Coach Form Guidance</li>
                  <li className="flex items-center gap-2">✓ Towel & Locker Service</li>
                </ul>
              </div>
              <Link to="/schedule">
                <Button variant="outline" className="w-full justify-center">
                  Book Single Slot
                </Button>
              </Link>
            </div>

            {/* Performance - Featured */}
            <div className="p-8 rounded-3xl bg-[#141414] border-2 border-[#CCFF00] shadow-[0_0_30px_rgba(204,255,0,0.15)] flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest">
                MOST POPULAR
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#CCFF00] mb-2">UNLIMITED ACCESS</div>
                <h3 className="text-2xl font-black text-white">PERFORMANCE</h3>
                <div className="my-6">
                  <span className="text-4xl font-black text-[#CCFF00]">$185</span>
                  <span className="text-xs text-zinc-400 uppercase tracking-widest ml-1">/ MONTH</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-300 mb-8">
                  <li className="flex items-center gap-2 font-semibold text-white">✓ Unlimited Slot Reservations</li>
                  <li className="flex items-center gap-2">✓ 14-Day Advance Booking Window</li>
                  <li className="flex items-center gap-2">✓ Full Recovery Suite Access (Sauna/Ice Bath)</li>
                  <li className="flex items-center gap-2">✓ Bi-Weekly Body Composition & InBody</li>
                </ul>
              </div>
              <Link to="/register">
                <Button variant="primary" className="w-full justify-center font-bold">
                  Start Performance Tier
                </Button>
              </Link>
            </div>

            {/* Black Tier */}
            <div className="p-8 rounded-3xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">ELITE CONCIERGE</div>
                <h3 className="text-2xl font-black text-white">BLACK TIER</h3>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">$320</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-widest ml-1">/ MONTH</span>
                </div>
                <ul className="space-y-3 text-xs text-zinc-400 mb-8">
                  <li className="flex items-center gap-2 font-semibold text-white">✓ Priority Slot Lock Rights</li>
                  <li className="flex items-center gap-2">✓ 4 1-on-1 Master Coach Sessions / mo</li>
                  <li className="flex items-center gap-2">✓ Private Locker & Custom Apparel Kit</li>
                  <li className="flex items-center gap-2">✓ Unlimited Guest Passes</li>
                </ul>
              </div>
              <Link to="/contact">
                <Button variant="outline" className="w-full justify-center">
                  Inquire Concierge
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Drawer & Confirmation Modal */}
      <BookingDrawer
        slot={selectedSlot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={handleBookingSuccess}
      />

      <BookingSuccessModal
        booking={confirmedBooking}
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
};
