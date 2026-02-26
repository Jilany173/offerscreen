
import React, { useState, useEffect } from 'react';
import { TimerState } from '../types';

interface CountdownTimerProps {
  startTime?: string;
  endTime?: string;
  language?: 'en' | 'bn';
}

const toBengaliNumber = (n: string) => {
  const englishToBengaliMap: { [key: string]: string } = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return n.split('').map(digit => englishToBengaliMap[digit] || digit).join('');
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startTime, endTime, language = 'bn' }) => {

  const [timerData, setTimerData] = useState<{
    timeLeft: TimerState;
    status: 'idle' | 'upcoming' | 'active' | 'ended';
    isLastHours: boolean;
  }>({
    timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00', milliseconds: '00', ended: false },
    status: 'idle',
    isLastHours: false
  });

  useEffect(() => {
    if (!startTime || !endTime) return;

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
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

      const isLast = currentStatus === 'active' && (end - now) < (6 * 60 * 60 * 1000);
      const distance = targetDate - now;

      if (currentStatus === 'ended') {
        setTimerData(prev => ({
          ...prev,
          status: 'ended',
          timeLeft: { ...prev.timeLeft, ended: true }
        }));
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      const milliseconds = Math.floor((distance % 1000) / 10);

      setTimerData({
        status: currentStatus,
        isLastHours: isLast,
        timeLeft: {
          days: '00',
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
          milliseconds: String(milliseconds).padStart(2, '0'),
          ended: false
        }
      });
    };

    // Initial call
    updateTimer();
    const interval = setInterval(updateTimer, 100);

    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const { status, isLastHours, timeLeft } = timerData;

  if (status === 'ended') {
    return (
      <div className="text-4xl md:text-6xl font-bold text-brand-red animate-pulse headline-font mt-8">
        ⏰ Offer Ended
      </div>
    );
  }

  const getLabelColor = () => {
    if (status === 'upcoming') return 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]';
    if (isLastHours) return 'text-red-600 animate-pulse drop-shadow-md';
    return 'text-brand-red drop-shadow-md'; // Red for normal active as requested
  };

  const getBoxBorderColor = () => {
    if (status === 'upcoming') return 'border-brand-blue/30';
    if (isLastHours) return 'border-red-500/50';
    return 'border-green-500/30';
  };

  const getNumberColor = () => {
    if (status === 'upcoming') return 'text-brand-blue';
    return 'text-[#B45309]'; // Deep Gold
  };

  const Box = ({ value, label }: { value: string; label: string }) => {
    // Dynamic font size based on number of digits and language
    const isThreeDigits = value.length >= 3;

    let fontSizeClass = '';
    let fontFamilyClass = '';

    if (language === 'bn') {
      fontSizeClass = isThreeDigits ? 'text-4xl md:text-5xl' : 'text-5xl md:text-6xl';
      fontFamilyClass = 'font-bengali font-black';
    } else {
      fontSizeClass = isThreeDigits ? 'text-4xl md:text-6xl' : 'text-5xl md:text-7xl';
      fontFamilyClass = 'font-poppins font-black'; // Poppins ExtraBold/Black
    }

    return (
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center justify-center border-4 rounded-xl md:rounded-3xl p-4 md:p-6 backdrop-blur-sm bg-[#FFFDF0] shadow-2xl w-24 md:w-40 h-32 md:h-56 transition-colors duration-500 border-[#B45309]/30`}>
          <span className={`${fontSizeClass} ${fontFamilyClass} ${getNumberColor()} drop-shadow-md leading-tight text-center flex items-center justify-center`}>
            {/* Applying inner shadow logic */}
            <span className={language === 'bn' ? '' : 'inner-shadow-text'}>
              {value}
            </span>
          </span>
          <span className="text-sm md:text-base uppercase tracking-widest mt-2 text-slate-800 font-extrabold">{label}</span>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col items-center lg:items-start mt-6">
      <div
        className={`${language === 'bn' ? 'font-bengali' : 'font-poppins'} text-3xl md:text-4xl font-extrabold tracking-[0.2em] mb-4 ${getLabelColor()}`}
        style={{ WebkitTextStroke: '0.5px white' }}
      >
        {language === 'bn'
          ? (status === 'upcoming' ? 'শুরু হতে আর মাত্র......' : 'আর মাত্র......')
          : (status === 'upcoming' ? 'STARTS IN......' : 'ENDS IN......')}
      </div>
      <div className="relative flex items-center justify-center lg:justify-start">
        <div className="flex flex-wrap items-end justify-center lg:justify-start gap-3 md:gap-11">
          <Box value={language === 'bn' ? toBengaliNumber(timeLeft.hours) : timeLeft.hours} label={language === 'bn' ? "ঘণ্টা" : "Hours"} />
          <Box value={language === 'bn' ? toBengaliNumber(timeLeft.minutes) : timeLeft.minutes} label={language === 'bn' ? "মিনিট" : "Minutes"} />
          <Box value={language === 'bn' ? toBengaliNumber(timeLeft.seconds) : timeLeft.seconds} label={language === 'bn' ? "সেকেন্ড" : "Seconds"} />

          {/* মিলিসেকেন্ড বক্স */}
          <Box value={language === 'bn' ? toBengaliNumber(timeLeft.milliseconds) : timeLeft.milliseconds} label={language === 'bn' ? "মিলিসেকেন্ড" : "Milliseconds"} />
        </div>

        {/* বাকি টেক্সট */}
        <div
          className={`absolute -right-4 md:-right-8 lg:-right-12 bottom-0 md:bottom-2 transform translate-x-full flex items-center ${language === 'bn' ? 'font-bengali' : 'font-poppins'} text-3xl md:text-5xl font-black ${getLabelColor()}`}
          style={{ WebkitTextStroke: '0.5px white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
        >
          {language === 'bn' ? 'বাকি...' : 'LEFT...'}
        </div>
      </div>

    </div>
  );
};

export default CountdownTimer;
