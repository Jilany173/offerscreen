import React from 'react';
import { motion } from 'framer-motion';
import { Offer } from '../types';
import CountdownTimer from './CountdownTimer';

interface CampaignSlideProps {
    offer: Offer;
}

const CampaignSlide: React.FC<CampaignSlideProps> = ({ offer }) => {
    const courses = offer.courses || [];
    
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#020617]"
        >
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/4 w-full h-full bg-blue-600/30 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 1 }}
                    className="absolute -bottom-1/2 -right-1/4 w-full h-full bg-red-600/20 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                
                {/* Left Side: Offer Card */}
                <motion.div 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex-shrink-0 w-full max-w-[500px]"
                >
                    <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[8px] border-brand-blue relative">
                        {/* Ribbon */}
                        <div className="absolute -top-6 -right-6 bg-brand-red text-white font-black px-6 py-2 rounded-2xl shadow-xl transform rotate-12 text-xl">
                            LIMITED!
                        </div>

                        <div className="text-center space-y-6">
                            <span className="text-sm font-black text-blue-500 uppercase tracking-[0.3em]">Special Campaign</span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                {offer.title}
                            </h2>
                            
                            <div className="h-1 w-24 bg-gray-200 mx-auto rounded-full"></div>

                            <div className="flex flex-col items-center gap-1">
                                <span className="text-gray-400 font-bold uppercase text-xs">Starting From</span>
                                <div className="text-7xl md:text-8xl font-black text-brand-red tracking-tighter">
                                    ৳{courses[0]?.discounted_price.toLocaleString('en-IN') || '???'}
                                </div>
                            </div>

                            <div className="pt-8">
                                <CountdownTimer 
                                    startTime={offer.start_time}
                                    endTime={offer.end_time}
                                    language="bn"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Side: Headlines */}
                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="flex-1 space-y-8 text-center lg:text-left"
                >
                    <div className="inline-flex items-center gap-3 bg-red-600 text-white px-6 py-2 rounded-full font-black text-lg shadow-lg">
                         🔥 ধামাকা অফার চলছে
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-none drop-shadow-2xl">
                        JOIN THE <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-red-400">SUCCESS</span> <br/>
                        JOURNEY
                    </h1>

                    <p className="text-xl md:text-2xl font-bold text-blue-100/70 font-bengali leading-relaxed max-w-2xl">
                        আমাদের এই বিশেষ অফারে কোর্সগুলোতে পাচ্ছেন অবিশ্বাস্য ছাড়। আজই আপনার আসন নিশ্চিত করুন!
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        {courses.slice(0, 3).map((c, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10 flex flex-col">
                                <span className="text-[10px] font-black text-blue-300 uppercase">{c.title}</span>
                                <span className="text-lg font-black text-white">৳{c.discounted_price}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
            
            {/* Bottom Bar Styling */}
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600" />
        </motion.div>
    );
};

export default CampaignSlide;
