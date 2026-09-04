import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Lock, Unlock, Users, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { slotService } from '../../services/slotService';
import { bookingService } from '../../services/bookingService';
import { Slot, Trainer, Booking } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminSchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotBookings, setSlotBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const queryClient = useQueryClient();

  // Fetch slots for date
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['slots', currentDate],
    queryFn: () => slotService.getSlots({ date: currentDate }),
  });

  // Lock mutation
  const lockMutation = useMutation({
    mutationFn: ({ slotId, isLocked }: { slotId: string; isLocked: boolean }) =>
      slotService.lockSlot(slotId, isLocked),
    onSuccess: (updatedSlot) => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      if (selectedSlot?._id === updatedSlot._id) {
        setSelectedSlot(updatedSlot);
      }
    },
  });

  const handleInspectSlot = async (slot: Slot) => {
    setSelectedSlot(slot);
    setIsLoadingBookings(true);
    try {
      const res = await bookingService.getBookings({ slotId: slot._id });
      setSlotBookings(res.data);
    } catch {
      setSlotBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const changeDateBy = (days: number) => {
    const next = addDays(new Date(currentDate), days);
    setCurrentDate(format(next, 'yyyy-MM-dd'));
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            CALENDAR & TIMELINE
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            SCHEDULE <span className="text-[#CCFF00]">OPERATIONS</span>
          </h1>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-[#141414] border border-[#262626] p-1.5 rounded-2xl">
          <button
            onClick={() => changeDateBy(-1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="px-4 text-xs font-bold text-white text-center">
            {format(new Date(currentDate), 'EEEE, MMM d, yyyy')}
          </div>

          <button
            onClick={() => changeDateBy(1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Schedule Grid & Drawer Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Schedule Slots Timeline (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-20 rounded-2xl bg-[#141414] animate-pulse border border-[#222222]" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#111111] border border-[#222222] text-zinc-400">
              No sessions scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot) => {
                const trainer = typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
                const isSelected = selectedSlot?._id === slot._id;

                return (
                  <div
                    key={slot._id}
                    onClick={() => handleInspectSlot(slot)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#181818] border-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.15)]'
                        : 'bg-[#111111] border-[#222222] hover:border-zinc-600 hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#1C1C1C] text-[#CCFF00] font-mono font-black text-base min-w-[75px] text-center">
                        {slot.startTime}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <img
                            src={trainer?.profileImage || '/assets/trainer_ahmed.jpg'}
                            alt={trainer?.name || 'Coach'}
                            className="w-6 h-6 rounded-full object-cover border border-white/20"
                          />
                          <span className="font-bold text-white text-sm">
                            {trainer?.name || 'Coach'}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          Capacity: <strong className="text-white">{slot.currentBookings}</strong> / {slot.capacity} spots booked
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <Badge status={slot.status} spotsLeft={slot.spotsAvailable} />
                      <span className="text-xs font-bold text-[#CCFF00] hidden sm:inline">
                        Inspect →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Slot Inspector Panel (1 Col) */}
        <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] h-fit sticky top-8 space-y-6">
          {selectedSlot ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-widest text-[#CCFF00]">
                  SLOT INSPECTOR
                </div>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="p-1.5 rounded-full bg-[#181818] text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-zinc-500 font-bold uppercase">Time Window</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {selectedSlot.startTime} — {selectedSlot.endTime}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#161616] border border-[#262626]">
                  <div>
                    <div className="text-xs text-zinc-400 font-semibold">Current State</div>
                    <div className="font-bold text-white text-sm">
                      {selectedSlot.currentBookings} / {selectedSlot.capacity} Confirmed
                    </div>
                  </div>
                  <Badge status={selectedSlot.status} spotsLeft={selectedSlot.spotsAvailable} />
                </div>

                {/* Quick Lock / Unlock Action */}
                <Button
                  variant={selectedSlot.isLocked ? 'primary' : 'outline'}
                  size="md"
                  onClick={() =>
                    lockMutation.mutate({
                      slotId: selectedSlot._id,
                      isLocked: !selectedSlot.isLocked,
                    })
                  }
                  isLoading={lockMutation.isPending}
                  className="w-full justify-center"
                  leftIcon={selectedSlot.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                >
                  {selectedSlot.isLocked ? 'Unlock This Slot' : 'Lock Slot to Prevent Bookings'}
                </Button>

                {/* Booked Customers List */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-between">
                    <span>Booked Athletes ({slotBookings.length})</span>
                    <Users className="w-3.5 h-3.5 text-[#CCFF00]" />
                  </div>

                  {isLoadingBookings ? (
                    <div className="text-xs text-zinc-500 py-4 text-center">Loading athletes...</div>
                  ) : slotBookings.length === 0 ? (
                    <div className="text-xs text-zinc-500 py-4 text-center">No athletes booked yet.</div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {slotBookings.map((b) => {
                        const custUser = typeof b.customerId === 'object' ? (b.customerId as any)?.userId : null;
                        return (
                          <div
                            key={b._id}
                            className="p-3 rounded-xl bg-[#161616] border border-[#262626] flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-white">{custUser?.name || 'Athlete'}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">{b.bookingReference}</div>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-bold">CONFIRMED</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-zinc-500 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-zinc-600" />
              <div className="text-xs font-bold uppercase">Click Any Slot to Inspect</div>
              <div className="text-[11px] text-zinc-600">
                View booked athletes, toggle lock status, or manage capacity.
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
