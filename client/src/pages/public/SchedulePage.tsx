import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Filter, Calendar, Users, Clock, AlertCircle } from 'lucide-react';
import { slotService } from '../../services/slotService';
import { trainerService } from '../../services/trainerService';
import { Slot, Booking, Trainer } from '../../types';
import { DatePickerStrip } from '../../components/booking/DatePickerStrip';
import { SlotCard } from '../../components/booking/SlotCard';
import { BookingDrawer } from '../../components/booking/BookingDrawer';
import { BookingSuccessModal } from '../../components/booking/BookingSuccessModal';

export const SchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedTrainer, setSelectedTrainer] = useState<string>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING'>('ALL');

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Fetch slots for selected date
  const { data: slots = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => slotService.getSlots({ date: selectedDate }),
  });

  // Fetch trainers
  const { data: trainers = [] } = useQuery({
    queryKey: ['trainers'],
    queryFn: () => trainerService.getAll(),
  });

  // Filter slots
  const filteredSlots = slots.filter((slot) => {
    // Trainer filter
    if (selectedTrainer !== 'ALL') {
      const trainerId = typeof slot.trainerId === 'object' ? slot.trainerId._id : slot.trainerId;
      if (trainerId !== selectedTrainer) return false;
    }

    // Time of day filter
    const hour = parseInt(slot.startTime.split(':')[0], 10);
    if (timeFilter === 'MORNING' && (hour < 5 || hour >= 12)) return false;
    if (timeFilter === 'AFTERNOON' && (hour < 12 || hour >= 17)) return false;
    if (timeFilter === 'EVENING' && hour < 17) return false;

    return true;
  });

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const fullCount = slots.filter((s) => s.status === 'FULL').length;
  const lockedCount = slots.filter((s) => s.status === 'LOCKED').length;

  const handleOpenBook = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsDrawerOpen(true);
  };

  const handleSuccess = (booking: Booking) => {
    setIsDrawerOpen(false);
    setConfirmedBooking(booking);
    refetch();
  };

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] text-xs font-bold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
            LIVE SLOT RESERVATION
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
            TRAINING <span className="text-[#CCFF00]">SCHEDULE</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-2xl">
            Select your training date and reserve an available platform with your preferred coach. Capacity is locked server-side to guarantee zero overcrowding.
          </p>
        </div>

        {/* 14-Day Date Selector */}
        <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] mb-8 shadow-xl">
          <DatePickerStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {/* Filters & Status HUD */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 p-4 rounded-2xl bg-[#0E0E0E] border border-[#1E1E1E]">
          
          {/* Trainer Filter */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 lg:pb-0">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#CCFF00]" /> Coach:
            </span>
            <button
              onClick={() => setSelectedTrainer('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                selectedTrainer === 'ALL'
                  ? 'bg-[#CCFF00] text-black shadow-[0_0_10px_#CCFF00]'
                  : 'bg-[#181818] text-zinc-400 hover:text-white'
              }`}
            >
              All Coaches
            </button>
            {trainers.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelectedTrainer(t._id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
                  selectedTrainer === t._id
                    ? 'bg-[#CCFF00] text-black shadow-[0_0_10px_#CCFF00]'
                    : 'bg-[#181818] text-zinc-400 hover:text-white'
                }`}
              >
                {t.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Time of Day Filter & Slot Counters */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1.5 bg-[#161616] p-1 rounded-xl border border-white/5 text-xs font-semibold">
              {(['ALL', 'MORNING', 'AFTERNOON', 'EVENING'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTimeFilter(mode)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    timeFilter === mode ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {mode === 'ALL' ? 'All Day' : mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Quick Status Count Badge */}
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-400">{availableCount} Available</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">{fullCount} Full</span>
              {lockedCount > 0 && (
                <>
                  <span className="text-zinc-500">•</span>
                  <span className="text-purple-400">{lockedCount} Locked</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Slot Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-[#121212] animate-pulse border border-[#222222]" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center rounded-3xl bg-[#121212] border border-red-500/20 text-red-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <div className="font-bold">Failed to load training schedule</div>
            <div className="text-xs text-zinc-400 mt-1">Please try refreshing or select another date.</div>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[#121212] border border-[#222222]">
            <Clock className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white uppercase">No Sessions Match Your Filter</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Try selecting "All Coaches" or "All Day" to see other slots scheduled for this date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSlots.map((slot) => (
              <SlotCard key={slot._id} slot={slot} onBook={handleOpenBook} />
            ))}
          </div>
        )}

      </div>

      {/* Booking Drawer & Confirmation Modal */}
      <BookingDrawer
        slot={selectedSlot}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={handleSuccess}
      />

      <BookingSuccessModal
        booking={confirmedBooking}
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
      />
    </div>
  );
};
