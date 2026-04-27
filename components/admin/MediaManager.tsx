import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
    fetchSystemHealth,
    TickerMessage
} from '../../services/mediaService';

const MediaManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'media' | 'settings' | 'success'>('media');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [tickerMessages, setTickerMessages] = useState<TickerMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('offline');
    
    // UI State for folder view
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [groupList, setGroupList] = useState<string[]>([]);
    const [currentGroupItems, setCurrentGroupItems] = useState<MediaItem[]>([]);
    
    const [schedulingItem, setSchedulingItem] = useState<MediaItem | null>(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [newGroupName, setNewGroupName] = useState('');

    const [templateData, setTemplateData] = useState({ name: '', score: '', type: 'ielts_success', image: null as File | null });
    const [signageSettings, setSignageSettings] = useState<Record<string, string>>({ show_clock: 'true', show_weather: 'true', show_logo: 'true', weather_city: 'Sylhet', qr_code_url: '', show_qr: 'true', ticker_label: 'LATEST UPDATE', ticker_speed: '20' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadData();
        const healthCheck = setInterval(async () => {
            const health = await fetchSystemHealth();
            if (health) {
                const lastSeen = new Date(health.last_seen).getTime();
                setSystemStatus((Date.now() - lastSeen) / 1000 < 65 ? 'online' : 'offline');
            }
        }, 10000);
        return () => clearInterval(healthCheck);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [items, settings, msgs] = await Promise.all([fetchAllMedia(), fetchSignageSettings(), fetchTickerMessages()]);
            const sortedItems = (items || []).sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0));
            setMediaItems(sortedItems);
            
            // Build and sort group list based on mediaItems sorting
            const grouped = sortedItems.reduce((acc, item) => {
                const g = item.group_id || 'Individual Loop';
                if (!acc.includes(g)) acc.push(g);
                return acc;
            }, [] as string[]);
            setGroupList(grouped);
            
            setTickerMessages(msgs || []);
            if (settings) setSignageSettings(prev => ({ ...prev, ...settings }));
        } finally {
            setLoading(false);
        }
    };

    // Update current group items whenever selection or master list changes
    useEffect(() => {
        if (selectedGroup) {
            const filtered = mediaItems.filter(m => (m.group_id || 'Individual Loop') === selectedGroup);
            setCurrentGroupItems(filtered);
        }
    }, [selectedGroup, mediaItems]);

    // Reorder items within a group
    const handleItemReorder = async (reordered: MediaItem[]) => {
        setCurrentGroupItems(reordered);
        // Find indices in global list to swap
        const newGlobalList = [...mediaItems];
        reordered.forEach((item, idx) => {
            const globalIdx = newGlobalList.findIndex(m => m.id === item.id);
            if (globalIdx !== -1) {
                // We'll update the sort_order in database based on new global sequence logic later
                // For now, let's keep it simple: update item orders directly
            }
        });
        
        // Batch update DB
        const updatePromises = reordered.map((item, idx) => updateMediaItem(item.id, { sort_order: idx }));
        await Promise.all(updatePromises);
    };

    // Reorder whole groups/folders
    const handleGroupReorder = async (newGroupOrder: string[]) => {
        setGroupList(newGroupOrder);
        
        // Re-calculate the global sort_order for every single item based on new group sequence
        const newGlobalItemSequence: MediaItem[] = [];
        newGroupOrder.forEach(gName => {
            const itemsInGroup = mediaItems.filter(m => (m.group_id || 'Individual Loop') === gName);
            newGlobalItemSequence.push(...itemsInGroup);
        });

        // Batch update database with new global indices
        const updatePromises = newGlobalItemSequence.map((item, idx) => {
            if (item.sort_order !== idx) {
                return updateMediaItem(item.id, { sort_order: idx });
            }
            return null;
        });
        
        setMediaItems(newGlobalItemSequence);
        await Promise.all(updatePromises.filter(p => p !== null));
    };

    const handleFileSync = async () => {
        if (!pendingFiles) return;
        const uploadGroupId = newGroupName.trim() !== '' ? newGroupName : (selectedGroupId || 'General');
        setIsGroupModalOpen(false);
        setIsUploading(true);
        try {
            const maxOrder = Math.max(...mediaItems.map(m => m.sort_order || 0), 0);
            for (let i = 0; i < pendingFiles.length; i++) {
                const url = await uploadMediaFile(pendingFiles[i], p => setUploadProgress(p));
                if (url) await createMediaItem({ type: pendingFiles[i].type.startsWith('video/') ? 'video' : 'image', media_url: url, is_active: true, duration_seconds: 10, sort_order: maxOrder + i + 1, group_id: uploadGroupId });
            }
        } finally {
            setIsUploading(false);
            setPendingFiles(null);
            loadData();
        }
    };

    const saveSchedule = async () => {
        if (!schedulingItem) return;
        await updateMediaItem(schedulingItem.id, { ...schedulingItem });
        setSchedulingItem(null);
        loadData();
    };

    return (
        <div className="flex flex-col gap-8 bg-gray-50 min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative border border-white/5">
                <div className="relative flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600/20 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/10 shadow-inner">
                        <span className="text-3xl">🎛️</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">Campaign Station</h1>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Cloud Control v3.5</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${systemStatus === 'online' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${systemStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-[9px] font-black tracking-widest uppercase">{systemStatus === 'online' ? 'Ready' : 'Link Lost'}</span>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all">UPLOAD</button>
                    <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files) { setPendingFiles(e.target.files); setIsGroupModalOpen(true); } }} multiple className="hidden" />
                </div>
            </div>

            {activeTab === 'media' && (
                <div className="space-y-6">
                    {/* Folder Reordering Table */}
                    {!selectedGroup ? (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <div><h2 className="text-xl font-black text-slate-800 italic">BROADCAST ORDER</h2><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Swipe to reorder campaigns</p></div>
                                <span className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter italic">DRAG FOLDERS</span>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <Reorder.Group axis="y" values={groupList} onReorder={handleGroupReorder} className="w-full">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                <th className="px-10 py-5 w-24">Order</th>
                                                <th className="px-10 py-5">Campaign Name</th>
                                                <th className="px-10 py-5">Status</th>
                                                <th className="px-10 py-5 text-right">Preview</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {groupList.map((gName, idx) => (
                                                <Reorder.Item key={gName} value={gName} as="tr" className="hover:bg-blue-50/40 transition-colors cursor-grab active:cursor-grabbing group bg-white">
                                                    <td className="px-10 py-6">
                                                       <div className="flex items-center gap-3">
                                                           <span className="text-slate-200 text-2xl">☰</span>
                                                           <span className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg font-black text-xs italic">{idx + 1}</span>
                                                       </div>
                                                    </td>
                                                    <td className="px-10 py-6" onClick={() => setSelectedGroup(gName)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:text-white transition-all">📁</div>
                                                            <span className="font-black text-slate-800 italic text-lg tracking-tighter uppercase">{gName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-6 text-xs font-black text-slate-400 italic">
                                                        {mediaItems.filter(m => (m.group_id || 'Individual Loop') === gName).length} ITEMS ACTIVE
                                                    </td>
                                                    <td className="px-10 py-6 text-right">
                                                        <button onClick={() => setSelectedGroup(gName)} className="bg-gray-100 text-slate-600 px-6 py-3 rounded-xl font-black text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">MANAGE →</button>
                                                    </td>
                                                </Reorder.Item>
                                            ))}
                                        </tbody>
                                    </table>
                                </Reorder.Group>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-10 border-b border-white/10 flex justify-between items-center bg-slate-900 text-white animate-fade-in">
                                <div className="flex items-center gap-6">
                                    <button onClick={() => setSelectedGroup(null)} className="flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-red-500 rounded-2xl transition-all border border-white/10 font-bold text-xs"><span>←</span> LIST</button>
                                    <div><h2 className="text-2xl font-black italic tracking-tighter uppercase">{selectedGroup}</h2></div>
                                </div>
                            </div>
                            
                            <Reorder.Group axis="y" values={currentGroupItems} onReorder={handleItemReorder} className="w-full">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-10 py-5 w-24">SORT</th>
                                                <th className="px-10 py-5">Visual</th>
                                                <th className="px-10 py-5">Title / Subject</th>
                                                <th className="px-10 py-5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {currentGroupItems.map((item) => (
                                                <Reorder.Item key={item.id} value={item} as="tr" className="hover:bg-gray-50/50 transition-colors cursor-grab active:cursor-grabbing bg-white">
                                                    <td className="px-10 py-5 text-slate-300 text-2xl font-black">⠿</td>
                                                    <td className="px-10 py-5">
                                                        <div className="w-20 h-12 bg-black rounded-xl overflow-hidden shadow-sm border-2 border-white"><img src={item.media_url} className="w-full h-full object-cover" /></div>
                                                    </td>
                                                    <td className="px-10 py-5 font-black text-slate-700 italic">{item.student_name || 'Individual Media'}</td>
                                                    <td className="px-10 py-5 text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button onClick={() => setSchedulingItem(item)} className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center text-xs">🕒</button>
                                                            <button onClick={() => deleteMediaItem(item.id, item.media_url).then(loadData)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">🗑️</button>
                                                        </div>
                                                    </td>
                                                </Reorder.Item>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Reorder.Group>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {/* UPLOAD MODAL */}
                {isUploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[99999] flex items-center justify-center p-6 text-white text-center">
                        <div className="space-y-6"><h3 className="text-5xl font-black italic tracking-tighter animate-pulse">UP: {uploadProgress}%</h3><div className="h-1 w-64 bg-white/10 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-blue-500 shadow-[0_0_20px_blue]" /></div></div>
                    </motion.div>
                )}
                {/* GROUP SELECTOR */}
                {isGroupModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[99998] flex items-center justify-center p-6 px-10">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl flex flex-col gap-6">
                            <h3 className="text-2xl font-black text-slate-800 italic uppercase">Campaign Selection</h3>
                            <select className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold outline-none" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                                <option value="">Choose Existing Group</option>
                                {groupList.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                            <input type="text" className="w-full p-5 border-2 border-gray-100 rounded-2xl font-black outline-none focus:border-blue-500" placeholder="Or New Group Name..." value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <button onClick={() => setIsGroupModalOpen(false)} className="py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black uppercase text-xs">Cancel</button>
                                <button onClick={handleFileSync} className="py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl">Apply & Upload</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaManager;
