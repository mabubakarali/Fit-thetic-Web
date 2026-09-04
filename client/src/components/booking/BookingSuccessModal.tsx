import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { CheckCircle2, Calendar, Clock, MapPin, Download, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Booking, Trainer } from '../../types';
import { BRAND } from '../../config/brand';
import { Button } from '../common/Button';

interface BookingSuccessModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#CCFF00', '#FFFFFF', '#333333'],
      });
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const slot = booking.slotId;
  const trainer = slot && typeof slot.trainerId === 'object' ? (slot.trainerId as Trainer) : null;
  const formattedDate = slot?.date ? format(new Date(slot.date), 'EEEE, MMMM d, yyyy') : '';

  // Generate .ics calendar download
  const handleDownloadICS = () => {
    if (!slot) return;
    const [startH, startM] = slot.startTime.split(':');
    const [endH, endM] = slot.endTime.split(':');
    const dateFormatted = slot.date.replace(/-/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FORGE GYM//Slot Booking//EN',
      'BEGIN:VEVENT',
      `SUMMARY:FORGE Training Session (${trainer?.name || 'Strength'})`,
      `DESCRIPTION:Training Slot Reference: ${booking.bookingReference}\\nCoach: ${trainer?.name || 'FORGE Staff'}\\nLocation: ${BRAND.contact.address}`,
      `LOCATION:${BRAND.contact.address}`,
      `DTSTART:${dateFormatted}T${startH}${startM}00`,
      `DTEND:${dateFormatted}T${endH}${endM}00`,
      `UID:${booking.bookingReference}@forgegym.com`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `FORGE-Session-${booking.bookingReference}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#111111] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center z-10 animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1A1A1A] text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-[#CCFF00]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] text-xs font-black uppercase tracking-widest mb-2">
          SESSION CONFIRMED
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          YOU'RE ON THE SCHEDULE.
        </h3>
        <p className="text-zinc-400 text-sm mt-1">See you on the training floor.</p>

        {/* Booking Ticket Card */}
        <div className="my-6 p-5 rounded-2xl bg-[#161616] border border-[#282828] text-left space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Booking Ref</span>
            <span className="font-mono text-base font-black text-[#CCFF00] tracking-wider">
              {booking.bookingReference}
            </span>
          </div>

          <div className="space-y-2 text-sm pt-1">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <Calendar className="w-4 h-4 text-[#CCFF00]" />
              <span className="font-semibold">{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2.5 text-zinc-300">
              <Clock className="w-4 h-4 text-[#CCFF00]" />
              <span className="font-bold text-white">
                {slot?.startTime} — {slot?.endTime}
              </span>
            </div>

            {trainer && (
              <div className="flex items-center gap-2.5 text-zinc-300">
                <img
                  src={trainer.profileImage}
                  alt={trainer.name}
                  className="w-5 h-5 rounded-full object-cover border border-white/20"
                />
                <span>
                  Coach: <strong className="text-white">{trainer.name}</strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2.5 text-zinc-400 text-xs pt-1">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="truncate">{BRAND.contact.address}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownloadICS}
            className="w-full justify-center"
            leftIcon={<Download className="w-4 h-4 text-[#CCFF00]" />}
          >
            Add to Calendar
          </Button>

          <Link to="/account" className="w-full" onClick={onClose}>
            <Button variant="primary" size="md" className="w-full justify-center" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Go to My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
