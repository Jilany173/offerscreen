import React, { useState, useEffect } from 'react';
import { fetchActivePromotions, Promotion } from '../../services/promotionService';
import { fetchActiveTheme, ThemeSettings } from '../../services/themeService';
import { fetchActiveBackground, BackgroundImage } from '../../services/backgroundService';

const typeLabel: Record<string, string> = {
    notice: '📢 নোটিশ',
    achievement: '🏆 অর্জন',
    event: '🎉 ইভেন্ট',
};

const typeBg: Record<string, string> = {
    notice: 'from-blue-600 to-blue-800',
    achievement: 'from-yellow-500 to-orange-600',
    event: 'from-purple-600 to-pink-600',
};

const PromotionScreen: React.FC = () => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<ThemeSettings | null>(null);
    const [activeBg, setActiveBg] = useState<BackgroundImage | null>(null);

    useEffect(() => {
        const load = async () => {
            const [proms, t, bg] = await Promise.all([
                fetchActivePromotions(),
                fetchActiveTheme(),
                fetchActiveBackground(),
            ]);
            setPromotions(proms);
            setTheme(t);
            setActiveBg(bg);
            setLoading(false);
        };
        load();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        if (promotions.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % promotions.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [promotions]);

    // Periodic reload (same as OfferScreen)
    useEffect(() => {
        const mins = theme?.auto_reload_interval || 20;
        const t = setInterval(() => window.location.reload(), mins * 60 * 1000);
        return () => clearInterval(t);
    }, [theme?.auto_reload_interval]);

    let bgStyle: React.CSSProperties = { backgroundColor: '#1e3a5f' };
    if (activeBg) {
        bgStyle = { backgroundImage: `url('${activeBg.image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (theme?.background_style === 'theme-2') {
        bgStyle = { backgroundImage: "url('/bg-theme-2.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-blue text-white text-3xl animate-pulse font-bengali">
                লোড হচ্ছে...
            </div>
        );
    }

    if (promotions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
                <div className="absolute inset-0 bg-black/70 z-0" />
                <div className="relative z-10 text-center text-white font-bengali">
                    <div className="text-6xl mb-4">📢</div>
                    <div className="text-3xl font-bold">কোনো প্রমোশন নেই</div>
                    <div className="text-gray-300 mt-2">Admin Panel থেকে প্রমোশন যোগ করুন</div>
                </div>
            </div>
        );
    }

    const promo = promotions[current];
    const gradientClass = typeBg[promo.type] || 'from-blue-600 to-blue-800';

    return (
        <div className="w-full min-h-screen flex flex-col overflow-hidden relative" style={bgStyle}>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/65 z-0" />

            {/* Header Bar */}
            <div className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                    {/* Logo / Institute name */}
                    <div className="text-white font-black text-3xl tracking-tight drop-shadow font-bengali">
                        হেক্সাস আইটি
                    </div>
                    <div className="h-8 w-px bg-white/30" />
                    <div className="text-white/70 text-lg font-bengali">অফিস বোর্ড</div>
                </div>
                {/* Clock */}
                <LiveClock />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-center justify-center px-10 py-8">
                <div
                    key={current}
                    className="w-full max-w-4xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in"
                >
                    {/* Type badge + title bar */}
                    <div className={`bg-gradient-to-r ${gradientClass} px-10 py-5 flex items-center gap-4`}>
                        <span className="text-4xl">{promo.emoji}</span>
                        <div>
                            <div className="text-white/80 text-sm font-medium font-bengali">
                                {typeLabel[promo.type] || '📢 নোটিশ'}
                            </div>
                            <h1 className="text-white font-black text-3xl md:text-4xl leading-tight font-bengali drop-shadow-md">
                                {promo.title}
                            </h1>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-10 py-8">
                        {promo.subtitle && (
                            <p className="text-white/60 text-lg mb-4 font-bengali">{promo.subtitle}</p>
                        )}
                        {promo.image_url && (
                            <img
                                src={promo.image_url}
                                alt={promo.title}
                                className="w-full max-h-64 object-cover rounded-2xl mb-6 shadow-lg"
                            />
                        )}
                        {promo.content && (
                            <p className="text-white text-2xl md:text-3xl leading-relaxed font-bengali whitespace-pre-wrap">
                                {promo.content}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide Indicators */}
            {promotions.length > 1 && (
                <div className="relative z-10 flex justify-center gap-3 pb-6">
                    {promotions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-3 rounded-full transition-all duration-300 ${idx === current ? 'bg-white w-10' : 'bg-white/30 w-3'}`}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="relative z-10 text-center pb-4 text-white/30 text-sm font-bengali">
                মোট {promotions.length}টি প্রমোশন
            </div>
        </div>
    );
};

// Real-time clock component
const LiveClock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    return (
        <div className="text-white text-right">
            <div className="text-2xl font-bold font-mono tabular-nums">
                {time.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-white/60 text-sm font-bengali">
                {time.toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>
    );
};

export default PromotionScreen;
