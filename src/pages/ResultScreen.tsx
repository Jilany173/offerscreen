import React, { useState, useEffect } from 'react';
import { fetchActiveAnnouncements, ResultAnnouncement } from '../../services/resultService';
import { fetchActiveTheme, ThemeSettings } from '../../services/themeService';
import { fetchActiveBackground, BackgroundImage } from '../../services/backgroundService';

// Score বার্ড কার্ডের রঙ — স্কোরের উপর ভিত্তি করে
const scoreColor = (score: string): string => {
    const num = parseFloat(score.replace(/[^\d.]/g, ''));
    if (num >= 8) return 'bg-green-500 text-white';
    if (num >= 7) return 'bg-blue-500 text-white';
    if (num >= 6) return 'bg-yellow-500 text-white';
    if (num >= 5) return 'bg-orange-500 text-white';
    return 'bg-red-500 text-white';
};

const ResultScreen: React.FC = () => {
    const [announcements, setAnnouncements] = useState<ResultAnnouncement[]>([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<ThemeSettings | null>(null);
    const [activeBg, setActiveBg] = useState<BackgroundImage | null>(null);

    useEffect(() => {
        const load = async () => {
            const [anns, t, bg] = await Promise.all([
                fetchActiveAnnouncements(),
                fetchActiveTheme(),
                fetchActiveBackground(),
            ]);
            setAnnouncements(anns);
            setTheme(t);
            setActiveBg(bg);
            setLoading(false);
        };
        load();
    }, []);

    // Auto-rotate announcements
    useEffect(() => {
        if (announcements.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent(prev => (prev + 1) % announcements.length);
        }, 10000);
        return () => clearInterval(interval);
    }, [announcements]);

    // Periodic reload
    useEffect(() => {
        const mins = theme?.auto_reload_interval || 20;
        const t = setInterval(() => window.location.reload(), mins * 60 * 1000);
        return () => clearInterval(t);
    }, [theme?.auto_reload_interval]);

    let bgStyle: React.CSSProperties = { backgroundColor: '#0f172a' };
    if (activeBg) {
        bgStyle = { backgroundImage: `url('${activeBg.image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (theme?.background_style === 'theme-2') {
        bgStyle = { backgroundImage: "url('/bg-theme-2.png')", backgroundSize: 'cover', backgroundPosition: 'center' };
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-3xl animate-pulse font-bengali">
                রেজাল্ট লোড হচ্ছে...
            </div>
        );
    }

    if (announcements.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
                <div className="absolute inset-0 bg-black/70 z-0" />
                <div className="relative z-10 text-center text-white font-bengali">
                    <div className="text-6xl mb-4">📊</div>
                    <div className="text-3xl font-bold">কোনো রেজাল্ট প্রকাশিত হয়নি</div>
                    <div className="text-gray-300 mt-2">Admin Panel থেকে রেজাল্ট যোগ করুন</div>
                </div>
            </div>
        );
    }

    const ann = announcements[current];

    return (
        <div className="w-full min-h-screen flex flex-col overflow-hidden relative" style={bgStyle}>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/70 z-0" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="text-white font-black text-3xl tracking-tight font-bengali drop-shadow">
                        হেক্সাস আইটি
                    </div>
                    <div className="h-8 w-px bg-white/30" />
                    <div className="text-yellow-400 font-bold text-xl font-bengali">📊 রেজাল্ট বোর্ড</div>
                </div>
                <ResultClock />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-grow flex items-center justify-center px-8 py-6">
                <div
                    key={current}
                    className="w-full max-w-5xl animate-fade-in"
                >
                    {/* Month/Period Title */}
                    <div className="text-center mb-6">
                        <div className="inline-block bg-yellow-500 text-black font-black text-xl px-6 py-2 rounded-full mb-4 font-bengali shadow-lg">
                            📅 {ann.title}
                        </div>
                        <h1 className="text-white font-black text-4xl md:text-5xl lg:text-6xl leading-tight font-bengali drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                            {ann.headline}
                        </h1>
                    </div>

                    {/* Score Breakdown Grid */}
                    {ann.score_breakdown && ann.score_breakdown.length > 0 && (
                        <div className="mt-8">
                            <div className="text-center text-white/60 text-lg mb-5 font-bengali">স্কোর বিভাজন</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
                                {ann.score_breakdown.map((row, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 min-w-[130px] min-h-[130px] text-center transform hover:scale-105 transition-transform duration-200 ${scoreColor(row.score)}`}
                                        style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
                                    >
                                        <div className="text-5xl font-black leading-none">{row.score}</div>
                                        <div className="text-sm font-bold mt-2 opacity-90 font-bengali">{row.count}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Slide Indicators */}
            {announcements.length > 1 && (
                <div className="relative z-10 flex justify-center gap-3 pb-5">
                    {announcements.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-3 rounded-full transition-all duration-300 ${idx === current ? 'bg-yellow-400 w-10' : 'bg-white/30 w-3'}`}
                        />
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="relative z-10 text-center pb-4 text-white/30 text-sm font-bengali">
                মোট {announcements.length}টি ঘোষণা
            </div>
        </div>
    );
};

const ResultClock: React.FC = () => {
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

export default ResultScreen;
