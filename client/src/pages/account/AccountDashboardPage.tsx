import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, isFuture, isPast } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Download,
  XCircle,
  Plus,
  AlertTriangle,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { Booking, Trainer } from '../../types';
import { BRAND } from '../../config/brand';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AccountDashboardPage: React.FC = () => {
  const { user, customer } = useAuth();
  const queryClient = useQueryClient();
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch customer's personal bookings
  const { data: bookingResponse, isLoading } = useQuery({
    queryKey: ['myBookings', user?.id],
    queryFn: () => bookingService.getBookings({ userId: user?.id, limit: 50 }),
    enabled: Boolean(user?.id),
  });

  const bookings: Booking[] = bookingResponse?.data || [];

  // Filter upcoming active vs past/cancelled
  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const pastOrCancelledBookings = bookings.filter((b) => b.status !== 'CONFIRMED');

  // Next session is earliest active booking
  const nextSession = activeBookings.length > 0 ? activeBookings[0] : null;

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      bookingService.cancelBooking(bookingId, reason),
    onSuccess: () => {
      setCancellingBookingId(null);
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
    onError: (err: any) => {
      setCancelError(err?.response?.data?.error?.message || err.message || 'Failed to cancel session');
    },
  });

  const handleCancelClick = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setCancelError(null);
  };

  const handleConfirmCancel = (bookingId: string) => {
    cancelMutation.mutate({ bookingId, reason: 'Customer requested via account portal' });
  };

  const nextSlot = nextSession?.slotId;
  const nextTrainer = nextSlot && typeof nextSlot.trainerId === 'object' ? (nextSlot.trainerId as Trainer) : null;

  return (
    <div className="min-h-screen bg-[#080808] pt-28 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
          <div>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              ATHLETE ACCOUNT
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mt-1">
              WELCOME BACK, <span className="text-[#CCFF00]">{user?.name || 'ATHLETE'}</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Member ID: <span className="font-mono text-zinc-300">FORGE-{user?.id.slice(-6).toUpperCase()}</span>
            </p>
          </div>

          <Link to="/schedule">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Reserve Next Slot
            </Button>
          </Link>
        </div>

        {/* Global Error Banner */}
        {cancelError && (
          <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Cancellation Prohibited</div>
              <div className="text-xs text-red-300/90 mt-0.5">{cancelError}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Left Column (2 Cols): Next Session & Upcoming Bookings */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* NEXT SESSION HERO CARD */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#161616] to-[#0E0E0E] border-2 border-[#CCFF00]/40 shadow-[0_0_30px_rgba(204,255,0,0.1)] relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                  UPCOMING SESSION
                </div>
                {nextSession && (
                  <span className="font-mono text-xs text-zinc-400">
                    Ref: <strong className="text-white">{nextSession.bookingReference}</strong>
                  </span>
                )}
              </div>

              {nextSession && nextSlot ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-zinc-400 font-semibold uppercase">Date & Day</div>
                      <div className="text-2xl font-black text-white">
                        {format(new Date(nextSlot.date), 'EEEE, MMM d')}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-zinc-400 font-semibold uppercase">Session Time</div>
                      <div className="text-2xl font-black text-[#CCFF00]">
                        {nextSlot.startTime} — {nextSlot.endTime}
                      </div>
                    </div>
                  </div>

                  {nextTrainer && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                      <img
                        src={nextTrainer.profileImage}
                        alt={nextTrainer.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/20"
                      />
                      <div>
                        <div className="text-xs text-zinc-400 uppercase font-semibold">Assigned Lead Coach</div>
                        <div className="text-base font-bold text-white">{nextTrainer.name}</div>
                        <div className="text-xs text-zinc-400">{nextTrainer.position}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    {cancellingBookingId === nextSession._id ? (
                      <div className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
                        <div className="text-xs text-red-300 font-bold">
                          Are you sure you want to cancel this booking? The spot will be returned to the public schedule.
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={cancelMutation.isPending}
                            onClick={() => handleConfirmCancel(nextSession._id)}
                          >
                            Yes, Cancel Session
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancellingBookingId(null)}
                          >
                            Keep Session
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleCancelClick(nextSession._id)}
                          leftIcon={<XCircle className="w-4 h-4" />}
                        >
                          Cancel Booking
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center space-y-4">
                  <Clock className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h3 className="text-xl font-bold text-white uppercase">No Active Sessions Booked</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Reserve your next training block to guarantee your lifting platform and coaching guidance.
                  </p>
                  <Link to="/schedule">
                    <Button variant="primary" size="md">
                      Browse Available Slots
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* UPCOMING SESSIONS LIST */}
            <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222]">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4 flex items-center justify-between">
                <span>All Confirmed Bookings ({activeBookings.length})</span>
              </h3>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((n) => (
                    <div key={n} className="h-20 rounded-2xl bg-[#181818] animate-pulse" />
                  ))}
                </div>
              ) : activeBookings.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No upcoming reservations.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map((b) => {
                    const slot = b.slotId;
                    const trainer = slot && typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
                    return (
                      <div
                        key={b._id}
                        className="p-4 rounded-2xl bg-[#161616] border border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 rounded-xl bg-[#222222] text-[#CCFF00]">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">
                              {slot?.date ? format(new Date(slot.date), 'EEE, MMM d, yyyy') : 'Scheduled'}
                            </div>
                            <div className="text-xs text-[#CCFF00] font-mono font-bold">
                              {slot?.startTime} — {slot?.endTime}
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              Coach: {trainer?.name || 'FORGE Staff'} • Ref: {b.bookingReference}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleCancelClick(b._id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PAST & CANCELLED BOOKINGS HISTORY */}
            <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222]">
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-4">
                Booking History
              </h3>

              {pastOrCancelledBookings.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No historical bookings yet.</div>
              ) : (
                <div className="space-y-2.5">
                  {pastOrCancelledBookings.map((b) => {
                    const slot = b.slotId;
                    return (
                      <div
                        key={b._id}
                        className="p-3.5 rounded-xl bg-[#141414] border border-[#202020] flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-white">
                            {slot?.date ? format(new Date(slot.date), 'MMM d, yyyy') : 'Session'}
                          </span>{' '}
                          <span className="text-zinc-500">• {slot?.startTime}</span>
                          <div className="text-[10px] text-zinc-500 font-mono">Ref: {b.bookingReference}</div>
                        </div>
                        <Badge status={b.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Membership Tier & Quick Support */}
          <div className="space-y-8">
            
            {/* Membership Tier Card */}
            <div className="p-6 rounded-3xl bg-[#121212] border border-[#222222] space-y-4">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                MEMBERSHIP STATUS
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-black text-white">
                    {customer?.activeMembershipId?.tier || 'PERFORMANCE'}
                  </h4>
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Member
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#181818] text-xs space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Completed Sessions:</span>
                  <strong className="text-white">{customer?.totalBookings || 0}</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Advance Booking Rights:</span>
                  <strong className="text-[#CCFF00]">14 Days</strong>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Recovery Suite Access:</span>
                  <strong className="text-white">Included</strong>
                </div>
              </div>
            </div>

            {/* Concierge Help Box */}
            <div className="p-6 rounded-3xl bg-[#111111] border border-[#222222] space-y-3 text-xs text-zinc-400">
              <div className="font-bold text-white uppercase text-sm">Need Assistance?</div>
              <p>
                To reschedule within the 2-hour window or request private 1-on-1 coaching, contact the concierge desk.
              </p>
              <div className="pt-2 font-mono text-zinc-300">
                Direct: {BRAND.contact.phone}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
