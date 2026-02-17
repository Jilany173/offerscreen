
import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import Header from '../../components/Header';
import CountdownTimer from '../../components/CountdownTimer';
import GeminiAdvisor from '../../components/GeminiAdvisor';
import { fetchActiveOffer } from '../../services/offerService';
import { Offer } from '../../types';

const OfferScreen: React.FC = () => {
    const [offer, setOffer] = useState<Offer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOffer = async () => {
            const activeOffer = await fetchActiveOffer();
            setOffer(activeOffer);
            setLoading(false);
        };

        loadOffer();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-brand-blue text-2xl">Loading Offer...</div>;
    }

    // Fallback if no active offer is found, or use fetched data
    const targetDate = offer ? new Date(offer.end_time).getTime() : new Date().getTime();
    const title = offer ? offer.title : "Ramadan Special Jackpot Offer";
    const originalPrice = offer ? offer.original_price : 500;
    const discountedPrice = offer ? offer.discounted_price : 199;

    return (
        <div className="main-container min-h-screen flex flex-col animate-fade-in">
            <Header />

            <main className="flex-grow flex flex-col lg:flex-row items-center justify-center px-6 lg:px-20 gap-12 lg:gap-20 py-12">
                <div className="flex flex-col items-center text-center lg:items-center max-w-3xl">
                    <img src={logo} alt="Offer Logo" className="w-48 md:w-64 mb-6 object-contain" />
                    <h1 className="headline-font text-5xl md:text-7xl font-bold mb-8 text-brand-blue leading-tight" dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }}>
                    </h1>

                    {/* Pricing */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mt-12 animate-pulse-slow">
                        <div className="text-2xl md:text-3xl line-through decoration-4 text-slate-400 decoration-slate-300">
                            Was ${originalPrice}
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-brand-red text-6xl md:text-8xl font-black price-shadow italic">
                                ${discountedPrice}
                            </span>
                            <span className="text-sm md:text-lg uppercase tracking-[0.4em] mt-2 font-semibold text-brand-blue text-center">
                                Limited Enrollment
                            </span>
                        </div>
                    </div>

                    <button className="mt-10 px-8 py-4 bg-brand-red text-white text-xl font-bold rounded-full hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl">
                        Claim Your Spot Now
                    </button>
                </div>

                {/* Right Section: Jackpot Highlight */}
                <div className="hidden lg:flex flex-col items-start border-l-4 border-brand-red pl-16 py-10">
                    <div className="headline-font text-[8rem] xl:text-[10rem] leading-none font-black text-brand-blue drop-shadow-2xl select-none animate-glow">
                        JACK<span className="text-brand-red">POT</span>
                    </div>
                    <div className="text-6xl xl:text-8xl font-black text-brand-red mt-[-1rem] tracking-tighter">
                        150 HOURS
                    </div>
                    <div className="mt-8">
                        <CountdownTimer targetDate={targetDate} />
                    </div>
                </div>
            </main>

            {/* Floating AI Assistant */}
            <GeminiAdvisor />
        </div>
    );
};

export default OfferScreen;
