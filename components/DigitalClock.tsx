import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 p-6 rounded-3xl text-white shadow-2xl flex flex-col items-center min-w-[200px]">
            <div className="text-5xl font-bold font-counter tracking-tighter">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <div className="flex flex-col items-center mt-2">
                <span className="text-brand-red font-bold uppercase tracking-widest text-xs">
                    {days[time.getDay()]}
                </span>
                <span className="text-white/60 text-sm font-medium">
                    {time.getDate()} {months[time.getMonth()]}, {time.getFullYear()}
                </span>
            </div>
        </div>
    );
};

export default DigitalClock;
