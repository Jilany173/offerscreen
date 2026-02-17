import React, { useState, useEffect } from 'react';
import { fetchAllOffers, createOffer, updateOffer, deleteOffer, fetchCoursesForOffer, createCourse, updateCourse, deleteCourse } from '../../services/offerService';
import { fetchActiveTheme, updateTheme, fetchAllThemes, createTheme, deleteTheme, setActiveTheme, ThemeSettings } from '../../services/themeService';
import { Offer, Course } from '../../types';

const AdminPanel: React.FC = () => {
    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm) in LOCAL time
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
        const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    // Campaign State
    const [offers, setOffers] = useState<Offer[]>([]);
    const [courses, setCourses] = useState<Record<string, Course[]>>({});
    const [loading, setLoading] = useState(true);
    const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);
    const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

    // Theme State
    const [activeTab, setActiveTab] = useState<'campaigns' | 'theme'>('campaigns');
    const [allThemes, setAllThemes] = useState<ThemeSettings[]>([]);
    const [editingTheme, setEditingTheme] = useState<ThemeSettings | null>(null);
    const [isCreatingTheme, setIsCreatingTheme] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        await Promise.all([loadOffers(), loadThemes()]);
        setLoading(false);
    };

    const loadOffers = async () => {
        const data = await fetchAllOffers();
        setOffers(data);
    };

    const loadThemes = async () => {
        const themes = await fetchAllThemes();
        setAllThemes(themes);
    };

    // --- Campaign Handlers ---

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingOffer) return;

        if (editingOffer.id) {
            await updateOffer(editingOffer.id, editingOffer);
        } else {
            // @ts-ignore - ID is auto-generated
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

    const handleAddNew = () => {
        setEditingOffer({
            title: '',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 86400000).toISOString(),
            is_active: false,
            description: ''
        });
    };

    const handleEdit = (offer: Offer) => {
        setEditingOffer(offer);
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

    const refreshCourses = async (offerId: string) => {
        const offerCourses = await fetchCoursesForOffer(offerId);
        setCourses(prev => ({ ...prev, [offerId]: offerCourses }));
    }

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
    }

    // --- Theme Handlers ---

    const handleAddTheme = () => {
        setEditingTheme({
            header_text_1: 'New Theme',
            header_text_2: '150 Hours',
            background_style: 'default',
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
            await updateTheme(editingTheme.id, editingTheme);
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
            </div>

            {activeTab === 'theme' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Theme Library</h2>
                        <button
                            onClick={handleAddTheme}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                        >
                            + Add New Theme
                        </button>
                    </div>

                    {/* Theme List */}
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mb-10">
                        {allThemes.map((theme) => (
                            <div key={theme.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-2 transition-all ${theme.is_active ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100 hover:border-gray-300'}`}>
                                <div className={`h-32 w-full flex items-center justify-center relative ${theme.background_style === 'theme-2' ? 'bg-gray-800' : 'bg-brand-blue/5'}`}>
                                    {theme.background_style === 'theme-2' && <img src="/bg-theme-2.png" alt="Theme 2" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                                    {theme.background_style === 'default' && <div className="text-gray-400 font-medium">Default Pattern</div>}

                                    {theme.is_active && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            ACTIVE
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{theme.header_text_1 || "Untitled"}</h3>
                                        <p className="text-sm text-gray-500">{theme.header_text_2}</p>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        {!theme.is_active && (
                                            <button
                                                onClick={() => handleActivateTheme(theme.id!)}
                                                className="flex-1 py-2 text-sm font-bold text-green-600 bg-green-50 hover:bg-green-100 rounded-lg"
                                            >
                                                Activate
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingTheme(theme)}
                                            className="flex-1 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                                        >
                                            Edit
                                        </button>
                                        {!theme.is_active && (
                                            <button
                                                onClick={() => handleDeleteTheme(theme.id!)}
                                                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                                            >
                                                🗑️
                                            </button>
                                        )}
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
                                >
                                    ✕
                                </button>

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
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-800"
                                            placeholder="e.g. Ramadan Special"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Highlighted Text (Animated)</label>
                                        <input
                                            type="text"
                                            value={editingTheme?.header_text_2 || ''}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, header_text_2: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400 text-gray-800"
                                            placeholder="e.g. 150 Hours"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Background Style</label>
                                        <select
                                            value={editingTheme?.background_style || 'default'}
                                            onChange={(e) => setEditingTheme(prev => ({ ...prev!, background_style: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue outline-none bg-white font-medium text-gray-700"
                                        >
                                            <option value="default">Default (Blue Grid Pattern)</option>
                                            <option value="theme-2">Theme 2 (Ramadan Image)</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-brand-blue text-white rounded-xl font-bold text-lg hover:bg-brand-red transition-colors shadow-lg mt-4"
                                    >
                                        {isCreatingTheme ? 'Create Theme' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'campaigns' && (
                <>
                    {!editingOffer && (
                        <button
                            onClick={handleAddNew}
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
                                    <input
                                        className="w-full border p-2 rounded"
                                        value={editingOffer.title || ''}
                                        onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">Start Time</label>
                                    <input
                                        className="w-full border p-2 rounded"
                                        type="datetime-local"
                                        value={editingOffer.start_time ? toLocalISOString(new Date(editingOffer.start_time)) : ''}
                                        onChange={e => setEditingOffer({ ...editingOffer, start_time: new Date(e.target.value).toISOString() })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">Duration (Hours)</label>
                                    <input
                                        className="w-full border p-2 rounded"
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        placeholder="e.g. 150"
                                        value={editingOffer.start_time && editingOffer.end_time ?
                                            ((new Date(editingOffer.end_time).getTime() - new Date(editingOffer.start_time).getTime()) / 3600000).toFixed(1)
                                            : ''}
                                        onChange={e => {
                                            const hours = parseFloat(e.target.value);
                                            if (!isNaN(hours) && editingOffer.start_time) {
                                                const start = new Date(editingOffer.start_time);
                                                const end = new Date(start.getTime() + (hours * 3600000));
                                                setEditingOffer({ ...editingOffer, end_time: end.toISOString() });
                                            }
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-semibold">End Time</label>
                                    <input
                                        className="w-full border p-2 rounded"
                                        type="datetime-local"
                                        value={editingOffer.end_time ? toLocalISOString(new Date(editingOffer.end_time)) : ''}
                                        onChange={e => setEditingOffer({ ...editingOffer, end_time: new Date(e.target.value).toISOString() })}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block mb-1">Description</label>
                                    <textarea
                                        className="w-full border p-2 rounded"
                                        value={editingOffer.description || ''}
                                        onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2 h-5 w-5"
                                        checked={editingOffer.is_active || false}
                                        onChange={e => setEditingOffer({ ...editingOffer, is_active: e.target.checked })}
                                    />
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
                                                    <button
                                                        onClick={() => toggleExpandOffer(offer.id)}
                                                        className="bg-indigo-500 text-white px-3 py-1 rounded text-xs hover:bg-indigo-600 transition-colors"
                                                    >
                                                        {expandedOfferId === offer.id ? 'Close' : 'Courses'}
                                                    </button>
                                                    <button onClick={() => handleEdit(offer)} className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600 transition-colors">Edit</button>
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

                                                        {/* Course Edit Form */}
                                                        {editingCourse && editingCourse.offer_id === offer.id && (
                                                            <form onSubmit={handleCreateOrUpdateCourse} className="mb-4 p-4 bg-white rounded shadow-sm border border-indigo-200">
                                                                <h5 className="font-bold mb-3 text-sm text-gray-700 uppercase tracking-wide">{editingCourse.id ? 'Edit Course' : 'Add New Course'}</h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                                    <div className="md:col-span-2">
                                                                        <input
                                                                            placeholder="Course Title"
                                                                            className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                                                            value={editingCourse.title || ''}
                                                                            onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                                                            required
                                                                        />
                                                                    </div>
                                                                    <input
                                                                        type="number" placeholder="Original Price"
                                                                        className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                                                        value={editingCourse.original_price || ''}
                                                                        onChange={e => setEditingCourse({ ...editingCourse, original_price: Number(e.target.value) })}
                                                                        required
                                                                    />
                                                                    <input
                                                                        type="number" placeholder="Discounted Price"
                                                                        className="border p-2 rounded text-sm focus:ring-2 focus:ring-indigo-200 outline-none"
                                                                        value={editingCourse.discounted_price || ''}
                                                                        onChange={e => setEditingCourse({ ...editingCourse, discounted_price: Number(e.target.value) })}
                                                                        required
                                                                    />
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
                                                                        <tr key={course.id} className="hover:bg-gray-50 border-b last:border-0 border-gray-100 transition-colors">
                                                                            <td className="p-2 pl-4 font-medium text-gray-800">{course.title}</td>
                                                                            <td className="p-2 text-gray-400 line-through">৳{course.original_price}</td>
                                                                            <td className="p-2 font-bold text-green-600">৳{course.discounted_price}</td>
                                                                            <td className="p-2 text-right pr-4">
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <button
                                                                                        onClick={() => handleMoveCourse(offer.id, idx, 'up')}
                                                                                        disabled={idx === 0}
                                                                                        className={`p-1 rounded text-xs transition-colors ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`}
                                                                                        title="Move Up"
                                                                                    >
                                                                                        ⬆️
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleMoveCourse(offer.id, idx, 'down')}
                                                                                        disabled={idx === (courses[offer.id]?.length || 0) - 1}
                                                                                        className={`p-1 rounded text-xs transition-colors ${idx === (courses[offer.id]?.length || 0) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-100'}`}
                                                                                        title="Move Down"
                                                                                    >
                                                                                        ⬇️
                                                                                    </button>
                                                                                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                                                                                    <button onClick={() => setEditingCourse(course)} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs md:text-sm px-2 py-1 rounded hover:bg-indigo-50 transition-colors">Edit</button>
                                                                                    <button onClick={() => handleDeleteCourse(course.id, offer.id)} className="text-red-500 hover:text-red-700 font-medium text-xs md:text-sm px-2 py-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                    {(!courses[offer.id] || courses[offer.id].length === 0) && (
                                                                        <tr>
                                                                            <td colSpan={4} className="p-6 text-center text-gray-400 italic">
                                                                                No courses added to this campaign yet.
                                                                            </td>
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
            )
            }
        </div >
    );
};

export default AdminPanel;
