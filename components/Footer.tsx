
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center pb-0 px-4 space-y-2 relative z-20">
      {/* Second Set of Messages (New Request) */}
      <div className="flex flex-col items-center w-full">
        {/* Blue Box */}
        <div className="bg-[#183aae] flex items-center justify-center relative z-20 w-max mx-auto shadow-[0_4px_15px_rgba(24,58,174,0.6)] border border-white/20 rounded-full py-1.5 md:py-2.5 px-6 md:px-12">
          <h2
            className="font-bengali text-lg md:text-3xl font-bold tracking-wide drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] antialiased text-white"
          >
            প্রথমে যারা এডমিশন নিবেন, শুধুমাত্র তারাই পাবেন স্পেশাল কুপন।
          </h2>
        </div>

        {/* Bottom red container */}
        <div className="bg-[#d2202a] text-white px-8 md:px-14 py-2 md:py-3 rounded-full shadow-[0_8px_20px_rgba(210,32,42,0.8)] w-max mx-auto flex items-center justify-center transform -mt-2 relative z-20 border border-white/20">
          <h2 className="font-bengali text-xl md:text-3xl font-black tracking-wider drop-shadow-lg text-white text-center">
            কুপন খুললেই নিশ্চিত গিফট!
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
