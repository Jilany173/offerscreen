import React, { useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import GiftMarquee from './GiftMarquee';
import { Offer } from '../types';
import logoUrl from '../src/assets/logo.png';

interface UpcomingOfferScreenProps {
    offer: Offer;
    language?: 'en' | 'bn';
    bgStyle?: React.CSSProperties;
}

const UpcomingOfferScreen: React.FC<UpcomingOfferScreenProps> = ({ offer, language = 'bn', bgStyle = {} }) => {

    // অফার শুরু হওয়ার সময় পার হলে page reload করবে
    useEffect(() => {
        if (!offer.start_time) return;

        const checkStart = () => {
            const now = new Date().getTime();
            const start = new Date(offer.start_time).getTime();
            if (now >= start) {
                window.location.reload();
            }
        };

        checkStart();
        const interval = setInterval(checkStart, 1000);
        return () => clearInterval(interval);
    }, [offer.start_time]);

    const courseName = offer.courses && offer.courses.length > 0
        ? offer.courses[0].title
        : null;

    // offer.title-এ HTML থাকতে পারে, strip করে clean text নেওয়া
    const stripHtml = (html: string) => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    const offerName = offer.title ? stripHtml(offer.title) : null;

    return (
        <div
            className="w-full h-[100dvh] flex flex-col relative overflow-hidden"
            style={bgStyle}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 z-0" />

            {/* Content Container (Takes remaining space to push footer down) */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center text-center px-4 w-full">

                {/* Content block to group items tightly and scale them if needed */}
                <div className="flex flex-col items-center justify-center w-full max-h-full py-2">

                    {/* লোগো */}
                    <div className="mb-2 md:mb-4 animate-fade-in relative block shrink-0">
                        {/* Background glow to ensure blur is very visible */}
                        <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-110 -z-10"></div>
                        <img
                            src={logoUrl}
                            alt="Hexa's Zindabazar"
                            className="h-16 sm:h-20 md:h-24 lg:h-28 object-contain relative z-10"
                            style={{ filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))' }}
                        />
                    </div>

                    {/* Offer নাম — COMING SOON-এর উপরে */}
                    {offerName && (
                        <div
                            className="headline-font text-2xl sm:text-3xl md:text-5xl lg:text-5xl font-black text-yellow-300 mb-1 lg:mb-2 select-none shrink-0"
                            style={{ textShadow: '2px 2px 0px #000, 0 0 20px rgba(253,224,71,0.5)', letterSpacing: '0.05em' }}
                        >
                            {offerName}
                        </div>
                    )}

                    {/* COMING SOON হেডিং */}
                    <div className="flex flex-col items-center justify-center shrink-0 mb-2 md:mb-4 lg:mb-4">
                        <div
                            className="headline-font text-4xl sm:text-5xl md:text-7xl lg:text-7xl font-black text-white shrink-0 leading-none select-none"
                            style={{
                                textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 0 0 30px rgba(253,224,71,0.5)',
                                letterSpacing: '0.05em'
                            }}
                        >
                            COMING
                        </div>
                        <div
                            className="headline-font text-4xl sm:text-5xl md:text-7xl lg:text-7xl font-black text-white shrink-0 leading-none select-none mt-1"
                            style={{
                                textShadow: '3px 3px 0px #000, -1px -1px 0px #000',
                                letterSpacing: '0.05em'
                            }}
                        >
                            SOON
                        </div>
                    </div>

                    {/* বিভাজক রেখা */}
                    <div className="w-32 md:w-48 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mb-2 md:mb-4 lg:mb-4 opacity-70 shrink-0" />

                    {/* কাউন্টডাউন টাইমার */}
                    <div className="transform scale-[0.70] sm:scale-[0.85] md:scale-95 lg:scale-100 origin-top shrink-0">
                        <CountdownTimer
                            startTime={offer.start_time}
                            endTime={offer.end_time}
                            language={language}
                        />
                    </div>

                </div>
            </div>

            {/* Footer Area: Promotional Badge + Gift Marquee */}
            <div className="relative z-20 flex flex-col items-center w-full shrink-0">
                {/* Promotional Text Badge */}
                <div className="flex flex-col items-center w-full scale-[0.65] sm:scale-[0.75] md:scale-[0.85] lg:scale-90 origin-bottom mb-8 md:mb-12 relative z-30">
                    <div className="bg-[#183aae] text-white px-6 md:px-12 py-1.5 md:py-2.5 rounded-full shadow-[0_4px_15px_rgba(24,58,174,0.6)] w-max mx-auto flex items-center justify-center relative z-10 border border-white/20">
                        <h2 className="font-bengali text-lg md:text-3xl font-black tracking-wide drop-shadow-md text-white text-center">
                            প্রথমে যারা এডমিশন নিবেন, শুধুমাত্র তারাই পাবেন স্পেশাল কুপন।
                        </h2>
                    </div>
                    <div className="bg-[#d2202a] text-white px-8 md:px-14 py-2 md:py-3 rounded-full shadow-[0_8px_20px_rgba(210,32,42,0.8)] w-max mx-auto flex items-center justify-center transform -mt-2 relative z-20 border border-white/20">
                        <h2 className="font-bengali text-xl md:text-3xl lg:text-4xl font-black tracking-wider drop-shadow-lg text-white text-center">
                            কুপন খুললেই নিশ্চিত গিফট!
                        </h2>
                    </div>
                </div>

                <div className="w-full relative z-40 bg-transparent">
                    <GiftMarquee />
                </div>
            </div>
        </div>
    );
};

export default UpcomingOfferScreen;
