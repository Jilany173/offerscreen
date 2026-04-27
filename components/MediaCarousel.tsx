import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaItem, Offer } from '../types';
import { fetchActiveMedia, updateHeartbeat } from '../services/mediaService';
import { fetchActiveOffer } from '../services/offerService';
import CampaignSlide from './CampaignSlide';

interface MediaCarouselProps {
    onEmpty?: () => void;
}

type PlaylistElement = 
    | { type: 'media'; data: MediaItem }
    | { type: 'campaign'; data: Offer };

const MediaCarousel: React.FC<MediaCarouselProps> = ({ onEmpty }) => {
    const [playlist, setPlaylist] = useState<PlaylistElement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isScheduled = (item: MediaItem) => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDay = now.getDay(); 
        if (item.start_date && new Date(item.start_date) > now) return false;
        if (item.end_date && new Date(item.end_date) < now) {
            const end = new Date(item.end_date);
            end.setHours(23, 59, 59);
            if (end < now) return false;
        }
        if (item.active_days && !item.active_days.includes(currentDay)) return false;
        if (!item.is_active) return false;
        if (item.start_time || item.end_time) {
            const [sH, sM] = (item.start_time || "00:00").split(':').map(Number);
            const [eH, eM] = (item.end_time || "23:59").split(':').map(Number);
            const startLimit = sH * 60 + sM;
            const endLimit = eH * 60 + eM;
            if (currentTime < startLimit || currentTime > endLimit) return false;
        }
        return true;
    };

    useEffect(() => {
        const loadAll = async () => {
            const [media, campaign] = await Promise.all([
                fetchActiveMedia(),
                fetchActiveOffer()
            ]);
            
            const activeScheduledMedia = media.filter(isScheduled);

            if (activeScheduledMedia.length === 0 && !campaign) {
                if (onEmpty) onEmpty();
                setLoading(false);
                return;
            }

            const items: PlaylistElement[] = [];
            const groupedMedia: Record<string, MediaItem[]> = {};
            const ungroupedMedia: MediaItem[] = [];

            activeScheduledMedia.forEach(m => {
                if (m.group_id && m.group_id.trim() !== '') {
                    if (!groupedMedia[m.group_id]) groupedMedia[m.group_id] = [];
                    groupedMedia[m.group_id].push(m);
                } else {
                    ungroupedMedia.push(m);
                }
            });

            let mediaCounter = 0;
            const addMediaToPlaylist = (m: MediaItem) => {
                items.push({ type: 'media', data: m });
                mediaCounter++;
                if (campaign && mediaCounter % 3 === 0) {
                    items.push({ type: 'campaign', data: campaign });
                }
            };

            ungroupedMedia.forEach(addMediaToPlaylist);
            Object.keys(groupedMedia).forEach(groupId => {
                groupedMedia[groupId].forEach(addMediaToPlaylist);
            });

            if (campaign && items.filter(i => i.type === 'campaign').length === 0) {
                items.push({ type: 'campaign', data: campaign });
            }

            setPlaylist(items);
            setLoading(false);
        };

        updateHeartbeat();
        const hInterval = setInterval(updateHeartbeat, 30000);
        loadAll();
        const interval = setInterval(loadAll, 60000); 
        return () => { clearInterval(interval); clearInterval(hInterval); };
    }, [onEmpty]);

    useEffect(() => {
        if (playlist.length === 0) return;
        const current = playlist[currentIndex];
        if (current.type === 'campaign') {
            const timer = setTimeout(goToNext, 12000);
            return () => clearTimeout(timer);
        }
        const media = current.data as MediaItem;
        if (media.type === 'image') {
            const timer = setTimeout(goToNext, (media.duration_seconds || 10) * 1000);
            return () => clearTimeout(timer);
        }
        if (media.type === 'video' && videoRef.current) {
            videoRef.current.play().catch(goToNext);
        }
    }, [currentIndex, playlist]);

    const goToNext = () => { setCurrentIndex((curr) => (curr + 1) % playlist.length); };

    if (loading) return <div className="w-full h-screen bg-black"></div>;
    if (playlist.length === 0) return <div className="w-full h-screen bg-black flex items-center justify-center text-white">NO CONTENT</div>;

    const currentItem = playlist[currentIndex];

    return (
        <div className="w-full h-screen bg-black relative overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div key={currentIndex + (currentItem.type === 'media' ? currentItem.data.id : 'campaign')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 w-full h-full">
                    {currentItem.type === 'campaign' ? <CampaignSlide offer={currentItem.data} /> : (
                        <div className="w-full h-full relative flex items-center justify-center">
                            <div className="absolute inset-0 w-full h-full overflow-hidden">
                                {currentItem.data.type === 'video' ? (
                                    <video src={currentItem.data.media_url} className="w-full h-full object-cover blur-2xl opacity-40 scale-110" autoPlay muted loop />
                                ) : (
                                    <div className="w-full h-full bg-center bg-cover blur-2xl opacity-40 scale-110" style={{ backgroundImage: `url('${currentItem.data.media_url}')` }} />
                                )}
                            </div>
                            
                            <motion.div initial={{ scale: 1.05, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} className="relative z-10 w-full h-full flex items-center justify-center">
                                {currentItem.data.type === 'video' ? (
                                    <video ref={videoRef} src={currentItem.data.media_url} className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]" autoPlay muted={!currentItem.data.play_with_sound} onEnded={goToNext} onError={goToNext} />
                                ) : (
                                    <motion.img initial={{ scale: 1 }} animate={{ scale: 1.02 }} transition={{ duration: (currentItem.data.duration_seconds || 10) }} src={currentItem.data.media_url} className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)]" />
                                )}
                            </motion.div>

                            {/* Success Template Overlay */}
                            {currentItem.data.template_type === 'ielts_success' && (
                                <div className="absolute inset-0 z-50 pointer-events-none">
                                    <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="absolute top-20 left-20 bg-black/40 backdrop-blur-3xl border-2 border-white/10 p-10 rounded-[3rem] shadow-2xl flex flex-col gap-2">
                                        <span className="text-orange-400 font-black text-xl uppercase tracking-[0.3em]">ACHIEVEMENT</span>
                                        <h2 className="text-white text-7xl font-black font-bengali drop-shadow-2xl">{currentItem.data.student_name}</h2>
                                    </motion.div>

                                    <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', delay: 1 }} className="absolute bottom-40 right-40">
                                        <div className="relative w-64 h-64 flex items-center justify-center">
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full shadow-[0_30px_60px_rgba(245,158,11,0.5)] border-8 border-white/30 animate-pulse" />
                                            <div className="relative text-center">
                                                <span className="text-white/80 font-black text-lg block uppercase tracking-widest">SCORE</span>
                                                <span className="text-white text-8xl font-black drop-shadow-lg">{currentItem.data.student_score}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {/* Headline Overlay */}
                            {currentItem.data.headline && currentItem.data.template_type === 'none' && (
                                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute bottom-40 left-0 w-full z-40 px-20">
                                    <div className="bg-black/60 backdrop-blur-2xl p-10 rounded-r-[3rem] border-l-[15px] border-brand-red inline-block max-w-5xl shadow-2xl">
                                        <h1 className="text-7xl font-black text-white font-bengali leading-tight drop-shadow-2xl">{currentItem.data.headline}</h1>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default MediaCarousel;
