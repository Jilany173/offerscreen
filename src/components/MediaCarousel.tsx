import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../../types';
import { fetchActiveMedia } from '../../services/mediaService';

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
            
            {/* Preload Next Media In Background */}
            {mediaItems.length > 1 && mediaItems[(currentIndex + 1) % mediaItems.length].type === 'video' && (
                <video 
                    src={mediaItems[(currentIndex + 1) % mediaItems.length].media_url} 
                    preload="auto" 
                    className="hidden" 
                />
            )}
            {mediaItems.length > 1 && mediaItems[(currentIndex + 1) % mediaItems.length].type === 'image' && (
                <link rel="preload" as="image" href={mediaItems[(currentIndex + 1) % mediaItems.length].media_url} />
            )}

            {/* Display Current Media */}
            <div key={currentMedia.id + currentIndex} className="w-full h-full absolute inset-0 animate-fade-in flex items-center justify-center">
                {currentMedia.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={currentMedia.media_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted={!currentMedia.play_with_sound}
                        playsInline
                        onEnded={goToNext}
                        onError={goToNext} // Skip to next if this video is broken
                    />
                ) : (
                    <div 
                        className="w-full h-full bg-center bg-cover bg-no-repeat animate-ken-burns"
                        style={{ backgroundImage: `url('${currentMedia.media_url}')` }}
                    />
                )}
            </div>


        </div>
    );
};

export default MediaCarousel;
