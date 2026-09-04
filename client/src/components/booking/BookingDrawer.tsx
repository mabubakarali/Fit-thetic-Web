import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, Calendar, Clock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { Slot, Trainer, Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { getErrorMessage } from '../../services/api';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface BookingDrawerProps {
  slot: Slot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingDrawer: React.FC<BookingDrawerProps> = ({
  slot,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !slot) return null;

  const trainer = typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
  const formattedDate = format(new Date(slot.date), 'EEEE, MMMM d, yyyy');

  const handleConfirm = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Generate client idempotency key for network resilience
      const idempotencyKey = `req_${user.id}_${slot._id}_${Date.now()}`;
      const booking = await bookingService.createBooking({
        slotId: slot._id,
        idempotencyKey,
      });

      onSuccess(booking);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#101010] border-l border-white/10 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#CCFF00]">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00]" />
                CONFIRM TRAINING SLOT
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[#181818] text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Booking Failed</div>
                  <div className="text-xs text-red-300/90 mt-0.5">{error}</div>
                </div>
              </div>
            )}

            {/* Slot Details Card */}
            <div className="my-6 p-5 rounded-2xl bg-[#161616] border border-[#262626] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#202020] text-[#CCFF00]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Date</div>
                  <div className="text-base font-bold text-white">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-[#202020] text-[#CCFF00]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-zinc-400 font-semibold uppercase">Time Slot</div>
                  <div className="text-xl font-black text-white">
                    {slot.startTime} — {slot.endTime}
                  </div>
                </div>
              </div>

              {trainer && (
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <img
                    src={trainer.profileImage}
                    alt={trainer.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <div className="text-xs text-zinc-400 font-semibold uppercase">Lead Coach</div>
                    <div className="text-base font-bold text-white">{trainer.name}</div>
                    <div className="text-xs text-zinc-400">{trainer.position}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Spots Remaining Indicator */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#222222] flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-medium">Spots Remaining:</span>
              <span className="font-bold text-[#CCFF00]">
                {slot.spotsAvailable} of {slot.capacity} Available
              </span>
            </div>

            {/* Cancellation Policy Reminder */}
            <div className="mt-6 space-y-2 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
                FORGE Cancellation Policy
              </div>
              <p className="leading-relaxed pl-6">
                Free cancellation is permitted up to <strong>2 hours</strong> before the session starts. Late cancellations or no-shows may count towards your weekly membership quota.
              </p>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            {user ? (
              <div className="text-xs text-zinc-400 text-center pb-1">
                Booking as: <strong className="text-white">{user.name}</strong> ({user.email})
              </div>
            ) : (
              <div className="text-xs text-amber-400 text-center pb-1 font-semibold">
                You will be prompted to sign in to complete your reservation.
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              isLoading={isLoading}
              className="w-full justify-center text-base"
            >
              {user ? 'CONFIRM RESERVATION' : 'SIGN IN TO BOOK'}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="w-full justify-center"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
