
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

      setTimerData({
        status: currentStatus,
        isLastHours: isLast,
        timeLeft: {
          days: '00',
          hours: String(hours).padStart(2, '0'),
          minutes: String(minutes).padStart(2, '0'),
          seconds: String(seconds).padStart(2, '0'),
          milliseconds: '00', // Disabled tracking to save CPU
          ended: false
        }
      });
    };

    // Initial call
    updateTimer();

    // Changing interval from 100ms to 1000ms (1 sec) significantly reduces React re-renders and CPU load on TVs
    const interval = setInterval(updateTimer, 1000);

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
    if (isLastHours) return 'text-white animate-pulse drop-shadow-md';
    return 'text-white drop-shadow-md'; // White as requested
  };

  const getBoxBorderColor = () => {
    if (status === 'upcoming') return 'border-brand-blue/30';
    if (isLastHours) return 'border-red-500/50';
    return 'border-green-500/30';
  };

  const getNumberColor = () => {
    if (status === 'upcoming') return 'text-brand-blue';
    return 'text-brand-blue'; // Change from Deep Gold to Black/Brand Blue for active offer
  };

  const Box = ({ value, label }: { value: string; label: string }) => {
    let fontSizeClass = '';
    let fontFamilyClass = '';

    if (language === 'bn') {
      fontSizeClass = 'text-6xl md:text-7xl lg:text-[5.5rem]';
      fontFamilyClass = 'font-bengali font-black';
    } else {
      fontSizeClass = 'text-6xl md:text-[6rem] lg:text-[7.5rem]';
      fontFamilyClass = 'font-poppins font-black'; // Poppins ExtraBold/Black
    }

    return (
      <div className="flex flex-col items-center">
        <div className={`flex flex-col items-center justify-center border-4 rounded-xl md:rounded-3xl p-4 md:p-6 backdrop-blur-sm bg-[#FFFDF0] shadow-2xl w-auto min-w-[7.5rem] md:min-w-[13rem] h-36 md:h-64 transition-colors duration-500 border-[#B45309]/30`}>
          <span className={`${fontSizeClass} ${fontFamilyClass} ${getNumberColor()} drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] leading-none mb-2 md:mb-4 text-center flex items-center justify-center whitespace-nowrap px-1 md:px-2`} style={{ textShadow: '2px 2px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 0px 4px 10px rgba(0,0,0,0.5)' }}>
            {/* Applying inner shadow logic */}
            <span className={language === 'bn' ? '' : 'inner-shadow-text'}>
              {value}
            </span>
          </span>
          <span className="text-base md:text-xl uppercase tracking-widest mt-1 md:mt-2 text-slate-800 font-extrabold drop-shadow-sm">{label}</span>
        </div>
      </div>
    );
  };


  return (
    <div className="flex flex-col items-center mt-6 w-full">
      <div className="flex flex-col items-start w-full relative">
        <div
          className={`${language === 'bn' ? 'font-bengali' : 'font-poppins'} text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-[0.2em] mb-4 ${getLabelColor()} -ml-4 md:-ml-8 lg:-ml-12 drop-shadow-lg`}
          style={{ WebkitTextStroke: '0.5px white' }}
        >
          {language === 'bn'
            ? (status === 'upcoming' ? 'শুরু হতে আর মাত্র......' : 'আর মাত্র......')
            : (status === 'upcoming' ? 'STARTS IN......' : 'ENDS IN......')}
        </div>
        <div className="relative flex items-center justify-center w-full">
          <div className="flex flex-wrap items-end justify-center gap-8 md:gap-20">
            <Box value={language === 'bn' ? toBengaliNumber(timeLeft.hours) : timeLeft.hours} label={language === 'bn' ? "ঘণ্টা" : "Hours"} />
            <Box value={language === 'bn' ? toBengaliNumber(timeLeft.minutes) : timeLeft.minutes} label={language === 'bn' ? "মিনিট" : "Minutes"} />
            <Box value={language === 'bn' ? toBengaliNumber(timeLeft.seconds) : timeLeft.seconds} label={language === 'bn' ? "সেকেন্ড" : "Seconds"} />
          </div>

          {/* বাকি টেক্সট */}
          <div
            className={`absolute -right-4 md:-right-8 lg:-right-16 bottom-0 md:bottom-2 transform translate-x-full flex items-center ${language === 'bn' ? 'font-bengali' : 'font-poppins'} text-3xl md:text-5xl lg:text-6xl font-black ${getLabelColor()}`}
            style={{ WebkitTextStroke: '0.5px white', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            {language === 'bn' ? 'বাকি...' : 'LEFT...'}
          </div>
        </div>
      </div>

    </div>
  );
};

export default CountdownTimer;
