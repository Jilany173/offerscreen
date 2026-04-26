import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../../types';
import { 
    fetchAllMedia, 
    createMediaItem, 
    updateMediaItem, 
    deleteMediaItem, 
    uploadMediaFile, 
    fetchSignageSettings, 
    updateSignageSetting,
    fetchTickerMessages,
    createTickerMessage,
    deleteTickerMessage,
    updateTickerMessage,
    TickerMessage
} from '../../services/mediaService';

const MediaManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'media'>('dashboard');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    
    // Signage Configuration State
    const [signageSettings, setSignageSettings] = useState<Record<string, string>>({
        show_clock: 'true',
        show_weather: 'true',
        show_logo: 'true',
        weather_city: 'Sylhet',
        qr_code_url: ''
    });

    const [urlInput, setUrlInput] = useState('');
    const [urlType, setUrlType] = useState<'image' | 'video'>('image');
    const [newTickerInput, setNewTickerInput] = useState('');
    const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [items, settings, msgs] = await Promise.all([
                fetchAllMedia(),
                fetchSignageSettings(),
                fetchTickerMessages()
            ]);

            setMediaItems(items || []);
            setTickerMessages(msgs || []);
            if (settings && Object.keys(settings).length > 0) {
                setSignageSettings(prev => ({ ...prev, ...settings }));
            }
        } catch (error) {
            console.error("Overall load error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTicker = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTickerInput.trim()) return;
        
        const result = await createTickerMessage(newTickerInput.trim(), tickerMessages.length);
        if (result) {
            setNewTickerInput('');
            const data = await fetchTickerMessages();
            setTickerMessages(data);
        } else {
            alert("⚠️ Failed to add message. Check if SQL table exists.");
        }
    };

    const handleDeleteTicker = async (id: string) => {
        if (!window.confirm("আপনি কি এই মেসেজটি মুছে ফেলতে চান?")) return;
        await deleteTickerMessage(id);
        const data = await fetchTickerMessages();
        setTickerMessages(data);
    };

    const handleToggleTicker = async (id: string, currentStatus: boolean) => {
        await updateTickerMessage(id, { is_active: !currentStatus });
        const data = await fetchTickerMessages();
        setTickerMessages(data);
    };

    const handleSettingChange = async (key: string, value: string) => {
        setSignageSettings(prev => ({ ...prev, [key]: value }));
        const success = await updateSignageSetting(key, value);
        if (!success) {
            alert("⚠️ Failed to update setting in database.");
            const data = await fetchSignageSettings();
            setSignageSettings(prev => ({ ...prev, ...data }));
        }
    };
    
    // ... existing handlers ...
    const handleAddByUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!urlInput.trim()) return;
        setLoading(true);
        try {
            await createMediaItem({
                type: urlType,
                media_url: urlInput.trim(),
                duration_seconds: 10,
                play_with_sound: false,
                is_active: true,
                sort_order: mediaItems.length
            });
            setUrlInput('');
            const data = await fetchAllMedia();
            setMediaItems(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadMediaFile(file);
            if (uploadedUrl) {
                await createMediaItem({
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    media_url: uploadedUrl,
                    duration_seconds: 10,
                    play_with_sound: false,
                    is_active: true,
                    sort_order: mediaItems.length
                });
                const data = await fetchAllMedia();
                setMediaItems(data);
            }
        } catch (error) { console.error(error); }
        finally { setIsUploading(false); }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        await updateMediaItem(id, { is_active: !currentStatus });
        const data = await fetchAllMedia();
        setMediaItems(data);
    };

    const handleToggleSound = async (id: string, currentStatus: boolean) => {
        await updateMediaItem(id, { play_with_sound: !currentStatus });
        const data = await fetchAllMedia();
        setMediaItems(data);
    };

    const handleUpdateDuration = async (id: string, newDuration: number) => {
        await updateMediaItem(id, { duration_seconds: newDuration });
        const data = await fetchAllMedia();
        setMediaItems(data);
    };

    const confirmDeleteMedia = async () => {
        if (!itemToDelete) return;
        const success = await deleteMediaItem(itemToDelete.id, itemToDelete.media_url);
        if (success) {
            setItemToDelete(null);
            const data = await fetchAllMedia();
            setMediaItems(data);
        } else {
            alert("ফাইলটি ডিলিট করা সম্ভব হয়নি।");
        }
    };

    if (loading && mediaItems.length === 0) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Initializing Dashboard...</div>;

    return (
        <div className="flex flex-col gap-6">
            {/* Delete Confirmation Modal for Media */}
            {itemToDelete && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[99999] p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fade-in">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                🗑️
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">আপনি কি নিশ্চিত?</h3>
                            <p className="text-gray-500 text-sm mb-8">
                                এই আইটেমটি ডিলিট করলে এটি আপনার সার্ভার এবং ডাটাবেজ থেকে স্থায়ীভাবে মুছে যাবে।
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setItemToDelete(null)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                                >
                                    না, থাক
                                </button>
                                <button 
                                    onClick={confirmDeleteMedia}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
                                >
                                    হ্যাঁ, ডিলিট
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-Tab Navigation */}
            <div className="flex items-center gap-2 p-1 bg-gray-100/50 rounded-2xl w-max border border-gray-200">
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-brand-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    🚀 Signage Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('media')}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'media' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    📺 Media Playlist
                </button>
            </div>

            {activeTab === 'dashboard' ? (
                <div className="animate-fade-in">
                    {/* ======================== SIGNAGE CONFIGURATION ======================== */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                            <span className="text-9xl">⚙️</span>
                        </div>
                        
                        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 mb-2">
                            🛠️ Signage Dashboard Settings
                        </h2>
                        <p className="text-gray-500 mb-8 font-medium">Control widgets, Ticker, and overlays in Real-time.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            
                            {/* Ticker Config (playlist) */}
                            <div className="space-y-4 lg:col-span-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                     📣 Ticker Message Playlist
                                </label>
                                
                                <form onSubmit={handleAddTicker} className="flex gap-2 mb-4">
                                    <input 
                                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue outline-none font-medium"
                                        placeholder="Add new ticker message..."
                                        value={newTickerInput}
                                        onChange={(e) => setNewTickerInput(e.target.value)}
                                    />
                                    <button type="submit" className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold">Add</button>
                                </form>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {tickerMessages.map((msg) => (
                                        <div key={msg.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm gap-4">
                                            <span className={`text-sm font-medium flex-1 ${!msg.is_active ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {msg.message}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleToggleTicker(msg.id, msg.is_active)}
                                                    className={`text-[10px] font-black uppercase px-2 py-1 rounded ${msg.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                                >
                                                    {msg.is_active ? 'ON' : 'OFF'}
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteTicker(msg.id)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {tickerMessages.length === 0 && <p className="text-gray-400 text-sm italic text-center py-4">No messages in playlist.</p>}
                                </div>
                            </div>

                            {/* QR Code Config */}
                            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                     🔗 QR Code URL
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url"
                                        className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue outline-none transition-all font-medium text-sm"
                                        placeholder="https://example.com"
                                        value={signageSettings.qr_code_url || ''}
                                        onChange={(e) => setSignageSettings(prev => ({ ...prev, qr_code_url: e.target.value }))}
                                    />
                                    <button 
                                        onClick={() => handleSettingChange('qr_code_url', signageSettings.qr_code_url || '')}
                                        className="bg-brand-blue text-white px-4 py-2 rounded-xl font-bold text-xs"
                                    >
                                        Save
                                    </button>
                                </div>
                                <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(signageSettings.qr_code_url || 'https://hz.jkcshiru.com')}`} 
                                        alt="QR Preview" 
                                        className="h-20 w-20"
                                    />
                                </div>
                            </div>

                            {/* Toggles & Ticker Speed */}
                            <div className="flex flex-col gap-4 bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                                <h3 className="text-xs font-black text-blue-900 uppercase mb-2 tracking-widest">Master Display Controls</h3>
                                
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                                    <span className="font-bold text-gray-700 flex items-center gap-2">📢 News Ticker</span>
                                    <button 
                                        onClick={() => handleSettingChange('show_ticker', signageSettings.show_ticker === 'true' ? 'false' : 'true')}
                                        className={`w-14 h-8 rounded-full relative transition-colors ${signageSettings.show_ticker === 'true' ? 'bg-brand-red' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${signageSettings.show_ticker === 'true' ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-700 text-sm">⏳ Ticker Speed</span>
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs font-black">{signageSettings.ticker_speed || '60'}s</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="120" 
                                        step="5"
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                        value={signageSettings.ticker_speed || '60'}
                                        onChange={(e) => handleSettingChange('ticker_speed', e.target.value)}
                                    />
                                    <p className="text-[10px] text-gray-400 font-medium italic">Higher = Slower Scroll</p>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                                    <span className="font-bold text-gray-700 flex items-center gap-2">🖼️ Official Logo</span>
                                    <button 
                                        onClick={() => handleSettingChange('show_logo', signageSettings.show_logo === 'true' ? 'false' : 'true')}
                                        className={`w-14 h-8 rounded-full relative transition-colors ${signageSettings.show_logo === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${signageSettings.show_logo === 'true' ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Other Widget Toggles */}
                            <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-xs font-black text-gray-700 uppercase mb-2 tracking-widest">Time & Location</h3>
                                
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <span className="font-bold text-gray-700 flex items-center gap-2">🕒 Digital Clock</span>
                                    <button 
                                        onClick={() => handleSettingChange('show_clock', signageSettings.show_clock === 'true' ? 'false' : 'true')}
                                        className={`w-14 h-8 rounded-full relative transition-colors ${signageSettings.show_clock === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${signageSettings.show_clock === 'true' ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <span className="font-bold text-gray-700 flex items-center gap-2">⛅ Weather Info</span>
                                    <button 
                                        onClick={() => handleSettingChange('show_weather', signageSettings.show_weather === 'true' ? 'false' : 'true')}
                                        className={`w-14 h-8 rounded-full relative transition-colors ${signageSettings.show_weather === 'true' ? 'bg-green-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${signageSettings.show_weather === 'true' ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest leading-none">
                                         📍 Weather City
                                    </label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-brand-blue outline-none transition-all font-bold text-sm"
                                        value={signageSettings.weather_city || ''}
                                        onChange={(e) => setSignageSettings(prev => ({ ...prev, weather_city: e.target.value }))}
                                        onBlur={() => handleSettingChange('weather_city', signageSettings.weather_city || 'Sylhet')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* ======================== MEDIA PLAYLIST ======================== */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                    📺 Playlist Media Manager
                                </h2>
                                <p className="text-gray-500 font-medium">Manage looping videos and images.</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Recommended Quality</p>
                                    <p className="text-xs font-bold text-blue-600">1920x1080 (16:9)</p>
                                </div>
                                <form onSubmit={handleAddByUrl} className="flex flex-1 gap-2 p-2 bg-gray-50 rounded-xl border border-gray-200">
                                    <select 
                                        value={urlType} 
                                        onChange={(e) => setUrlType(e.target.value as 'image' | 'video')}
                                        className="bg-white border rounded-lg px-2 py-1 font-bold text-sm"
                                    >
                                        <option value="image">🖼️ Image</option>
                                        <option value="video">🎬 Video</option>
                                    </select>
                                    <input 
                                        type="url" 
                                        placeholder="Paste Media URL..." 
                                        className="flex-1 bg-white border text-sm rounded-lg px-3 py-2 outline-none"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                    />
                                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add</button>
                                </form>

                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    disabled={isUploading}
                                    className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold shadow-md disabled:opacity-50"
                                >
                                    {isUploading ? 'Uploading...' : '📤 Upload New'}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="video/*,image/*" />
                            </div>
                        </div>

                        <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                            {mediaItems.map((item, index) => (
                                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 p-4 border-2 border-gray-50 rounded-2xl bg-white hover:border-blue-100 hover:shadow-lg transition-all">
                                    <div className="font-black text-gray-300 w-8 text-center text-xl">
                                        {index + 1}
                                    </div>
                                    <div className="w-40 h-24 rounded-xl overflow-hidden bg-black shadow-inner flex-shrink-0 relative group">
                                        {item.type === 'video' ? (
                                            <video src={item.media_url} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.media_url})`}} />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <a href={item.media_url} target="_blank" className="text-white bg-white/20 p-2 rounded-full backdrop-blur-sm">🔗</a>
                                        </div>
                                    </div>

                                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-5 gap-4 items-center w-full">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Type</span>
                                            <span className="font-bold text-gray-800 capitalize leading-none">{item.type}</span>
                                        </div>

                                        {item.type === 'image' ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Duration</span>
                                                <div className="flex items-center gap-1">
                                                    <input 
                                                        type="number" 
                                                        className="w-20 p-1 border rounded font-bold focus:border-brand-blue outline-none text-center" 
                                                        value={item.duration_seconds} 
                                                        onChange={(e) => handleUpdateDuration(item.id, Number(e.target.value))} 
                                                    />
                                                    <span className="text-xs text-gray-400">sec</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Audio</span>
                                                <button onClick={() => handleToggleSound(item.id, item.play_with_sound)} className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.play_with_sound ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {item.play_with_sound ? '🔊 On' : '🔇 Muted'}
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Display</span>
                                            <button onClick={() => handleToggleActive(item.id, item.is_active)} className={`text-xs font-bold px-2 py-0.5 rounded-full w-max ${item.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.is_active ? 'Active' : 'Paused'}
                                            </button>
                                        </div>

                                        <div className="flex flex-col lg:items-end lg:col-span-2">
                                            <button onClick={() => setItemToDelete(item)} className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 bg-red-50 px-3 py-2 rounded-xl transition-all">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManager;

