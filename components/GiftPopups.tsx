import React, { useEffect, useState } from 'react';
import { fetchVisibleGiftItems, GiftItem } from '../services/giftService';

const GiftPopups: React.FC = () => {
    const [visibleGifts, setVisibleGifts] = useState<GiftItem[]>([]);
    const [currentGiftIndex, setCurrentGiftIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const loadGifts = async () => {
            const items = await fetchVisibleGiftItems();
            // Take up to 3 special gifts (or all if few)
            setVisibleGifts(items.slice(0, 3));
        };
        loadGifts();
    }, []);

    useEffect(() => {
        if (visibleGifts.length === 0) return;

        const showNextGift = () => {
            setIsVisible(true);

            // Stay visible for 5 seconds
            const hideTimeout = setTimeout(() => {
                setIsVisible(false);

                // Wait 3 seconds before showing the next one
                const nextTimeout = setTimeout(() => {
                    setCurrentGiftIndex((prev) => (prev + 1) % visibleGifts.length);
                }, 3000);

                return () => clearTimeout(nextTimeout);
            }, 5000);

            return () => clearTimeout(hideTimeout);
        };

        const initialTimeout = setTimeout(showNextGift, 2000);
        return () => clearTimeout(initialTimeout);
    }, [visibleGifts, currentGiftIndex]);

    if (visibleGifts.length === 0) return null;

    const currentGift = visibleGifts[currentGiftIndex];

    return (
        <div className="fixed bottom-32 left-8 z-[100] perspective-1000">
            <div className={`
                transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${isVisible ? 'opacity-100 translate-y-0 scale-100 rotate-0' : 'opacity-0 translate-y-20 scale-50 -rotate-12 pointer-events-none'}
            `}>
                <div className="relative group">
                    {/* Glowing effect background */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 animate-pulse" />

                    <div className="relative flex items-center gap-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 p-4 rounded-2xl shadow-2xl overflow-hidden min-w-[300px]">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                        <div className="w-20 h-20 shrink-0 bg-white/20 rounded-xl flex items-center justify-center border border-white/40 shadow-inner overflow-hidden">
                            {currentGift.image_url ? (
                                <img src={currentGift.image_url} alt={currentGift.name} className="w-full h-full object-contain p-1" />
                            ) : (
                                <span className="text-4xl drop-shadow-lg">{currentGift.emoji}</span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-yellow-300 text-xs font-bold tracking-widest uppercase mb-1 drop-shadow-md">
                                Special Gift
                            </span>
                            <h3 className="font-bengali text-white text-2xl font-black tracking-tight drop-shadow-lg">
                                {currentGift.name}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-yellow-400 text-sm">✦</span>
                                <span className="text-white/80 text-[10px] font-medium tracking-wider">WIN THIS NOW</span>
                            </div>
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
