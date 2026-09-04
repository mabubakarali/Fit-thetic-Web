import React from 'react';
import { clsx } from 'clsx';
import { Lock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { SlotStatus, BookingStatus } from '../../types';

interface BadgeProps {
  status: SlotStatus | BookingStatus | 'FEW_SPOTS' | string;
  spotsLeft?: number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, spotsLeft, className }) => {
  let style = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  let icon: React.ReactNode = null;
  let label = status;

  switch (status) {
    case 'AVAILABLE':
      if (spotsLeft !== undefined && spotsLeft <= 3 && spotsLeft > 0) {
        style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        icon = <AlertTriangle className="w-3 h-3" />;
        label = `Only ${spotsLeft} spots left`;
      } else {
        style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        icon = <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />;
        label = spotsLeft !== undefined ? `${spotsLeft} spots available` : 'Available';
      }
      break;

    case 'FEW_SPOTS':
      style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      icon = <AlertTriangle className="w-3 h-3" />;
      label = spotsLeft !== undefined ? `${spotsLeft} spots left` : 'Few spots';
      break;

    case 'FULL':
      style = 'bg-zinc-800/80 text-zinc-400 border-zinc-700/60';
      icon = <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />;
      label = 'FULL';
      break;

    case 'LOCKED':
      style = 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      icon = <Lock className="w-3 h-3" />;
      label = 'LOCKED';
      break;

    case 'CONFIRMED':
      style = 'bg-[#CCFF00]/10 text-[#CCFF00] border-[#CCFF00]/30 font-bold';
      icon = <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" />;
      label = 'CONFIRMED';
      break;

    case 'CANCELLED':
      style = 'bg-red-500/10 text-red-400 border-red-500/30';
      icon = <XCircle className="w-3 h-3 text-red-400" />;
      label = 'CANCELLED';
      break;

    case 'COMPLETED':
      style = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      icon = <CheckCircle2 className="w-3 h-3" />;
      label = 'COMPLETED';
      break;

    default:
      label = status;
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm',
        style,
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
