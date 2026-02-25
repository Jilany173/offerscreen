
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center pb-0 px-4 space-y-2 relative z-20">
      {/* Second Set of Messages (New Request) */}
      <div className="flex flex-col items-center w-full">
        {/* Blue Box */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white px-6 py-2 rounded-t-xl shadow-xl border-b border-white/10 w-full max-w-4xl text-center relative z-20">
          <h2
            className="font-bengali text-lg md:text-2xl font-bold tracking-wide drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] antialiased text-white"
          >
            প্রথমে যারা রেজিস্ট্রেশন করবেন, শুধুমাত্র তারাই পাবেন স্পেশাল কুপন।
          </h2>
        </div>

        {/* Red Box */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-10 py-2 rounded-xl shadow-2xl w-fit min-w-[300px] text-center transform -mt-2 border-2 border-white/20 relative z-30 transition-transform hover:scale-[1.01] duration-300">
          <h2 className="font-bengali text-2xl md:text-3xl font-black tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] antialiased">
            কুপন খুললেই গিফট!
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
