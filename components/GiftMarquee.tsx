
import React, { useEffect, useState } from 'react';
import { fetchVisibleGiftItems, GiftItem } from '../services/giftService';

const GiftMarquee: React.FC = () => {
    const [gifts, setGifts] = useState<GiftItem[]>([]);

    useEffect(() => {
        fetchVisibleGiftItems().then(setGifts);
    }, []);

    if (gifts.length === 0) return null;

    // Duplicate list for seamless infinite scroll
    const doubledGifts = [...gifts, ...gifts];

    return (
        <div className="w-full bg-black/60 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] border-t border-white/10 py-2.5 overflow-hidden relative">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

            <div className="flex gift-marquee-track">
                {doubledGifts.map((gift, idx) => (
                    <div
                        key={`${gift.id}-${idx}`}
                        className="flex items-center gap-2 px-6 shrink-0"
                    >
                        {gift.image_url ? (
                            <img
                                src={gift.image_url}
                                alt={gift.name}
                                className="w-16 h-16 object-contain rounded-lg"
                            />
                        ) : (
                            <span className="text-3xl">{gift.emoji}</span>
                        )}
                        <span className="font-bengali text-white font-bold text-lg whitespace-nowrap drop-shadow-md">
                            {gift.name}
                        </span>
                        <span className="text-yellow-400 text-xl mx-2">✦</span>
                    </div>
                ))}
            </div>

            <style>{`
        .gift-marquee-track {
          animation: giftScroll 30s linear infinite;
          width: max-content;
        }
        @keyframes giftScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .gift-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
        </div>
    );
};

export default GiftMarquee;
