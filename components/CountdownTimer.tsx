
import React, { useState, useEffect } from 'react';
import { TimerState } from '../types';

interface CountdownTimerProps {
  startTime?: string;
  endTime?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, endTime }) => {
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    milliseconds: '00',
    ended: false
  });
  const [status, setStatus] = useState<'idle' | 'upcoming' | 'active' | 'ended'>('idle');
  const [isLastHours, setIsLastHours] = useState(false);

  useEffect(() => {
    if (!startTime || !endTime) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      let targetDate = end;
      let currentStatus: 'upcoming' | 'active' | 'ended' = 'active';

      if (now < start) {
        targetDate = start;
        currentStatus = 'upcoming';
      } else if (now >= end) {
        currentStatus = 'ended';
      } else {
        currentStatus = 'active';
      }

      setStatus(currentStatus);

      // Check if last 6 hours
      if (currentStatus === 'active' && (end - now) < (6 * 60 * 60 * 1000)) {
        setIsLastHours(true);
      } else {
        setIsLastHours(false);
      }

      const distance = targetDate - now;

      if (currentStatus === 'ended') {
        setTimeLeft(prev => ({ ...prev, ended: true }));
        // Keep showing 00
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((distance % 1000) / 10);

      setTimeLeft({
        days: '00',
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
        milliseconds: String(milliseconds).padStart(2, '0'),
        ended: false
      });
    }, 50);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  if (status === 'ended') {
    return (
      <div className="text-4xl md:text-6xl font-bold text-brand-red animate-pulse headline-font mt-8">
        ⏰ Offer Ended
      </div>
    );
  }

  const getLabelColor = () => {
    if (status === 'upcoming') return 'text-brand-blue';
    if (isLastHours) return 'text-red-600 animate-pulse';
    return 'text-brand-red'; // Red for normal active as requested
  };

  const getBoxBorderColor = () => {
    if (status === 'upcoming') return 'border-brand-blue/30';
    if (isLastHours) return 'border-red-500/50';
    return 'border-green-500/30';
  };

  const getNumberColor = () => {
    if (status === 'upcoming') return 'text-brand-blue';
    if (isLastHours) return 'text-red-600';
    return 'text-green-600';
  };

  const Box = ({ value, label }: { value: string; label: string }) => (
    <div className={`flex flex-col items-center justify-center border-2 rounded-xl md:rounded-3xl p-4 md:p-6 backdrop-blur-sm bg-white/90 shadow-2xl w-24 md:w-40 h-32 md:h-56 transition-colors duration-500 ${getBoxBorderColor()}`}>
      <span className={`text-5xl md:text-8xl font-bold font-counter ${getNumberColor()} drop-shadow-sm`}>{value}</span>
      <span className="text-xs md:text-sm uppercase tracking-widest mt-1 text-slate-500 font-bold">{label}</span>
    </div>
  );

  return (
    <div className="flex flex-col items-center lg:items-start mt-6">
      <div className={`text-lg md:text-xl font-bold uppercase tracking-[0.3em] mb-4 ${getLabelColor()}`}>
        {status === 'upcoming' ? 'Starts In' : 'Ends In'}
      </div>
      <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4">
        <Box value={timeLeft.hours} label="Hours" />
        <Box value={timeLeft.minutes} label="Minutes" />
        <Box value={timeLeft.seconds} label="Seconds" />
        <Box value={timeLeft.milliseconds} label="Millisec" />
      </div>
    </div>
  );
};

export default CountdownTimer;
