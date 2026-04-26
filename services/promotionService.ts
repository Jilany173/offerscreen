import { supabase } from '../src/lib/supabaseClient';

export interface Promotion {
    id: string;
    title: string;
    subtitle?: string;
    content?: string;
    type: 'notice' | 'achievement' | 'event';
    emoji: string;
    image_url?: string;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
}

export const fetchActivePromotions = async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
    if (error) { console.error('fetchActivePromotions:', error); return []; }
    return data || [];
};

export const fetchAllPromotions = async (): Promise<Promotion[]> => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) { console.error('fetchAllPromotions:', error); return []; }
    return data || [];
};

export const createPromotion = async (p: Omit<Promotion, 'id' | 'created_at'>): Promise<void> => {
    const { error } = await supabase.from('promotions').insert([p]);
    if (error) console.error('createPromotion:', error);
};

export const updatePromotion = async (id: string, updates: Partial<Promotion>): Promise<void> => {
    const { error } = await supabase.from('promotions').update(updates).eq('id', id);
    if (error) console.error('updatePromotion:', error);
};

export const deletePromotion = async (id: string): Promise<void> => {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) console.error('deletePromotion:', error);
};
