
import React, { useState, useEffect } from 'react';
import { fetchAllOffers, createOffer, updateOffer, deleteOffer } from '../../services/offerService';
import { Offer } from '../../types';

const AdminPanel: React.FC = () => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null);

    const loadOffers = async () => {
        setLoading(true);
        const data = await fetchAllOffers();
        setOffers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadOffers();
    }, []);

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

    const handleEdit = (offer: Offer) => {
        setEditingOffer(offer);
    };

    const handleAddNew = () => {
        setEditingOffer({
            title: '',
            original_price: 0,
            discounted_price: 0,
            end_time: new Date().toISOString(),
            is_active: false,
            description: ''
        });
    };

    const handleSetActive = async (id: string) => {
        // Set all others to inactive first (optional, but good for single active offer logic)
        // For now just toggle
        const offer = offers.find(o => o.id === id);
        if (offer) {
            await updateOffer(id, { is_active: !offer.is_active });
            loadOffers();
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Admin Panel - offers</h1>

            {!editingOffer && (
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
                >
                    Add New Offer
                </button>
            )}

            {editingOffer && (
                <form onSubmit={handleCreateOrUpdate} className="bg-white p-6 rounded shadow mb-10 border">
                    <h2 className="text-xl font-bold mb-4">{editingOffer.id ? 'Edit Offer' : 'New Offer'}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Title</label>
                            <input
                                className="w-full border p-2 rounded"
                                value={editingOffer.title || ''}
                                onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">End Time (ISO)</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="datetime-local"
                                value={editingOffer.end_time ? editingOffer.end_time.slice(0, 16) : ''}
                                onChange={e => setEditingOffer({ ...editingOffer, end_time: new Date(e.target.value).toISOString() })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Original Price</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                value={editingOffer.original_price || 0}
                                onChange={e => setEditingOffer({ ...editingOffer, original_price: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Discounted Price</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                value={editingOffer.discounted_price || 0}
                                onChange={e => setEditingOffer({ ...editingOffer, discounted_price: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
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
                            <th className="border p-2 text-left">Price</th>
                            <th className="border p-2 text-left">End Time</th>
                            <th className="border p-2 text-center">Active</th>
                            <th className="border p-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.map(offer => (
                            <tr key={offer.id} className="hover:bg-gray-50">
                                <td className="border p-2">{offer.title}</td>
                                <td className="border p-2">${offer.discounted_price} <span className="text-gray-400 line-through text-xs">${offer.original_price}</span></td>
                                <td className="border p-2 text-sm">{new Date(offer.end_time).toLocaleString()}</td>
                                <td className="border p-2 text-center cursor-pointer" onClick={() => handleSetActive(offer.id)}>
                                    <span className={`px-2 py-1 rounded text-xs text-white ${offer.is_active ? 'bg-green-500' : 'bg-gray-400'}`}>
                                        {offer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="border p-2 text-center">
                                    <button onClick={() => handleEdit(offer)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 text-sm">Edit</button>
                                    <button onClick={() => handleDelete(offer.id)} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {offers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">No offers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPanel;
