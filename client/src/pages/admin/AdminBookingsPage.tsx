import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { BookOpen, Search, Filter, Plus, XCircle, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { slotService } from '../../services/slotService';
import { customerService } from '../../services/customerService';
import { Booking, Slot, Customer, Trainer } from '../../types';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { getErrorMessage } from '../../services/api';

export const AdminBookingsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Admin cancelled');

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch bookings list
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['adminBookings', statusFilter],
    queryFn: () => bookingService.getBookings({ status: statusFilter || undefined, limit: 100 }),
  });

  const bookings: Booking[] = bookingsData?.data || [];

  // Fetch active customers and slots for manual booking creator
  const { data: customersData } = useQuery({
    queryKey: ['adminCustomersList'],
    queryFn: () => customerService.getAll({ limit: 100 }),
    enabled: isManualModalOpen,
  });

  const { data: availableSlots = [] } = useQuery({
    queryKey: ['adminAvailableSlots'],
    queryFn: () => slotService.getSlots({ date: format(new Date(), 'yyyy-MM-dd') }),
    enabled: isManualModalOpen,
  });

  const customers: Customer[] = customersData?.data || [];

  // Manual booking form state
  const [manualData, setManualData] = useState({
    customerId: '',
    slotId: '',
  });

  // Manual booking mutation
  const manualBookingMutation = useMutation({
    mutationFn: (data: { customerId: string; slotId: string }) =>
      bookingService.createBooking(data),
    onSuccess: () => {
      setIsManualModalOpen(false);
      setFormError(null);
      setFormSuccess('Manual booking registered successfully');
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bookingService.cancelBooking(id, reason),
    onSuccess: () => {
      setCancellingBooking(null);
      setFormSuccess('Booking cancelled and spot restored');
      queryClient.invalidateQueries({ queryKey: ['adminBookings'] });
      queryClient.invalidateQueries({ queryKey: ['adminMetrics'] });
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  });

  // Client search filter
  const filteredBookings = bookings.filter((b) => {
    const cust = typeof b.customerId === 'object' ? (b.customerId as any) : null;
    const name = cust?.userId?.name || '';
    const email = cust?.userId?.email || '';
    const ref = b.bookingReference || '';
    const q = search.toLowerCase();

    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || ref.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            REGISTRY & AUDIT
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white mt-1">
            BOOKING <span className="text-[#CCFF00]">MANAGEMENT</span>
          </h1>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setIsManualModalOpen(true);
            setFormError(null);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Manual Booking
        </Button>
      </div>

      {/* Notifications */}
      {formSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{formSuccess}</span>
          <button onClick={() => setFormSuccess(null)}>✕</button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111111] border border-[#222222]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or FRG-Ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#CCFF00]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none focus:border-[#CCFF00]"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl bg-[#111111] border border-[#222222] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-xs">Loading booking records...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 text-xs">No bookings found matching criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161616] text-zinc-400 uppercase text-[10px] font-black tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Athlete / Customer</th>
                  <th className="py-3 px-4">Training Slot</th>
                  <th className="py-3 px-4">Lead Coach</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => {
                  const cust = typeof b.customerId === 'object' ? (b.customerId as any) : null;
                  const custUser = cust?.userId;
                  const slot = b.slotId;
                  const trainer = slot && typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;

                  return (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#CCFF00] text-xs">
                        {b.bookingReference}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{custUser?.name || 'Athlete'}</div>
                        <div className="text-[10px] text-zinc-400">{custUser?.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">
                          {slot?.date ? format(new Date(slot.date), 'MMM d, yyyy') : 'Session'}
                        </div>
                        <div className="font-mono text-zinc-400 text-[10px]">
                          {slot?.startTime} — {slot?.endTime}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-zinc-300">{trainer?.name || 'Staff'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge status={b.status} />
                      </td>
                      <td className="py-4 px-4 text-right">
                        {b.status === 'CONFIRMED' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCancellingBooking(b)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANUAL BOOKING MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsManualModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md bg-[#121212] border border-[#2A2A2A] rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <h3 className="text-xl font-bold uppercase text-white">Add Manual Booking</h3>
            <p className="text-xs text-zinc-400">
              Admin bookings enforce atomic capacity constraints and concurrency protection.
            </p>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                manualBookingMutation.mutate(manualData);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Select Customer</label>
                <select
                  required
                  value={manualData.customerId}
                  onChange={(e) => setManualData({ ...manualData, customerId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="" disabled>Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.userId?.name} ({c.userId?.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">Select Training Slot</label>
                <select
                  required
                  value={manualData.slotId}
                  onChange={(e) => setManualData({ ...manualData, slotId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white focus:outline-none focus:border-[#CCFF00]"
                >
                  <option value="" disabled>Select Available Slot</option>
                  {availableSlots
                    .filter((s) => s.status === 'AVAILABLE')
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.date} | {s.startTime}-{s.endTime} ({s.spotsAvailable} spots left)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsManualModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={manualBookingMutation.isPending}>
                  Confirm Booking
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setCancellingBooking(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div className="relative w-full max-w-md bg-[#141414] border border-red-500/30 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold">
              <AlertCircle className="w-6 h-6" />
              <span>Cancel Athlete Booking</span>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to cancel booking <strong>{cancellingBooking.bookingReference}</strong>? The spot will be restored to the available pool.
            </p>

            <div>
              <label className="block text-zinc-400 text-xs font-bold uppercase mb-1">Reason for Cancellation</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181818] border border-[#2A2A2A] text-white text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCancellingBooking(null)}>
                Keep Booking
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cancelBookingMutation.isPending}
                onClick={() =>
                  cancelBookingMutation.mutate({
                    id: cancellingBooking._id,
                    reason: cancelReason,
                  })
                }
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
