import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import { fetchActiveMedia } from '../services/mediaService';

interface MediaCarouselProps {
    onEmpty?: () => void; // Optional callback if no media is found
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ onEmpty }) => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const loadMedia = async () => {
            const items = await fetchActiveMedia();
            if (items.length > 0) {
                setMediaItems(items);
            } else {
                if (onEmpty) onEmpty();
            }
            setLoading(false);
        };
        loadMedia();

        // Refresh media list every 10 minutes to grab new uploads without hard reloading
        const interval = setInterval(loadMedia, 10 * 60 * 1000);
        return () => clearInterval(interval);
    }, [onEmpty]);

    useEffect(() => {
        if (mediaItems.length === 0) return;

        const currentItem = mediaItems[currentIndex];
        
        // If it's an image, set a timeout to go to the next slide
        if (currentItem.type === 'image') {
            const timer = setTimeout(() => {
                goToNext();
            }, (currentItem.duration_seconds || 10) * 1000);
            return () => clearTimeout(timer);
        }
        
        // If it's a video, ensure it plays. Error handling fallback: if video fails, advance after 5s.
        if (currentItem.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(err => {
                console.error("Video autoplay blocked or failed:", err);
                const timer = setTimeout(goToNext, 5000);
                return () => clearTimeout(timer);
            });
        }
    }, [currentIndex, mediaItems]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <div className="w-16 h-16 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (mediaItems.length === 0) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-black">
                <div className="text-white text-3xl font-bold animate-pulse">NO MEDIA AVAILABLE</div>
            </div>
        );
    }

    const currentMedia = mediaItems[currentIndex];

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden flex items-center justify-center">
            
            {/* AGGRESSIVE PRELOADER: Preloads the NEXT media while current is playing */}
            <div className="hidden pointer-events-none" aria-hidden="true">
                {mediaItems.length > 1 && mediaItems[(currentIndex + 1) % mediaItems.length].type === 'video' ? (
                    <video 
                        src={mediaItems[(currentIndex + 1) % mediaItems.length].media_url} 
                        preload="auto" 
                        muted 
                    />
                ) : mediaItems.length > 1 ? (
                    <img 
                        src={mediaItems[(currentIndex + 1) % mediaItems.length].media_url} 
                    />
                ) : null}
            </div>

            {/* Display Current Media */}
            <div key={currentMedia.id + currentIndex} className="w-full h-full absolute inset-0 animate-fade-in flex items-center justify-center bg-black">
                {/* Blurred background layer for non-standard aspect ratios (like 1:1 FB images) */}
                <div className="absolute inset-0 w-full h-full">
                    {currentMedia.type === 'video' ? (
                        <video
                            src={currentMedia.media_url}
                            className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                        />
                    ) : (
                        <div 
                            className="w-full h-full bg-center bg-cover bg-no-repeat blur-2xl opacity-40 scale-110"
                            style={{ backgroundImage: `url('${currentMedia.media_url}')` }}
                        />
                    )}
                </div>

                {/* Sharp UI Layer (Centered) */}
                <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {currentMedia.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentMedia.media_url}
                            className="max-w-full max-h-full object-contain shadow-2xl"
                            autoPlay
                            muted={!currentMedia.play_with_sound}
                            playsInline
                            preload="auto"
                            onEnded={goToNext}
                            onError={goToNext}
                        />
                    ) : (
                        <img 
                            src={currentMedia.media_url}
                            alt="Centered content"
                            className="max-w-full max-h-full object-contain animate-fade-in shadow-2xl"
                        />
                    )}

                    {/* Group Title / Message Overlay */}
                    {currentMedia.group_title && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-slide-up w-full flex justify-center px-10">
                            <div className="bg-blue-900/40 backdrop-blur-3xl border border-white/20 px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4">
                                <div className="w-2 h-10 bg-brand-red rounded-full shadow-[0_0_15px_rgba(255,100,100,0.8)]"></div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg font-bengali uppercase">
                                    {currentMedia.group_title}
                                </h1>
                            </div>
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
};

export default MediaCarousel;
