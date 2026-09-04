import React from 'react';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { Calendar } from 'lucide-react';

interface DatePickerStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysCount?: number;
}

export const DatePickerStrip: React.FC<DatePickerStripProps> = ({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}) => {
  const dates = Array.from({ length: daysCount }).map((_, i) => addDays(new Date(), i));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <Calendar className="w-4 h-4 text-[#CCFF00]" />
          <span>SELECT TRAINING DATE</span>
        </div>
        <span className="text-xs font-semibold text-zinc-500">
          {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
        {dates.map((d) => {
          const dateStr = format(d, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          const today = isToday(d);

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center justify-center min-w-[76px] sm:min-w-[86px] py-3.5 px-2 rounded-2xl border transition-all duration-200 shrink-0 select-none ${
                isSelected
                  ? 'bg-[#CCFF00] border-[#CCFF00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] scale-[1.03]'
                  : 'bg-[#141414] border-[#242424] text-zinc-300 hover:border-zinc-600 hover:bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`text-[11px] font-black tracking-wider uppercase ${
                  isSelected ? 'text-black' : today ? 'text-[#CCFF00]' : 'text-zinc-500'
                }`}
              >
                {today ? 'TODAY' : format(d, 'EEE')}
              </span>
              <span
                className={`text-2xl sm:text-3xl font-black tracking-tight my-0.5 ${
                  isSelected ? 'text-black' : 'text-white'
                }`}
              >
                {format(d, 'd')}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  isSelected ? 'text-black/80' : 'text-zinc-500'
                }`}
              >
                {format(d, 'MMM')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
