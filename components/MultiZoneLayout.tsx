import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MediaCarousel from './MediaCarousel';
import Ticker from './Ticker';
import DigitalClock from './DigitalClock';
import { fetchSignageSettings, fetchTickerMessages, updateHeartbeat, TickerMessage } from '../services/mediaService';
import logo from '../src/assets/logo.png';

const MultiZoneLayout: React.FC = () => {
    const [settings, setSettings] = useState<Record<string, string>>({
        show_clock: 'true',
        show_weather: 'true',
        weather_city: 'Sylhet',
        qr_code_url: 'https://hz.jkcshiru.com'
    });
    const [messages, setMessages] = useState<TickerMessage[]>([]);

    const [weather, setWeather] = useState<{ temp: number; icon: string }>({ temp: 25, icon: '⛅' });

    const fetchWeather = async (city: string) => {
        try {
            // Step 1: Geocoding (City to Lat/Long)
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                console.warn("City not found for weather");
                return;
            }

            const { latitude, longitude } = geoData.results[0];

            // Step 2: Fetch Weather using Coordinates
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            const weatherData = await weatherRes.json();

            if (weatherData.current_weather) {
                const temp = Math.round(weatherData.current_weather.temperature);
                const code = weatherData.current_weather.weathercode;

                // Weather Code Mapping
                let icon = '☀️';
                if (code >= 1 && code <= 3) icon = '⛅';
                if (code >= 45 && code <= 48) icon = '🌫️';
                if (code >= 51 && code <= 67) icon = '🌧️';
                if (code >= 71 && code <= 77) icon = '❄️';
                if (code >= 80 && code <= 82) icon = '🌦️';
                if (code >= 95) icon = '⛈️';

                setWeather({ temp, icon });
            }
        } catch (err) {
            console.error("Advanced Weather fetch error:", err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            const [settingsData, msgsData] = await Promise.all([
                fetchSignageSettings(),
                fetchTickerMessages()
            ]);
            if (Object.keys(settingsData).length > 0) {
                setSettings(prev => ({ ...prev, ...settingsData }));
                if (settingsData.weather_city) fetchWeather(settingsData.weather_city);
            }
            setMessages(msgsData.filter(m => m.is_active));
        };

        // Heartbeat
        updateHeartbeat();
        const heartbeatInterval = setInterval(updateHeartbeat, 30000);

        loadData();
        const interval = setInterval(loadData, 300000); // Sync data and weather every 5 mins
        return () => {
            clearInterval(interval);
            clearInterval(heartbeatInterval);
        };
    }, []);

    const TickerMessageList = () => (
        <div className="flex flex-col gap-3">
            {messages.map((m, index) => (
                <div key={m.id} className="flex gap-3 items-start animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <span className="text-brand-red font-black text-lg leading-none mt-1">•</span>
                    <p className="text-white/90 text-sm font-semibold leading-relaxed">
                        {m.message}
                    </p>
                </div>
            ))}
            {messages.length === 0 && <p className="text-white/40 text-xs text-center italic">No active announcements</p>}
        </div>
    );


    return (
        <div className="relative w-full h-screen bg-black flex flex-col overflow-hidden text-white font-sans antialiased">

            {/* Main Content Area (Multi-Zone) */}
            <div className="flex-1 relative flex">

                {/* Main Media Player */}
                <div className="flex-1 relative overflow-hidden">
                    <MediaCarousel />
                </div>

                {/* Top Left: Logo */}
                {settings.show_logo === 'true' && (
                    <div className="absolute top-10 left-10 z-50">
                        <img
                            src={logo}
                            alt="Hexa's Logo"
                            className="h-20 md:h-24 w-auto drop-shadow-[0_0_25px_rgba(255,255,255,0.7)] filter brightness-110"
                        />
                    </div>
                )}

                {/* Top Right: Clock & Weather */}
                <div className="absolute top-10 right-10 z-50 flex flex-col gap-6 items-end animate-fade-in">
                    {settings.show_clock === 'true' && (
                        <div className="p-4 backdrop-blur-3xl bg-white/20 rounded-[2.5rem] border-2 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-white/20">
                            <DigitalClock />
                        </div>
                    )}

                    {settings.show_weather === 'true' && (
                        <div className="bg-white/20 backdrop-blur-3xl p-6 rounded-[2.5rem] border-2 border-white/40 flex items-center gap-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] ring-1 ring-white/20 group hover:scale-105 transition-all duration-500">
                            <div className="flex flex-col items-end">
                                <span className="text-gray-600 text-[10px] uppercase font-black tracking-[0.2em]">{settings.weather_city}, BD</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-brand-blue text-4xl font-black drop-shadow-md">{weather.temp}°C</span>
                                    <span className="text-3xl animate-bounce-slow">{weather.icon}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* QR Code / Call to Action (Bottom Right) */}
                {settings.show_qr !== 'false' && settings.qr_code_url && (
                    <div className="absolute bottom-10 right-10 z-[100] animate-fade-in">
                        <div className="bg-white/90 backdrop-blur-2xl p-5 rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.15)] border-[5px] border-brand-red flex flex-col items-center gap-3 transform hover:scale-110 transition-all duration-500 ring-4 ring-red-100/50">
                            <div className="p-3 bg-white rounded-3xl shadow-[inset_0_4px_15px_rgba(0,0,0,0.05)]">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(settings.qr_code_url)}`}
                                    alt="QR Code"
                                    className="w-24 h-24"
                                />
                            </div>
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[11px] font-black text-gray-500 tracking-tighter uppercase mb-0.5">SCAN FOR</span>
                                <span className="text-[16px] font-black text-brand-red tracking-wide uppercase">REVIEW</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Ticker Zone (Under QR) */}
                {settings.show_ticker !== 'false' && (
                    <div className="absolute bottom-10 left-10 right-10 z-[40]">
                        <Ticker
                            speed={Number(settings.ticker_speed) || 60}
                            label={settings.ticker_label || '📢 আপডেট'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiZoneLayout;
