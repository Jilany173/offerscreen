import React, { useState, useEffect, useRef } from 'react';
import { fetchAllOffers, createOffer, updateOffer, deleteOffer, fetchCoursesForOffer, createCourse, updateCourse, deleteCourse } from '../../services/offerService';
import { fetchAllThemes, createTheme, updateTheme, deleteTheme, setActiveTheme, ThemeSettings } from '../../services/themeService';
import { fetchAllGiftItems, addGiftItem, updateGiftItem, deleteGiftItem, uploadGiftImage, deleteGiftImage, GiftItem } from '../../services/giftService';
import { fetchBackgrounds, addBackground, deleteBackground, uploadBackgroundImage, setActiveBackground, BackgroundImage } from '../../services/backgroundService';
import { Offer, Course } from '../../types';

const AdminPanel: React.FC = () => {
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    };

    // --- State ---
    const [activeTab, setActiveTab] = useState<'campaigns' | 'theme' | 'gifts' | 'background'>('campaigns');
    const [loading, setLoading] = useState(true);

    // Campaign state
    const [offers, setOffers] = useState<Offer[]>([]);
    const [courses, setCourses] = useState<Record<string, Course[]>>({});
    const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
    const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

    // Theme state
    const [allThemes, setAllThemes] = useState<ThemeSettings[]>([]);
    const [editingTheme, setEditingTheme] = useState<ThemeSettings | null>(null);
    const [isCreatingTheme, setIsCreatingTheme] = useState(false);

    // Gift state
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [editingGift, setEditingGift] = useState<Partial<GiftItem> | null>(null);
    const [giftImageFile, setGiftImageFile] = useState<File | null>(null);
    const [giftImagePreview, setGiftImagePreview] = useState<string | null>(null);
    const [giftSaving, setGiftSaving] = useState(false);
    const giftFileInputRef = useRef<HTMLInputElement>(null);

    // Background state
    const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
    const [bgImageFile, setBgImageFile] = useState<File | null>(null);
    const [bgSaving, setBgSaving] = useState(false);
    const bgFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadOffers(), loadThemes(), loadGifts(), loadBackgrounds()]);
        setLoading(false);
    };

    // --- Loaders ---
    const loadOffers = async () => setOffers(await fetchAllOffers());
    const loadThemes = async () => setAllThemes(await fetchAllThemes());
    const loadGifts = async () => setGifts(await fetchAllGiftItems());
    const loadBackgrounds = async () => setBackgrounds(await fetchBackgrounds());

    const refreshCourses = async (offerId: string) => {
        const offerCourses = await fetchCoursesForOffer(offerId);
        setCourses(prev => ({ ...prev, [offerId]: offerCourses }));
    };

    // --- Campaign Handlers ---
    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOffer) return;
        if (editingOffer.id) {
            await updateOffer(editingOffer.id, editingOffer);
        } else {
            // @ts-ignore
            await createOffer(editingOffer);
        }
        setEditingOffer(null);
        loadOffers();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this offer?')) {
            await deleteOffer(id);
            loadOffers();
        }
    };

    const handleDeleteGiftItem = async (gift: GiftItem) => {
        if (window.confirm(`"${gift.name}" মুছে ফেলবেন?`)) {
            if (gift.image_url) await deleteGiftImage(gift.image_url);
            await deleteGiftItem(gift.id);
            loadGifts();
        }
    };

    // --- Background Handlers ---
    const handleActivateBackground = async (id: string | null) => {
        await setActiveBackground(id);
        await loadBackgrounds();
    };

    const handleBgDelete = async (bg: BackgroundImage) => {
        if (window.confirm(`Delete background "${bg.name}"?`)) {
            await deleteBackground(bg.id, bg.image_url);
            await loadBackgrounds();
        }
    };

    const handleBgUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bgImageFile) return;

        setBgSaving(true);
        try {
            const imageUrl = await uploadBackgroundImage(bgImageFile);
            if (imageUrl) {
                await addBackground(bgImageFile.name, imageUrl);
                setBgImageFile(null);
                if (bgFileInputRef.current) bgFileInputRef.current.value = '';
                await loadBackgrounds();
            }
        } catch (error) {
            console.error('Error uploading background:', error);
            alert('Failed to upload background image');
        } finally {
            setBgSaving(false);
        }
    };

    const handleSetActive = async (id: string) => {
        const offer = offers.find(o => o.id === id);
        if (offer) {
            await updateOffer(id, { is_active: !offer.is_active });
            loadOffers();
        }
    };

    const toggleExpandOffer = async (offerId: string) => {
        if (expandedOfferId === offerId) {
            setExpandedOfferId(null);
        } else {
            setExpandedOfferId(offerId);
            if (!courses[offerId]) {
                const offerCourses = await fetchCoursesForOffer(offerId);
                setCourses(prev => ({ ...prev, [offerId]: offerCourses }));
            }
        }
    };

    // --- Course Handlers ---
    const handleCreateOrUpdateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse || !editingCourse.offer_id) return;
        if (editingCourse.id) {
            await updateCourse(editingCourse.id, editingCourse);
        } else {
            // @ts-ignore
            await createCourse(editingCourse);
        }
        await refreshCourses(editingCourse.offer_id);
        setEditingCourse(null);
    };

    const handleDeleteCourse = async (courseId: string, offerId: string) => {
        if (window.confirm('Delete this course?')) {
            await deleteCourse(courseId);
            refreshCourses(offerId);
        }
    };

    const handleMoveCourse = async (offerId: string, idx: number, direction: 'up' | 'down') => {
        const list = [...(courses[offerId] || [])];
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= list.length) return;
        const a = list[idx];
        const b = list[swapIdx];
        await updateCourse(a.id, { sort_order: (b as any).sort_order ?? swapIdx });
        await updateCourse(b.id, { sort_order: (a as any).sort_order ?? idx });
        refreshCourses(offerId);
    };

    // --- Theme Handlers ---
    const handleAddTheme = () => {
        setEditingTheme({
            header_text_1: 'New Theme',
            header_text_2: '150 Hours',
            background_style: 'default',
            show_gift_marquee: true,
            show_gift_popups: true,
            card_rotation_interval: 6,
            is_active: false
        });
        setIsCreatingTheme(true);
    };

    const handleSaveTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTheme) return;
        if (isCreatingTheme) {
            await createTheme(editingTheme);
        } else if (editingTheme.id) {
            const { id, ...updates } = editingTheme;
            await updateTheme(id, updates);
        }
        await loadThemes();
        setEditingTheme(null);
        setIsCreatingTheme(false);
    };

    const handleActivateTheme = async (id: string) => {
        await setActiveTheme(id);
        await loadThemes();
    };

    const handleDeleteTheme = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this theme?')) {
            await deleteTheme(id);
            await loadThemes();
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

            {/* Tabs */}
            <div className="flex border-b mb-6">
                <button
                    className={`px-6 py-2 font-medium ${activeTab === 'campaigns' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('campaigns')}
                >
                    Campaigns
                </button>
                <button
                    className={`px-6 py-2 font-medium ${activeTab === 'theme' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('theme')}
                >
                    Theme Settings
                </button>
                <button
                    className={`px-6 py-2 font-medium ${activeTab === 'gifts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('gifts')}
                >
                    🎁 Gift Items
                </button>
                <button
                    className={`px-6 py-2 font-medium ${activeTab === 'background' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('background')}
                >
                    🖼️ Background
                </button>
            </div>

            {/* ======================== THEME TAB ======================== */}
            {activeTab === 'theme' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Theme Library</h2>
                        <button onClick={handleAddTheme} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                            + Add New Theme
                        </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-10">
                        {allThemes.map((theme) => (
                            <div key={theme.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${theme.is_active ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-gray-300'}`}>
                                <div className={`h-32 w-full flex items-center justify-center relative ${theme.background_style === 'theme-2' ? 'bg-gray-800' : 'bg-brand-blue/5'}`}>
                                    {theme.background_style === 'theme-2' && <img src="/bg-theme-2.png" alt="Theme 2" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                                    {theme.background_style === 'default' && <div className="text-gray-400 font-medium">Default Pattern</div>}
                                    {theme.is_active && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">ACTIVE</div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{theme.header_text_1 || "Untitled"}</h3>
                                        <p className="text-sm text-gray-500">{theme.header_text_2}</p>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {!theme.is_active && (
                                            <button onClick={() => handleActivateTheme(theme.id!)} className="flex-1 py-2 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg">
                                                Activate
                                            </button>
                                        )}
                                        <button onClick={() => setEditingTheme(theme)} className="flex-1 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDeleteTheme(theme.id!)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Theme">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit/Create Theme Modal */}
                    {(editingTheme || isCreatingTheme) && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                                <button
                                    onClick={() => { setEditingTheme(null); setIsCreatingTheme(false); }}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                >✕</button>
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                    {isCreatingTheme ? 'Create New Theme' : 'Edit Theme'}
                                </h2>
                                <form onSubmit={handleSaveTheme} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Top Header Text</label>
                                        <input
                                            type="text"
                                            value={editingTheme?.header_text_1 || ''}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, header_text_1: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none"
                                            placeholder="e.g. Ramadan Special"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Highlighted Text (Animated)</label>
                                        <input
                                            type="text"
                                            value={editingTheme?.header_text_2 || ''}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, header_text_2: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none"
                                            placeholder="e.g. 150 Hours"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Background Style</label>
                                        <select
                                            value={editingTheme?.background_style || 'default'}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, background_style: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="default">Default (Blue Grid Pattern)</option>
                                            <option value="theme-2">Theme 2 (Ramadan Image)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Countdown Language</label>
                                        <select
                                            value={editingTheme?.timer_language || 'bn'}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, timer_language: e.target.value as 'en' | 'bn' }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="bn">Bengali (বাংলা)</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Card Rotation Interval (Seconds)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={editingTheme?.card_rotation_interval || 6}
                                                onChange={(e) => setEditingTheme(prev => ({ ...prev!, card_rotation_interval: Number(e.target.value) }))}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none"
                                                placeholder="e.g. 6"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Auto Reload Interval (Minutes)</label>
                                            <select
                                                value={editingTheme?.auto_reload_interval || 20}
                                                onChange={(e) => setEditingTheme(prev => ({ ...prev!, auto_reload_interval: Number(e.target.value) }))}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none bg-white font-medium text-gray-700 focus:ring-2 focus:ring-brand-blue"
                                            >
                                                <option value={1}>1 Minute</option>
                                                <option value={5}>5 Minutes</option>
                                                <option value={10}>10 Minutes</option>
                                                <option value={15}>15 Minutes</option>
                                                <option value={20}>20 Minutes</option>
                                                <option value={25}>25 Minutes</option>
                                                <option value={30}>30 Minutes</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="show_marquee"
                                                checked={editingTheme?.show_gift_marquee ?? true}
                                                onChange={(e) => setEditingTheme(prev => ({ ...prev!, show_gift_marquee: e.target.checked }))}
                                                className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                            <label htmlFor="show_marquee" className="text-sm font-bold text-gray-700 cursor-pointer">Show Marquee</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                id="show_popups"
                                                checked={editingTheme?.show_gift_popups ?? true}
                                                onChange={(e) => setEditingTheme(prev => ({ ...prev!, show_gift_popups: e.target.checked }))}
                                                className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                            />
                                            <label htmlFor="show_popups" className="text-sm font-bold text-gray-700 cursor-pointer">Show Popups</label>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-lg hover:bg-brand-red transition-colors shadow-lg mt-4">
                                        {isCreatingTheme ? 'Create Theme' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ======================== CAMPAIGNS TAB ======================== */}
            {activeTab === 'campaigns' && (
                <>
                    {!editingOffer && (
                        <button
                            onClick={() => setEditingOffer({ title: '', start_time: new Date().toISOString(), end_time: new Date(Date.now() + 86400000).toISOString(), is_active: false, description: '' })}
                            className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
                        >
                            + Create New Campaign
                        </button>
                    )}

                    {editingOffer && (
                        <form onSubmit={handleCreateOrUpdate} className="bg-white p-6 rounded shadow mb-10 border">
                            <h2 className="text-xl font-bold mb-4">{editingOffer.id ? 'Edit Campaign' : 'New Campaign'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-semibold">Campaign Title</label>
                                    <input className="w-full border p-2 rounded" value={editingOffer.title || ''} onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">Start Time</label>
                                    <input className="w-full border p-2 rounded" type="datetime-local" value={editingOffer.start_time ? toLocalISOString(new Date(editingOffer.start_time)) : ''} onChange={e => setEditingOffer({ ...editingOffer, start_time: new Date(e.target.value).toISOString() })} required />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">Duration (Hours)</label>
                                    <input
                                        className="w-full border p-2 rounded" type="number" min="0" step="0.5" placeholder="e.g. 150"
                                        value={editingOffer.start_time && editingOffer.end_time ? ((new Date(editingOffer.end_time).getTime() - new Date(editingOffer.start_time).getTime()) / 3600000).toFixed(1) : ''}
                                        onChange={e => {
                                            const hours = parseFloat(e.target.value);
                                            if (!isNaN(hours) && editingOffer.start_time) {
                                                const end = new Date(new Date(editingOffer.start_time).getTime() + (hours * 3600000));
                                                setEditingOffer({ ...editingOffer, end_time: end.toISOString() });
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">End Time</label>
                                    <input className="w-full border p-2 rounded" type="datetime-local" value={editingOffer.end_time ? toLocalISOString(new Date(editingOffer.end_time)) : ''} onChange={e => setEditingOffer({ ...editingOffer, end_time: new Date(e.target.value).toISOString() })} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-1">Description</label>
                                    <textarea className="w-full border p-2 rounded" value={editingOffer.description || ''} onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })} />
                                </div>
                                <div className="flex items-center">
                                    <input type="checkbox" className="mr-2 h-5 w-5" checked={editingOffer.is_active || false} onChange={e => setEditingOffer({ ...editingOffer, is_active: e.target.checked })} />
                                    <label>Is Active</label>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-4">
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Save</button>
                                <button type="button" onClick={() => setEditingOffer(null)} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Cancel</button>
                            </div>
                        </form>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border bg-white shadow">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Title</th>
                                    <th className="border p-2 text-left">Start Time</th>
                                    <th className="border p-2 text-left">End Time</th>
                                    <th className="border p-2 text-center">Active</th>
                                    <th className="border p-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.map(offer => (
                                    <React.Fragment key={offer.id}>
                                        <tr className={`hover:bg-gray-50 ${expandedOfferId === offer.id ? 'bg-blue-50' : ''}`}>
                                            <td className="border p-2 font-medium" dangerouslySetInnerHTML={{ __html: offer.title }}></td>
                                            <td className="border p-2 text-sm">{offer.start_time ? new Date(offer.start_time).toLocaleString() : '-'}</td>
                                            <td className="border p-2 text-sm">{new Date(offer.end_time).toLocaleString()}</td>
                                            <td className="border p-2 text-center cursor-pointer" onClick={() => handleSetActive(offer.id)}>
                                                <span className={`px-2 py-1 rounded text-xs text-white ${offer.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                    {offer.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="border p-2 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => toggleExpandOffer(offer.id)} className="bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600 transition-colors">
                                                        {expandedOfferId === offer.id ? 'Close' : 'Courses'}
                                                    </button>
                                                    <button onClick={() => setEditingOffer(offer)} className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors">Edit</button>
                                                    <button onClick={() => handleDelete(offer.id)} className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedOfferId === offer.id && (
                                            <tr>
                                                <td colSpan={5} className="p-0 border">
                                                    <div className="p-4 bg-slate-50 border-t border-b border-indigo-100 animate-fade-in">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="font-bold text-indigo-700 flex items-center">
                                                                <span className="mr-2">📚</span> Courses in "{offer.title}"
                                                            </h4>
                                                            {!editingCourse && (
                                                                <button
                                                                    onClick={() => setEditingCourse({ offer_id: offer.id, title: '', original_price: 0, discounted_price: 0 })}
                                                                    className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 shadow-sm"
                                                                >
                                                                    + Add Course
                                                                </button>
                                                            )}
                                                        </div>

                                                        {editingCourse && editingCourse.offer_id === offer.id && (
                                                            <form onSubmit={handleCreateOrUpdateCourse} className="mb-4 p-4 bg-white rounded shadow-sm border border-indigo-200">
                                                                <h5 className="font-bold mb-3 text-sm text-gray-700 uppercase tracking-wide">{editingCourse.id ? 'Edit Course' : 'Add New Course'}</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                    <div className="md:col-span-2">
                                                                        <input placeholder="Course Title" className="w-full border p-2 rounded text-sm outline-none" value={editingCourse.title || ''} onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })} required />
                                                                    </div>
                                                                    <input type="number" placeholder="Original Price" className="border p-2 rounded text-sm outline-none" value={editingCourse.original_price || ''} onChange={e => setEditingCourse({ ...editingCourse, original_price: Number(e.target.value) })} required />
                                                                    <input type="number" placeholder="Discounted Price" className="border p-2 rounded text-sm outline-none" value={editingCourse.discounted_price || ''} onChange={e => setEditingCourse({ ...editingCourse, discounted_price: Number(e.target.value) })} required />
                                                                </div>
                                                                <div className="mt-3 flex gap-2 justify-end">
                                                                    <button type="button" onClick={() => setEditingCourse(null)} className="text-gray-500 px-4 py-1 rounded text-sm hover:text-gray-700">Cancel</button>
                                                                    <button type="submit" className="bg-indigo-600 text-white px-5 py-1 rounded text-sm hover:bg-indigo-700 font-medium">Save Course</button>
                                                                </div>
                                                            </form>
                                                        )}

                                                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-100 text-gray-600">
                                                                    <tr className="text-left">
                                                                        <th className="p-2 pl-4">Course Title</th>
                                                                        <th className="p-2">Original</th>
                                                                        <th className="p-2">Discounted</th>
                                                                        <th className="p-2 text-right pr-4">Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {courses[offer.id]?.map((course, idx) => (
                                                                        <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                                                            <td className="p-2 pl-4 font-medium text-gray-800">{course.title}</td>
                                                                            <td className="p-2 text-gray-400 line-through">৳{course.original_price}</td>
                                                                            <td className="p-2 font-bold text-green-600">৳{course.discounted_price}</td>
                                                                            <td className="p-2 text-right pr-4">
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <button onClick={() => handleMoveCourse(offer.id, idx, 'up')} disabled={idx === 0} className={`p-1 rounded text-xs ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`} title="Move Up">⬆️</button>
                                                                                    <button onClick={() => handleMoveCourse(offer.id, idx, 'down')} disabled={idx === (courses[offer.id]?.length || 0) - 1} className={`p-1 rounded text-xs ${idx === (courses[offer.id]?.length || 0) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`} title="Move Down">⬇️</button>
                                                                                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                                                                    <button onClick={() => setEditingCourse(course)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs px-2 py-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
                                                                                    <button onClick={() => handleDeleteCourse(course.id, offer.id)} className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {(!courses[offer.id] || courses[offer.id].length === 0) && (
                                                                        <tr>
                                                                            <td colSpan={4} className="p-6 text-center text-gray-400 italic">No courses added to this campaign yet.</td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {offers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-4 text-center text-gray-500">No campaigns found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* ======================== GIFTS TAB ======================== */}
            {activeTab === 'gifts' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Gift Items</h2>
                        <button
                            onClick={() => {
                                setEditingGift({ name: '', emoji: '🎁', is_visible: true, show_in_popup: false, sort_order: gifts.length + 1 });
                                setGiftImageFile(null);
                                setGiftImagePreview(null);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                        >
                            + Add Gift Item
                        </button>
                    </div>

                    {/* Gift Form Modal */}
                    {editingGift && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
                                <button
                                    onClick={() => { setEditingGift(null); setGiftImageFile(null); setGiftImagePreview(null); }}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
                                >✕</button>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">
                                    {editingGift.id ? 'Edit Gift Item' : 'New Gift Item'}
                                </h2>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setGiftSaving(true);
                                        let imageUrl = editingGift.image_url;
                                        if (giftImageFile) {
                                            const tempId = editingGift.id || crypto.randomUUID();
                                            imageUrl = await uploadGiftImage(giftImageFile, tempId) || undefined;
                                        }
                                        const payload = { ...editingGift, image_url: imageUrl } as GiftItem;
                                        if (editingGift.id) {
                                            await updateGiftItem(editingGift.id, payload);
                                        } else {
                                            await addGiftItem({
                                                name: payload.name || '',
                                                emoji: payload.emoji || '🎁',
                                                image_url: payload.image_url,
                                                is_visible: payload.is_visible ?? true,
                                                show_in_popup: payload.show_in_popup ?? false,
                                                sort_order: payload.sort_order || 0,
                                            });
                                        }
                                        setEditingGift(null);
                                        setGiftImageFile(null);
                                        setGiftImagePreview(null);
                                        setGiftSaving(false);
                                        loadGifts();
                                    }}
                                    className="space-y-4"
                                >
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">গিফটের ছবি (ঐচ্ছিক)</label>
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors bg-gray-50"
                                                onClick={() => giftFileInputRef.current?.click()}
                                            >
                                                {giftImagePreview || editingGift.image_url ? (
                                                    <img src={giftImagePreview || editingGift.image_url} alt="preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl">{editingGift.emoji || '🎁'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <button type="button" onClick={() => giftFileInputRef.current?.click()} className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                                    📁 ছবি আপলোড করুন
                                                </button>
                                                {(giftImagePreview || editingGift.image_url) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => { setGiftImageFile(null); setGiftImagePreview(null); setEditingGift(prev => prev ? { ...prev, image_url: undefined } : null); }}
                                                        className="w-full mt-1 py-1 text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        🗑️ ছবি সরান
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <input ref={giftFileInputRef} type="file" accept="image/*" className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) { setGiftImageFile(file); setGiftImagePreview(URL.createObjectURL(file)); }
                                            }}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">গিফটের নাম *</label>
                                            <input type="text" required value={editingGift.name || ''} onChange={e => setEditingGift(prev => ({ ...prev!, name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="স্মার্টফোন" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">ইমোজি</label>
                                            <input type="text" value={editingGift.emoji || '🎁'} onChange={e => setEditingGift(prev => ({ ...prev!, emoji: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="🎁" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">সর্ট অর্ডার</label>
                                            <input type="number" value={editingGift.sort_order || 0} onChange={e => setEditingGift(prev => ({ ...prev!, sort_order: Number(e.target.value) }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none" />
                                        </div>
                                        <div className="flex items-center gap-2 mt-6">
                                            <input type="checkbox" id="gift-visible" checked={editingGift.is_visible ?? true} onChange={e => setEditingGift(prev => ({ ...prev!, is_visible: e.target.checked }))} className="h-5 w-5" />
                                            <label htmlFor="gift-visible" className="text-sm font-bold text-gray-700">স্ক্রিনে দেখাবে</label>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <input type="checkbox" id="gift-popup" checked={editingGift.show_in_popup ?? false} onChange={e => setEditingGift(prev => ({ ...prev!, show_in_popup: e.target.checked }))} className="h-5 w-5 text-blue-600" />
                                        <label htmlFor="gift-popup" className="text-sm font-bold text-blue-700 font-bengali">পপ-আপ এ দেখাবে (Pop-up Display)</label>
                                    </div>

                                    <button type="submit" disabled={giftSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50 mt-4">
                                        {giftSaving ? 'সংরক্ষণ করছে...' : (editingGift.id ? 'আপডেট করুন' : 'যোগ করুন')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Gift Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {gifts.map((gift) => (
                            <div key={gift.id} className={`bg-white rounded-xl shadow border-2 overflow-hidden transition-all ${gift.is_visible ? 'border-green-200' : 'border-gray-200 opacity-60'}`}>
                                <div className="h-32 flex items-center justify-center bg-gray-50">
                                    {gift.image_url ? (
                                        <img src={gift.image_url} alt={gift.name} className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <span className="text-5xl">{gift.emoji}</span>
                                    )}
                                    {gift.show_in_popup && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse z-10">
                                            POPUP
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <p className="font-bold text-sm text-gray-800 text-center truncate font-bengali">{gift.name}</p>
                                    <p className="text-xs text-center text-gray-400 mt-1">#{gift.sort_order}</p>
                                    <div className="flex flex-col gap-2 mt-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => { await updateGiftItem(gift.id, { is_visible: !gift.is_visible }); loadGifts(); }}
                                                className={`flex-1 py-1 rounded text-xs font-bold transition ${gift.is_visible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                            >
                                                {gift.is_visible ? '👁 দেখা যায়' : '🚫 লুকানো'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingGift(gift); setGiftImagePreview(null); setGiftImageFile(null); }}
                                                className="px-2 py-1 rounded text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold"
                                            >✏️</button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm(`"${gift.name}" মুছে ফেলবেন?`)) {
                                                        if (gift.image_url) await deleteGiftImage(gift.image_url);
                                                        await deleteGiftItem(gift.id);
                                                        loadGifts();
                                                    }
                                                }}
                                                className="px-2 py-1 rounded text-xs bg-red-50 text-red-500 hover:bg-red-100 font-bold"
                                            >🗑️</button>
                                        </div>
                                        <button
                                            onClick={async () => { await updateGiftItem(gift.id, { show_in_popup: !gift.show_in_popup }); loadGifts(); }}
                                            className={`w-full py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${gift.show_in_popup ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
                                        >
                                            {gift.show_in_popup ? '⚡ পপ-আপ চালু' : '💨 পপ-আপ অফ'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {gifts.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                কোনো গিফট আইটেম নেই। উপরের বাটনে ক্লিক করে যোগ করুন।
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ======================== BACKGROUND TAB ======================== */}
            {activeTab === 'background' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Background Management</h2>
                    </div>

                    {/* Upload Section */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-10 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Upload New Background</h3>
                        <form onSubmit={handleBgUpload} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-grow w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={bgFileInputRef}
                                    onChange={(e) => setBgImageFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-blue/10 file:text-brand-blue hover:file:bg-brand-blue/20"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={bgSaving || !bgImageFile}
                                className="px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-red transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {bgSaving ? 'Uploading...' : 'Upload & Save'}
                            </button>
                        </form>
                    </div>

                    {/* Background Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Default Option (No Custom Background) */}
                        <div className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${backgrounds.every(b => !b.is_active) ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100'}`}>
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                                <span className="text-gray-400 font-medium">Theme Default</span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-800 mb-3">No Background</h4>
                                {backgrounds.some(b => b.is_active) ? (
                                    <button
                                        onClick={() => handleActivateBackground(null)}
                                        className="w-full py-2 text-sm font-bold text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 rounded-lg"
                                    >
                                        Use Default
                                    </button>
                                ) : (
                                    <div className="w-full py-2 text-sm font-bold text-green-600 bg-green-50 text-center rounded-lg">
                                        ACTIVE
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Custom Backgrounds */}
                        {backgrounds.map((bg) => (
                            <div key={bg.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${bg.is_active ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-gray-300'}`}>
                                <div className="h-40 relative group">
                                    <img src={bg.image_url} alt={bg.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleBgDelete(bg)}
                                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    {bg.is_active && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">ACTIVE</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h4 className="font-bold text-gray-800 mb-3 line-clamp-1" title={bg.name}>{bg.name}</h4>
                                    {!bg.is_active && (
                                        <button
                                            onClick={() => handleActivateBackground(bg.id)}
                                            className="w-full py-2 text-sm font-bold text-brand-blue bg-brand-blue/5 hover:bg-brand-blue/10 rounded-lg"
                                        >
                                            Activate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
