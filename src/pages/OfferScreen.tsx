
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
                <div className="flex flex-col items-center text-center lg:items-center max-w-3xl -mt-10 md:-mt-20">
                    <img src={logo} alt="Offer Logo" className="w-64 md:w-80 mb-6 object-contain animate-logo-glow" />


                    {/* Pricing */}
                    {/* Pricing Card */}
                    <div className="bg-white border-2 border-brand-blue rounded-3xl p-8 w-full max-w-md shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue via-brand-red to-brand-blue"></div>

                        <h2 className="text-2xl md:text-3xl font-bold text-brand-blue mb-6 border-b-2 border-brand-blue/10 pb-4" dangerouslySetInnerHTML={{ __html: title }}></h2>

                        <div className="flex flex-col items-center gap-2 mb-6">
                            <div className="text-3xl font-bold text-gray-400 line-through decoration-red-500/50 decoration-2">
                                ${originalPrice}
                            </div>

                            <div className="bg-brand-red text-white text-5xl md:text-7xl font-black py-4 px-10 rounded-2xl shadow-lg transform scale-100 group-hover:scale-105 transition-transform">
                                ${discountedPrice}
                            </div>

                            <div className="mt-4 text-sm font-bold text-brand-blue tracking-widest uppercase">
                                Limited Slots Available
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 px-10 py-5 bg-brand-blue text-white text-2xl font-bold rounded-full hover:bg-brand-red transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl border-4 border-transparent hover:border-brand-blue/20">
                        Claim Your Spot Now
                    </button>
                </div>

                {/* Right Section: Jackpot Highlight */}
                <div className="hidden lg:flex flex-col items-start border-l-4 border-brand-red pl-16 py-10">
                    <div className="text-xl md:text-3xl font-bold text-brand-blue-light uppercase tracking-widest mb-[-1rem] ml-2">
                        Ramadan Special
                    </div>
                    <div className="headline-font text-[8rem] xl:text-[10rem] leading-none font-black text-brand-blue drop-shadow-2xl select-none animate-glow">
                        JACK<span className="text-brand-red">POT</span>
                    </div>
                    <div className="text-4xl xl:text-6xl font-black text-brand-red -mt-4 tracking-[0.2em] ml-2">
                        OFFER
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
