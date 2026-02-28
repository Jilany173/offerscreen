import React, { useEffect, useState, useRef } from 'react';
import { fetchPopupGiftItems, GiftItem } from '../services/giftService';

const GiftPopups: React.FC = () => {
    const [visibleGifts, setVisibleGifts] = useState<GiftItem[]>([]);
    const [currentGiftIndex, setCurrentGiftIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const loadGifts = async () => {
            const items = await fetchPopupGiftItems();
            setVisibleGifts(items);
        };
        loadGifts();
    }, []);

    const timeoutRefs = useRef<{ hide?: ReturnType<typeof setTimeout>, next?: ReturnType<typeof setTimeout>, initial?: ReturnType<typeof setTimeout> }>({});

    useEffect(() => {
        if (visibleGifts.length === 0) return;

        // Clean up previous timeouts before setting new ones
        const clearAllTimeouts = () => {
            if (timeoutRefs.current.hide) clearTimeout(timeoutRefs.current.hide);
            if (timeoutRefs.current.next) clearTimeout(timeoutRefs.current.next);
            if (timeoutRefs.current.initial) clearTimeout(timeoutRefs.current.initial);
        };
        clearAllTimeouts();

        const showNextGift = () => {
            setIsVisible(true);

            // Stay visible for 5 seconds
            timeoutRefs.current.hide = setTimeout(() => {
                setIsVisible(false);

                // Wait 3 seconds before showing the next one
                timeoutRefs.current.next = setTimeout(() => {
                    setCurrentGiftIndex((prev) => (prev + 1) % visibleGifts.length);
                }, 3000);
            }, 5000);
        };

        timeoutRefs.current.initial = setTimeout(showNextGift, 2000);

        return () => clearAllTimeouts();
    }, [visibleGifts, currentGiftIndex]);

    if (visibleGifts.length === 0) return null;

    const currentGift = visibleGifts[currentGiftIndex];

    return (
        <div className="fixed top-[42%] -translate-y-1/2 -right-4 z-[9999] perspective-1000">
            <div className={`
                transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap
                ${isVisible ? 'opacity-100 translate-x-[40px] scale-100 rotate-0' : 'opacity-0 translate-x-[500px] scale-90 rotate-3 pointer-events-none'}
            `}>
                <div className="relative flex items-center gap-4 bg-[#2f6cef] p-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] overflow-hidden min-w-[310px]">
                    {/* Shimmer effect for premium feel */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                    {/* Image Box */}
                    <div className="w-[72px] h-[72px] shrink-0 bg-[#1d52ce] rounded-xl flex items-center justify-center overflow-hidden">
                        {currentGift.image_url ? (
                            <img src={currentGift.image_url} alt={currentGift.name} className="w-full h-full object-contain p-2 drop-shadow-md transition-transform duration-300 hover:scale-110" />
                        ) : (
                            <span className="text-4xl drop-shadow-md">{currentGift.emoji}</span>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex flex-col justify-center py-1 pr-6 relative z-10">
                        <span className="text-[#FFD700] text-[9px] font-bold tracking-[0.15em] uppercase mb-0.5 opacity-90 drop-shadow-sm">
                            SPECIAL GIFT
                        </span>
                        <h3 className="font-bengali text-white text-[22px] font-bold leading-none mb-1.5 drop-shadow-md">
                            {currentGift.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#FFD700] text-[10px] animate-pulse">✦</span>
                            <span className="text-white text-[11px] font-bold tracking-widest uppercase opacity-95">GET IT NOW</span>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
};

export default GiftPopups;
