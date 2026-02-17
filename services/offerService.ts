
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
