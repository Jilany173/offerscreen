
import React, { useState, useEffect } from 'react';
import { TimerState } from '../types';

interface CountdownTimerProps {
  targetDate: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    ended: false
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft(prev => ({ ...prev, ended: true }));
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        days: '00', // Not used
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        ended: false
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.ended) {
    return (
      <div className="text-4xl md:text-6xl font-bold text-brand-red animate-pulse headline-font mt-8">
        ⏰ Offer Ended
      </div>
    );
  }

  const Box = ({ value, label }: { value: string; label: string }) => (
    <div className="flex flex-col items-center border rounded-xl md:rounded-3xl p-4 md:p-8 backdrop-blur-sm bg-white border-slate-200 shadow-2xl min-w-[90px] md:min-w-[140px]">
      <span className="text-4xl md:text-7xl font-black text-brand-blue">{value}</span>
      <span className="text-xs md:text-base uppercase tracking-widest mt-2 text-slate-500 font-bold">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-5 mt-4">

      <Box value={timeLeft.hours} label="Hours" />
      <Box value={timeLeft.minutes} label="Minutes" />
      <Box value={timeLeft.seconds} label="Seconds" />
    </div>
  );
};

export default CountdownTimer;
