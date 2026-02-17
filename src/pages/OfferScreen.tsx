
import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import Header from '../../components/Header';
import CountdownTimer from '../../components/CountdownTimer';

import { fetchActiveOffer } from '../../services/offerService';
import { fetchActiveTheme, ThemeSettings } from '../../services/themeService';
import { Offer, Course } from '../../types';

const OfferScreen: React.FC = () => {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
    const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOffer = async () => {
            const activeOffer = await fetchActiveOffer();
            setOffer(activeOffer);
            if (activeOffer && activeOffer.courses) {
                setCourses(activeOffer.courses);
            }
        };

        const loadTheme = async () => {
            const theme = await fetchActiveTheme();
            if (theme) setThemeSettings(theme);
        };

        Promise.all([loadOffer(), loadTheme()]).then(() => {
            setLoading(false);
        });
    }, []);

    // Course Cycling Logic
    useEffect(() => {
        if (courses.length > 1) {
            const interval = setInterval(() => {
                setCurrentCourseIndex(prevIndex => (prevIndex + 1) % courses.length);
            }, 6000); // Cycle every 6 seconds
            return () => clearInterval(interval);
        }
    }, [courses]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-brand-blue text-2xl animate-pulse">Loading...</div>;
    }

    // Default Fallback Data if no offer/courses are active
    const targetDate = offer ? new Date(offer.end_time).getTime() : new Date().getTime();

    // Dynamic Header Text from Theme
    const headerText1 = themeSettings?.header_text_1 || "Ramadan Special";
    const headerText2 = themeSettings?.header_text_2 || "150 Hours";

    // Logic for Current Course to Display
    const currentCourse = courses.length > 0 ? courses[currentCourseIndex] : null;

    // Use fetched course data OR Fallback defaults
    const displayTitle = currentCourse ? currentCourse.title : "Full Stack Web Development";
    const originalPrice = currentCourse ? currentCourse.original_price : 500;
    const discountedPrice = currentCourse ? currentCourse.discounted_price : 199;

    // Warning Logic: Check if offer is ending soon (e.g., < 2 hours)
    // 2 hours = 2 * 60 * 60 * 1000 = 7200000 ms
    const timeLeft = targetDate - new Date().getTime();
    const isEndingSoon = timeLeft > 0 && timeLeft < 7200000;

    // Background Style
    const bgStyle = themeSettings?.background_style === 'theme-2'
        ? { backgroundImage: "url('/bg-theme-2.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }
        : {}; // Default fallbacks to CSS class or empty

    return (
        <div
            className={`main-container min-h-screen flex flex-col animate-fade-in relative overflow-hidden ${themeSettings?.background_style === 'default' ? 'bg-brand-blue/5' : ''}`}
            style={bgStyle}
        >
            {/* Overlay for readability if using image bg */}
            {themeSettings?.background_style === 'theme-2' && (
                <div className="absolute inset-0 bg-white/40 z-0"></div>
            )}

            <Header />

            <main className="flex-grow flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 gap-12 lg:gap-20 py-12 relative z-10">
                {/* Left Section: Pricing Card Container */}
                {timeLeft > 0 && (
                    <div className="flex flex-col items-center text-center lg:items-center max-w-3xl -mt-10 md:-mt-20">
                        {/* Pricing Card */}
                        <div key={currentCourseIndex} className="bg-white border-4 border-brand-blue rounded-3xl p-8 w-full max-w-xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 relative overflow-hidden group animate-flip-in">
                            <div className="absolute top-0 right-0 bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                                {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% OFF
                            </div>

                            {/* Course Title (Dynamic) */}
                            <div className="h-24 flex items-center justify-center mb-6">
                                <h2 className="text-3xl md:text-4xl font-black text-brand-blue text-center leading-tight drop-shadow-sm">
                                    {displayTitle}
                                </h2>
                            </div>

                            <div className="border-t-2 border-dashed border-gray-200 my-6"></div>

                            {/* Pricing Section (Dynamic) */}
                            <div className="text-center">
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Regular Fee</div>
                                <div className="text-3xl md:text-5xl font-black text-gray-900 line-through decoration-4 decoration-brand-red/70 mb-4 opacity-80">
                                    ৳{originalPrice}
                                </div>

                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-brand-red blur-lg opacity-30 rounded-full animate-pulse-slow"></div>
                                    <div className="bg-brand-red text-white text-6xl md:text-8xl font-black px-8 py-2 rounded-2xl shadow-xl transform group-hover:scale-105 transition-transform duration-300 relative z-10 rotate-2">
                                        ৳{discountedPrice}
                                    </div>
                                </div>
                                <div className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
                                    Limited Slots Available
                                </div>
                            </div>

                            {/* Course Indicators */}
                            {courses.length > 1 && (
                                <div className="flex justify-center gap-2 mt-6">
                                    {courses.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`h-2 w-2 rounded-full transition-all duration-300 ${idx === currentCourseIndex ? 'bg-brand-red w-6' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Section: Jackpot Highlight */}
                {/* Dynamically center if offer is ended (no card on left) */}
                <div className={`hidden lg:flex flex-col ${timeLeft <= 0 ? 'items-center border-none pl-0 text-center' : 'items-start border-l-4 border-brand-red pl-16 text-left'} py-10 relative w-full lg:w-auto flex-1 transition-all duration-500`}>
                    {isEndingSoon && (
                        <div className="absolute -top-10 left-10 bg-red-600 text-white px-4 py-1 rounded-full font-bold animate-bounce shadow-lg z-20">
                            ⚠️ HURRY! ENDING SOON!
                        </div>
                    )}
                    <div className="flex items-baseline mb-2 ml-2">
                        <span className="text-xl md:text-2xl font-bold text-brand-blue-light uppercase tracking-widest mr-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">{headerText1}</span>
                        <span className="text-3xl md:text-4xl font-serif font-black text-brand-red italic drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse">{headerText2}</span>
                    </div>
                    <div className="headline-font text-[8rem] xl:text-[10rem] leading-none font-black text-brand-blue drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] select-none animate-glow">
                        JACK<span className="text-brand-red">POT</span>
                    </div>
                    <div className={`text-4xl xl:text-6xl font-black -mt-4 tracking-[0.2em] ml-2 ${isEndingSoon ? 'text-red-600 animate-pulse' : 'text-brand-red'} drop-shadow-md`}>
                        OFFER
                    </div>
                    <div className="mt-8 w-full">
                        <CountdownTimer
                            startTime={offer?.start_time}
                            endTime={offer?.end_time}
                        />
                    </div>
                </div>
            </main>

            {/* Bottom Highlighted Message */}
            <div className="w-full bg-gradient-to-r from-brand-red via-pink-600 to-brand-red py-4 text-center text-white relative z-20 shadow-lg animate-pulse-slow">
                <div className="text-xl md:text-3xl font-bold px-4 tracking-wide drop-shadow-md font-bengali">
                    যেকোন কোর্সের সাথে থাকছে নিশ্চিত উপহার <span className="text-yellow-300">(মোবাইল, স্মার্টওয়াচ সহ নিশ্চিত গিফট আইটেম)</span>
                </div>
            </div>


        </div>
    );
};

export default OfferScreen;
