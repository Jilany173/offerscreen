
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchVisibleGiftItems, GiftItem } from '../services/giftService';

const POPUP_INTERVAL = 15000;   // Show every 15 seconds
const SCRATCH_DURATION = 2000;  // Scratch animation: 2 seconds
const REVEAL_DURATION = 4000;   // Stay revealed: 4 seconds

type Phase = 'hidden' | 'showing' | 'scratching' | 'revealed';

const AutoScratchCard: React.FC = () => {
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [currentGift, setCurrentGift] = useState<GiftItem | null>(null);
    const [phase, setPhase] = useState<Phase>('hidden');
    const indexRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchVisibleGiftItems().then(setGifts);
    }, []);

    const clearTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const runCycle = useCallback((giftList: GiftItem[]) => {
        if (giftList.length === 0) return;

        // Pick next gift (cycle through all)
        const gift = giftList[indexRef.current % giftList.length];
        indexRef.current += 1;

        setCurrentGift(gift);
        setPhase('showing');

        // After 0.5s: start scratch animation
        timerRef.current = setTimeout(() => {
            setPhase('scratching');

            // After scratch animation: reveal
            timerRef.current = setTimeout(() => {
                setPhase('revealed');

                // After reveal duration: hide and schedule next
                timerRef.current = setTimeout(() => {
                    setPhase('hidden');
                    timerRef.current = setTimeout(() => runCycle(giftList), POPUP_INTERVAL);
                }, REVEAL_DURATION);
            }, SCRATCH_DURATION);
        }, 500);
    }, []);

    useEffect(() => {
        if (gifts.length === 0) return;

        // Clear any existing timers before setting a new one
        clearTimer();

        // First popup: wait 5 seconds after load
        timerRef.current = setTimeout(() => runCycle(gifts), 5000);
        return () => clearTimer();
    }, [gifts, runCycle]);

    if (phase === 'hidden' || !currentGift) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
            style={{ background: phase === 'revealed' ? 'rgba(0,0,0,0.35)' : 'transparent', transition: 'background 0.5s' }}
        >
            <div
                className={`relative transition-all duration-500 ${phase === 'showing' ? 'opacity-0 scale-75' :
                    phase === 'scratching' ? 'opacity-100 scale-100' :
                        'opacity-100 scale-110'
                    }`}
            >
                {/* Card */}
                <div className="relative w-72 h-96 rounded-3xl shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 0 60px rgba(255, 215, 0, 0.8), 0 0 120px rgba(255, 215, 0, 0.3)' }}>

                    {/* Golden scratch surface */}
                    <div
                        className={`absolute inset-0 z-10 flex items-center justify-center transition-all`}
                        style={{
                            background: 'linear-gradient(135deg, #f6d365 0%, #fda085 25%, #f6d365 50%, #fda085 75%, #f6d365 100%)',
                            backgroundSize: '400% 400%',
                            animation: phase === 'scratching' ? 'goldenShimmer 0.3s linear infinite, scratchReveal 2s forwards' : 'goldenShimmer 2s ease infinite',
                            opacity: phase === 'revealed' ? 0 : 1,
                            clipPath: phase === 'scratching'
                                ? undefined
                                : undefined,
                        }}
                    >
                        {/* Scratch texture lines */}
                        <div className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 5px)',
                            }}
                        />
                        <div className="text-center">
                            <div className="text-6xl mb-3">🎴</div>
                            <p className="font-bengali text-white font-black text-xl drop-shadow-lg">স্ক্র্যাচ করুন!</p>
                        </div>
                    </div>

                    {/* Revealed gift underneath */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                        {/* Stars decoration */}
                        <div className="absolute inset-0 overflow-hidden opacity-30">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute text-yellow-300 text-sm animate-pulse"
                                    style={{ left: `${Math.random() * 90 + 5}%`, top: `${Math.random() * 90 + 5}%`, animationDelay: `${i * 0.2}s` }}>
                                    ✦
                                </div>
                            ))}
                        </div>

                        <div className={`text-center z-10 transition-all duration-500 ${phase === 'revealed' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                            <div className="text-8xl mb-4 drop-shadow-2xl">
                                {currentGift.image_url ? (
                                    <img src={currentGift.image_url} alt={currentGift.name} className="w-28 h-28 object-contain mx-auto rounded-2xl shadow-xl" />
                                ) : (
                                    currentGift.emoji
                                )}
                            </div>
                            <div className="bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                                🎁 আপনার পুরস্কার
                            </div>
                            <p className="font-bengali text-white font-black text-2xl leading-tight drop-shadow-lg px-4">
                                {currentGift.name}
                            </p>
                            <p className="font-bengali text-yellow-300 text-sm mt-2 opacity-80">
                                যেকোন কোর্সে ভর্তি হলে পাবেন!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Shimmer ring animation */}
                <div className={`absolute -inset-3 rounded-3xl border-4 border-yellow-400 opacity-70 ${phase === 'revealed' ? 'animate-pulse' : ''}`} />
            </div>

            <style>{`
        @keyframes goldenShimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        @keyframes scratchReveal {
          0%   { clip-path: inset(0 0 0 0); opacity: 1; }
          50%  { clip-path: inset(0 50% 0 0); opacity: 0.8; }
          100% { clip-path: inset(0 0 100% 0); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default AutoScratchCard;
