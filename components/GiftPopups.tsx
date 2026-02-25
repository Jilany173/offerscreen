import React, { useEffect, useState } from 'react';
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
        <div className="fixed top-[140px] right-[40px] z-[9999] perspective-1000">
            <div className={`
                transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] whitespace-nowrap
                ${isVisible ? 'opacity-100 translate-x-0 scale-100 rotate-0' : 'opacity-0 translate-x-[500px] scale-90 rotate-3 pointer-events-none'}
            `}>
                <div className="relative group">
                    {/* Glowing effect background */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 animate-pulse" />

                    <div className="relative flex items-center gap-4 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 backdrop-blur-2xl border-2 border-white/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(30,58,138,0.6)] overflow-hidden min-w-[340px]">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                        <div className="w-24 h-24 shrink-0 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-inner overflow-hidden">
                            {currentGift.image_url ? (
                                <img src={currentGift.image_url} alt={currentGift.name} className="w-full h-full object-contain p-2" />
                            ) : (
                                <span className="text-5xl drop-shadow-2xl">{currentGift.emoji}</span>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-yellow-400 text-[10px] font-black tracking-[0.2em] uppercase mb-1 drop-shadow-md">
                                SPECIAL GIFT
                            </span>
                            <h3 className="font-bengali text-white text-3xl font-black tracking-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
                                {currentGift.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-yellow-400 text-sm animate-pulse">✦</span>
                                <span className="text-white/90 text-xs font-bold tracking-widest">GET IT NOW</span>
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
