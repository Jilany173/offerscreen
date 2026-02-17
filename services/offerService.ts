
import { supabase } from '../src/lib/supabaseClient';
import { Offer } from '../types';

export const fetchActiveOffer = async (): Promise<Offer | null> => {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching active offer:', error);
        return null;
    }

    return data;
};

export const fetchAllOffers = async (): Promise<Offer[]> => {
    const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching offers:', error);
        return [];
    }

    return data || [];
};

export const createOffer = async (offer: Omit<Offer, 'id'>): Promise<Offer | null> => {
    const { data, error } = await supabase
        .from('offers')
        .insert([offer])
        .select()
        .single();

    if (error) {
        console.error('Error creating offer:', error);
        return null;
    }

    return data;
};

export const updateOffer = async (id: string, offer: Partial<Offer>): Promise<Offer | null> => {
    const { data, error } = await supabase
        .from('offers')
        .update(offer)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating offer:', error);
        return null;
    }

    return data;
};

export const deleteOffer = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting offer:', error);
        return false;
    }

    return true;
};
