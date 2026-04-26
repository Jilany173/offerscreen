import React, { useState, useEffect } from 'react';
import { fetchTickerMessages, TickerMessage } from '../services/mediaService';

interface TickerProps {
    speed?: number;
    label?: string;
    backgroundColor?: string;
    textColor?: string;
}

const Ticker: React.FC<TickerProps> = ({ 
    speed = 60, 
    label = '📢 আপডেট',
    backgroundColor = 'bg-brand-red', 
    textColor = 'text-white' 
}) => {
    const [messages, setMessages] = useState<TickerMessage[]>([]);

    useEffect(() => {
        const loadMessages = async () => {
            const data = await fetchTickerMessages();
            setMessages(data.filter(m => m.is_active));
        };
        loadMessages();
        const interval = setInterval(loadMessages, 30000); // Sync every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fullText = messages.length > 0 
        ? messages.map(m => m.message).join(' ••• ') 
        : "Welcome to Hexa's Jindabazar. Enjoy our Digital Signage Special Offer!";

    return (
        <div className={`w-full overflow-hidden whitespace-nowrap h-16 flex items-center bg-blue-900/80 backdrop-blur-3xl border-t-2 border-blue-400/30 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]`}>
            {/* Front Label (Fixed) */}
            <div className="bg-brand-red px-6 h-full flex items-center justify-center relative z-20 shadow-[10px_0_20px_rgba(0,0,0,0.3)]">
                <span className="text-white font-black text-xl tracking-tighter uppercase whitespace-nowrap font-bengali">
                    {label}
                </span>
                {/* Triangular Tip */}
                <div className="absolute top-0 right-[-10px] bottom-0 w-0 h-0 border-t-[32px] border-t-transparent border-b-[32px] border-b-transparent border-l-[10px] border-l-brand-red"></div>
            </div>

            {/* Marquee Content */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center">
                <div 
                    className="inline-block animate-marquee whitespace-nowrap"
                    style={{ 
                        animationDuration: `${speed}s`,
                        paddingLeft: '100%' 
                    }}
                >
                    <span className={`text-2xl font-black font-bengali text-white drop-shadow-sm antialiased uppercase`}>
                        {fullText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {fullText}
                    </span>
                </div>
            </div>
            
            <style>{`
                @keyframes marquee {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }
                .animate-marquee {
                    display: inline-block;
                    animation-name: marquee;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                }
            `}</style>
        </div>
    );
};


export default Ticker;
