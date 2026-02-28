
import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import CountdownTimer from '../../components/CountdownTimer';
import GiftMarquee from '../../components/GiftMarquee';
import GiftPopups from '../../components/GiftPopups';
import Footer from '../../components/Footer';
import UpcomingOfferScreen from '../../components/UpcomingOfferScreen';

import { fetchActiveOffer, fetchUpcomingOffer } from '../../services/offerService';
import { fetchActiveTheme, ThemeSettings } from '../../services/themeService';
import { fetchActiveBackground, BackgroundImage } from '../../services/backgroundService';
import { Offer, Course } from '../../types';

const OfferScreen: React.FC = () => {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [upcomingOffer, setUpcomingOffer] = useState<Offer | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
    const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeBackground, setActiveBackground] = useState<BackgroundImage | null>(null);

    const [isEnded, setIsEnded] = useState(false);
    const wakeLockRef = useRef<any>(null);

    // Screen Wake Lock API to prevent TV from sleeping
    useEffect(() => {
        const requestWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    // @ts-ignore
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                    console.log('Screen Wake Lock is active');

                    // Re-request if visibility changes
                    // @ts-ignore
                    wakeLockRef.current.addEventListener('release', () => {
                        console.log('Screen Wake Lock was released');
                    });
                } catch (err: any) {
                    console.error(`${err.name}, ${err.message}`);
                }
            } else {
                console.warn('Screen Wake Lock API not supported by this browser.');
            }
        };

        const handleVisibilityChange = async () => {
            if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
                await requestWakeLock();
            }
        };

        requestWakeLock();
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (wakeLockRef.current !== null) {
                // @ts-ignore
                wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const loadOffer = async () => {
            const activeOffer = await fetchActiveOffer();
            if (activeOffer) {
                setOffer(activeOffer);
                if (activeOffer.courses) setCourses(activeOffer.courses);
            } else {
                // চলমান অফার নেই — upcoming খোঁজো
                const upcoming = await fetchUpcomingOffer();
                setUpcomingOffer(upcoming);
            }
        };

        const loadTheme = async () => {
            const theme = await fetchActiveTheme();
            if (theme) setThemeSettings(theme);
        };

        const loadBackground = async () => {
            const bg = await fetchActiveBackground();
            setActiveBackground(bg);
        };

        Promise.all([loadOffer(), loadTheme(), loadBackground()]).then(() => {
            setLoading(false);
        });
    }, []);

    // Check for expiration in real-time
    useEffect(() => {
        if (!offer) return;
        const checkExpiration = () => {
            const now = new Date().getTime();
            const end = new Date(offer.end_time).getTime();
            if (now >= end && !isEnded) {
                setIsEnded(true);
            }
        };
        checkExpiration();
        const interval = setInterval(checkExpiration, 1000);
        return () => clearInterval(interval);
    }, [offer, isEnded]);

    // Course Cycling Logic
    useEffect(() => {
        if (courses.length > 1 && !isEnded) {
            const intervalTime = (themeSettings?.card_rotation_interval || 6) * 1000;
            const interval = setInterval(() => {
                setCurrentCourseIndex(prevIndex => (prevIndex + 1) % courses.length);
            }, intervalTime); // Dynamic cycle time
            return () => clearInterval(interval);
        }
    }, [courses, isEnded, themeSettings?.card_rotation_interval]);

    // Periodic Hard Reload to prevent TV Browser freezing (configurable via Admin Panel)
    useEffect(() => {
        const intervalMinutes = themeSettings?.auto_reload_interval || 20; // Default to 20 minutes
        const reloadInterval = setInterval(() => {
            console.log(`Performing periodic hard reload to prevent freezing (every ${intervalMinutes} minutes)...`);
            window.location.reload();
        }, intervalMinutes * 60 * 1000);

        return () => clearInterval(reloadInterval);
    }, [themeSettings?.auto_reload_interval]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-brand-blue text-2xl animate-pulse">Loading...</div>;
    }



    const headerText1 = themeSettings?.header_text_1 || "Ramadan Special";
    const headerText2 = themeSettings?.header_text_2 || "150 Hours";

    const currentCourse = courses.length > 0 ? courses[currentCourseIndex] : null;

    const displayTitle = currentCourse ? currentCourse.title : "Full Stack Web Development";
    const originalPrice = currentCourse ? currentCourse.original_price : 500;
    const discountedPrice = currentCourse ? currentCourse.discounted_price : 199;

    const targetDate = offer ? new Date(offer.end_time).getTime() : new Date().getTime();
    const timeLeft = targetDate - new Date().getTime();
    const isEndingSoon = timeLeft > 0 && timeLeft < 7200000;

    let bgStyle: React.CSSProperties = {};
    if (activeBackground) {
        bgStyle = { backgroundImage: `url('${activeBackground.image_url}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    } else if (themeSettings?.background_style === 'theme-2') {
        bgStyle = { backgroundImage: "url('/bg-theme-2.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' };
    }

    // আপকামিং অফার স্ক্রিন
    if (!offer && upcomingOffer) {
        return (
            <UpcomingOfferScreen
                offer={upcomingOffer}
                language={themeSettings?.timer_language || 'bn'}
                bgStyle={bgStyle}
            />
        );
    }

    // Offer Ended Screen (Clean View)
    if (isEnded) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden" style={bgStyle}>
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/60 z-0"></div>
                <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fade-in scale-110 md:scale-150">
                    <div className="headline-font text-6xl md:text-9xl text-brand-red font-black drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] select-none tracking-tighter">
                        OFFER <span className="text-gray-900">ENDED</span>
                    </div>
                    <div className="mt-4 w-32 md:w-64 h-2 bg-brand-red rounded-full opacity-50 animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full h-screen flex justify-center bg-gray-50 overflow-hidden">
                <div
                    className={`main-container w-full max-w-[1920px] h-screen flex flex-col animate-fade-in relative overflow-hidden shadow-2xl ${themeSettings?.background_style === 'default' ? 'bg-brand-blue/5' : ''}`}
                    style={bgStyle}
                >
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-black/60 z-0"></div>

                    <Header />

                    <main className="flex-grow flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 gap-8 lg:gap-20 py-4 relative z-10 overflow-hidden">
                        {/* Left Section: Pricing Card Container */}
                        <div className="flex flex-col items-center text-center lg:items-center w-full max-w-[550px] min-h-[500px] justify-center mt-2 md:mt-4">
                            {/* Pricing Card */}
                            <div key={currentCourseIndex} className="bg-white border-4 border-brand-blue rounded-3xl pt-10 px-8 pb-12 w-full max-w-xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 relative overflow-hidden group animate-flip-in">


                                {/* Course Title (Dynamic) */}
                                <div className="h-24 flex items-center justify-center mb-4">
                                    <h2 className="text-2xl md:text-3xl font-black text-brand-blue text-center leading-tight drop-shadow-sm">
                                        {displayTitle}
                                    </h2>
                                </div>
                                <div className="border-t-2 border-dashed border-gray-200 my-6"></div>
                                {/* Pricing Section (Dynamic) */}
                                <div className="text-center">
                                    <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Regular Fee</div>
                                    <div className="text-2xl md:text-4xl font-black text-gray-900 line-through decoration-4 decoration-brand-red/70 mb-6 opacity-80">
                                        ৳{originalPrice.toLocaleString('en-IN')}
                                    </div>

                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-brand-red blur-lg opacity-30 rounded-full animate-pulse-slow"></div>
                                        <div className="bg-brand-red text-white text-6xl md:text-8xl font-black px-8 py-2 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300 relative z-10 rotate-2">
                                            ৳{discountedPrice.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>

                                {/* Course Indicators */}
                                {courses.length > 1 && (
                                    <div className="flex justify-center gap-2 mt-10">
                                        {courses.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${idx === currentCourseIndex ? 'bg-brand-red w-8' : 'bg-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Relocated Promotional Text - More Eye-Catching & Premium */}
                            <div className="mt-6 flex flex-col items-center w-full scale-90 md:scale-95 origin-top">
                                <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white px-8 py-2 rounded-t-2xl shadow-[0_0_15px_rgba(37,99,235,0.4)] border-b border-white/20 w-full max-w-lg flex items-center justify-center relative z-20">
                                    <h2 className="font-bengali text-base md:text-xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] antialiased text-white text-center">
                                        হেক্সাস জিন্দাবাজারে অফারে শুধু ছাড় নয়
                                    </h2>
                                </div>
                                <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white px-10 py-3 rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.4)] w-full max-w-2xl flex items-center justify-center transform -mt-1 border-2 border-white/30 relative z-30 transition-all hover:scale-[1.02] duration-300">
                                    <h2 className="font-bengali text-lg md:text-2xl font-black tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] antialiased text-white whitespace-nowrap text-center">
                                        সাথে থাকছে ২০টি+ বিশেষ উপহারের কুপন।
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Right Section: Jackpot Highlight */}
                        <div className={`hidden lg:flex flex-col items-start border-l-4 border-brand-red pl-10 text-left py-6 relative w-full lg:w-auto flex-1 transition-all duration-500`}>
                            {isEndingSoon && (
                                <div className="absolute -top-10 left-10 bg-red-600 text-white px-4 py-1 rounded-full font-bold animate-bounce shadow-lg z-20">
                                    ⚠️ HURRY! ENDING SOON!
                                </div>
                            )}
                            {/* Header */}
                            <div className="flex items-baseline mb-4 ml-2 gap-2">
                                <span className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{headerText1}</span>
                                <span
                                    className="text-4xl md:text-5xl font-black text-brand-red animate-pulse"
                                    style={{ textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 0 0 16px rgba(0,0,0,0.8)', letterSpacing: '0.05em' }}
                                >{headerText2}</span>
                            </div>

                            {/* GOLDEN RUSH */}
                            <div
                                className="headline-font text-[5rem] xl:text-[7rem] leading-[0.9] font-black select-none whitespace-nowrap text-white"
                                style={{
                                    textShadow: '3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0 0 20px rgba(0,0,0,0.8), 0 6px 12px rgba(0,0,0,0.6)'
                                }}>
                                GOLDEN <span className="text-yellow-300">RUSH</span>
                            </div>

                            {/* OFFER */}
                            <div
                                className={`text-5xl xl:text-7xl font-black mt-0 tracking-[0.25em] ml-2 ${isEndingSoon ? 'animate-pulse' : ''}`}
                                style={{ color: '#dc2626', textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>
                                OFFER
                            </div>

                            <div className="mt-4 w-full flex justify-center lg:justify-start lg:w-auto lg:mx-auto">
                                <CountdownTimer
                                    startTime={offer?.start_time}
                                    endTime={offer?.end_time}
                                    language={themeSettings?.timer_language}
                                />
                            </div>
                        </div>
                    </main>

                    {/* Footer Added Here */}
                    <div className={themeSettings?.show_gift_marquee === false ? 'pb-12' : 'pb-0'}>
                        <Footer />
                    </div>

                    {/* Gift Display Components */}
                    {themeSettings?.show_gift_marquee !== false && <GiftMarquee />}
                    {themeSettings?.show_gift_popups !== false && <GiftPopups />}
                </div>
            </div>
        </>
    );
};

export default OfferScreen;
