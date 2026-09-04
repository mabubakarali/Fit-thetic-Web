import React from 'react';
import { Clock, User, ChevronRight, Lock } from 'lucide-react';
import { Slot, Trainer } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface SlotCardProps {
  slot: Slot;
  onBook: (slot: Slot) => void;
  isBookedByMe?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, onBook, isBookedByMe }) => {
  const trainer = typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
  const isAvailable = slot.status === 'AVAILABLE';
  const isFull = slot.status === 'FULL';
  const isLocked = slot.status === 'LOCKED';
  const isCancelled = slot.status === 'CANCELLED';

  const percentBooked = Math.min(100, Math.round((slot.currentBookings / slot.capacity) * 100));

  return (
    <div
      className={`group relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        isBookedByMe
          ? 'bg-[#14180A] border-[#CCFF00]/40 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
          : isAvailable
          ? 'bg-[#121212] border-[#222222] hover:border-[#CCFF00]/50 hover:bg-[#161616] shadow-lg'
          : 'bg-[#0E0E0E] border-[#1C1C1C] opacity-75'
      }`}
    >
      {/* Top Header: Time & Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#282828] text-white">
              <Clock className="w-4 h-4 text-[#CCFF00]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {slot.startTime}
              </div>
              <div className="text-xs text-zinc-500 font-medium">to {slot.endTime}</div>
            </div>
          </div>

          <Badge status={slot.status} spotsLeft={slot.spotsAvailable} />
        </div>

        {/* Coach Profile */}
        <div className="flex items-center gap-3 py-3 border-t border-white/5 my-2">
          <img
            src={trainer?.profileImage || '/assets/trainer_ahmed.jpg'}
            alt={trainer?.name || 'Coach'}
            className="w-10 h-10 rounded-full object-cover border border-white/15"
          />
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white truncate group-hover:text-[#CCFF00] transition-colors">
              {trainer?.name || 'Assigned Coach'}
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              {trainer?.position || 'Strength & Conditioning'}
            </div>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-zinc-400">
            <span>Capacity</span>
            <span className="text-zinc-300">
              <strong className={isAvailable ? 'text-white' : 'text-zinc-500'}>
                {slot.currentBookings}
              </strong>{' '}
              / {slot.capacity} spots
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#222222] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull
                  ? 'bg-zinc-600'
                  : percentBooked > 75
                  ? 'bg-amber-400'
                  : 'bg-[#CCFF00]'
              }`}
              style={{ width: `${percentBooked}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-5 mt-2 border-t border-white/5">
        {isBookedByMe ? (
          <div className="w-full py-2 px-3 rounded-lg bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold text-center uppercase tracking-wider">
            ✓ You are Booked
          </div>
        ) : isAvailable ? (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onBook(slot)}
            className="w-full justify-center"
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Reserve Spot
          </Button>
        ) : isLocked ? (
          <Button variant="secondary" size="sm" disabled className="w-full justify-center" leftIcon={<Lock className="w-3.5 h-3.5" />}>
            Locked
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled className="w-full justify-center">
            {isCancelled ? 'Session Cancelled' : 'Fully Booked'}
          </Button>
        )}
      </div>
    </div>
  );
};
