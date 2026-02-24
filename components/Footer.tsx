
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center pb-2 px-4 space-y-4 relative z-20">
      {/* Second Set of Messages (New Request) */}
      <div className="flex flex-col items-center w-full">
        {/* Blue Box */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-10 py-3 rounded-t-xl shadow-xl border-b border-white/10 w-full max-w-5xl text-center relative z-20">
          <h2
            className="font-bengali text-xl md:text-2xl font-bold tracking-wide drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] antialiased text-white"
          >
            হেক্সাস জিন্দাবাজারে অফারে শুধু ছাড় নয়
          </h2>
        </div>

        {/* Red Box */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-14 py-4 rounded-xl shadow-2xl w-fit min-w-[400px] text-center transform -mt-2 border-2 border-white/20 relative z-30 transition-transform hover:scale-[1.01] duration-300">
          <h2 className="font-bengali text-2xl md:text-4xl font-black tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.6)] antialiased">
            সাথে থাকছে ২০টি+ বিশেষ উপহারের কুপন।
          </h2>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
