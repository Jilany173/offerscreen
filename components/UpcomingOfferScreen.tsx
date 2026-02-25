
import React, { useEffect } from 'react';
import CountdownTimer from './CountdownTimer';
import { Offer } from '../types';

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
            className="w-full h-screen flex flex-col items-center justify-center relative overflow-hidden"
            style={bgStyle}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60 z-0" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 animate-fade-in">

                {/* আইকন */}
                <div className="text-7xl mb-4 animate-bounce">🎯</div>

                {/* Offer নাম — COMING SOON-এর উপরে */}
                {offerName && (
                    <div
                        className="headline-font text-4xl md:text-6xl font-black text-yellow-300 mb-2 select-none"
                        style={{ textShadow: '2px 2px 0px #000, 0 0 20px rgba(253,224,71,0.5)', letterSpacing: '0.05em' }}
                    >
                        {offerName}
                    </div>
                )}

                {/* COMING SOON হেডিং */}
                <div
                    className="headline-font text-5xl md:text-8xl font-black text-white mb-2 select-none"
                    style={{
                        textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 0 0 30px rgba(253,224,71,0.5)',
                        letterSpacing: '0.05em'
                    }}
                >
                    COMING
                </div>
                <div
                    className="headline-font text-5xl md:text-8xl font-black text-white mb-6 select-none"
                    style={{
                        textShadow: '3px 3px 0px #000, -1px -1px 0px #000',
                        letterSpacing: '0.05em'
                    }}
                >
                    SOON
                </div>

                {/* বিভাজক রেখা */}
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full mb-6 opacity-70" />



                {/* কাউন্টডাউন টাইমার */}
                <CountdownTimer
                    startTime={offer.start_time}
                    endTime={offer.end_time}
                    language={language}
                />
            </div>
        </div>
    );
};

export default UpcomingOfferScreen;
