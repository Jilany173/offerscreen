import { supabase } from '../src/lib/supabaseClient';

export interface ScoreRow {
    score: string;   // e.g. "৬", "৭", "৮"
    count: string;   // e.g. "৫০ জন", "২০ জন"
}

export interface ResultAnnouncement {
    id: string;
    title: string;           // e.g. "ফেব্রুয়ারি ২০২৬"
    headline: string;        // e.g. "১০০ জন শিক্ষার্থী ৬+ স্কোর অর্জন করেছেন"
    score_breakdown: ScoreRow[];
    is_active: boolean;
    sort_order: number;
    created_at?: string;
}

export const fetchActiveAnnouncements = async (): Promise<ResultAnnouncement[]> => {
    const { data, error } = await supabase
        .from('result_announcements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
    if (error) { console.error('fetchActiveAnnouncements:', error); return []; }
    return (data || []).map(d => ({
        ...d,
        score_breakdown: Array.isArray(d.score_breakdown) ? d.score_breakdown : [],
    }));
};

export const fetchAllAnnouncements = async (): Promise<ResultAnnouncement[]> => {
    const { data, error } = await supabase
        .from('result_announcements')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) { console.error('fetchAllAnnouncements:', error); return []; }
    return (data || []).map(d => ({
        ...d,
        score_breakdown: Array.isArray(d.score_breakdown) ? d.score_breakdown : [],
    }));
};

export const createAnnouncement = async (a: Omit<ResultAnnouncement, 'id' | 'created_at'>): Promise<void> => {
    const { error } = await supabase.from('result_announcements').insert([a]);
    if (error) console.error('createAnnouncement:', error);
};

export const updateAnnouncement = async (id: string, updates: Partial<ResultAnnouncement>): Promise<void> => {
    const { error } = await supabase.from('result_announcements').update(updates).eq('id', id);
    if (error) console.error('updateAnnouncement:', error);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
    const { error } = await supabase.from('result_announcements').delete().eq('id', id);
    if (error) console.error('deleteAnnouncement:', error);
};
