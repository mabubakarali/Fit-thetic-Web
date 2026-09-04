import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { slotService } from '../../services/slotService';
import { Slot, Trainer } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Fetch admin metrics HUD
  const { data: metricsData, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['adminMetrics'],
    queryFn: () => adminService.getMetrics(),
    refetchInterval: 10000, // Refresh every 10 seconds for real-time operations
  });

  // Fetch today's slots
  const { data: todaySlots = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ['slots', todayStr],
    queryFn: () => slotService.getSlots({ date: todayStr }),
  });

  // Lock/Unlock mutation
  const lockMutation = useMutation({
    mutationFn: ({ slotId, isLocked }: { slotId: string; isLocked: boolean }) =>
      slotService.lockSlot(slotId, isLocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
  });

  const metrics = metricsData?.metrics || {
    todayBookings: 0,
    availableSlots: 0,
    fullSlots: 0,
    lockedSlots: 0,
    activeMembers: 0,
  };

  const handleToggleLock = (slot: Slot) => {
    lockMutation.mutate({ slotId: slot._id, isLocked: !slot.isLocked });
  };

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            OPERATIONS CONTROL CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1">
            TODAY'S <span className="text-[#CCFF00]">OVERVIEW</span>
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-0.5">
            Live facility state for {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/slots">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Slot
            </Button>
          </Link>
          <Link to="/admin/bookings">
            <Button variant="secondary" size="sm" leftIcon={<BookOpen className="w-4 h-4 text-[#CCFF00]" />}>
              Add Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. OPERATIONAL HUD KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Today's Bookings */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222]">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Today's Bookings</span>
            <BookOpen className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {metrics.todayBookings}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Confirmed Athletes</div>
        </div>

        {/* Available Slots */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222]">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Available Slots</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">
            {metrics.availableSlots}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Open for Booking</div>
        </div>

        {/* Full Slots */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222]">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Full Slots</span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-zinc-300">
            {metrics.fullSlots}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Max Capacity</div>
        </div>

        {/* Locked Slots */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222]">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Locked Slots</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-purple-400">
            {metrics.lockedSlots}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Admin Reserved</div>
        </div>

        {/* Active Members */}
        <div className="p-5 rounded-2xl bg-[#111111] border border-[#222222] col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Active Members</span>
            <Users className="w-4 h-4 text-[#CCFF00]" />
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white">
            {metrics.activeMembers}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">Registered Athletes</div>
        </div>

      </div>

      {/* 2. TODAY'S SCHEDULE TIMELINE & RECENT BOOKINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's Schedule Timeline (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111111] border border-[#222222] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#CCFF00]" />
              TODAY'S SCHEDULE TIMELINE
            </h3>
            <Link to="/admin/schedule" className="text-xs font-bold text-[#CCFF00] hover:underline">
              Full Schedule View →
            </Link>
          </div>

          {isLoadingSlots ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-[#161616] animate-pulse" />
              ))}
            </div>
          ) : todaySlots.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No slots created for today yet.{' '}
              <Link to="/admin/slots" className="text-[#CCFF00] underline">
                Create new slots
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySlots.map((slot) => {
                const trainer = typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
                return (
                  <div
                    key={slot._id}
                    className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-black text-white font-mono min-w-[110px]">
                        {slot.startTime} — {slot.endTime}
                      </div>

                      <div className="h-8 w-px bg-white/10 hidden sm:block" />

                      <div className="flex items-center gap-2.5">
                        <img
                          src={trainer?.profileImage || '/assets/trainer_ahmed.jpg'}
                          alt={trainer?.name || 'Coach'}
                          className="w-7 h-7 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{trainer?.name || 'Coach'}</div>
                          <div className="text-[10px] text-zinc-400">
                            {slot.currentBookings} / {slot.capacity} booked
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <Badge status={slot.status} spotsLeft={slot.spotsAvailable} />

                      <Button
                        variant={slot.isLocked ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleLock(slot)}
                        isLoading={lockMutation.isPending}
                        leftIcon={slot.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      >
                        {slot.isLocked ? 'Unlock' : 'Lock'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Bookings Live Stream (1 Col) */}
        <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] space-y-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#CCFF00]" />
            RECENT ACTIVITY
          </h3>

          {metricsData?.recentBookings && metricsData.recentBookings.length > 0 ? (
            <div className="space-y-3 text-xs">
              {metricsData.recentBookings.map((b) => {
                const customerUser = typeof b.customerId === 'object' ? (b.customerId as any)?.userId : null;
                const slot = b.slotId;
                return (
                  <div key={b._id} className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{customerUser?.name || 'Athlete'}</span>
                      <span className="font-mono text-[10px] text-[#CCFF00]">{b.bookingReference}</span>
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      {slot?.date} • {slot?.startTime}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      Booked {b.bookedAt ? format(new Date(b.bookedAt), 'p, MMM d') : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No recent bookings.
            </div>
          )}

          <Link to="/admin/bookings" className="block pt-2">
            <Button variant="secondary" size="sm" className="w-full justify-center">
              View All Bookings
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
};
