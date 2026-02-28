import { supabase } from '../src/lib/supabaseClient';

export interface ThemeSettings {
    id?: string;
    name?: string; // e.g. "Default Theme", "Ramadan Theme"
    header_text_1: string; // e.g. "Ramadan Special"
    header_text_2: string; // e.g. "150 Hours"
    background_style: string; // 'default' or 'theme-2'
    timer_language?: 'en' | 'bn';
    show_gift_marquee: boolean;
    show_gift_popups: boolean;
    card_rotation_interval: number;
    auto_reload_interval?: number;
    is_active: boolean;
}

// Fetch the single active theme for the Offer Screen
export const fetchActiveTheme = async (): Promise<ThemeSettings | null> => {
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

    if (error) {
        // Return default if no active theme found
        return {
            header_text_1: 'Ramadan Special',
            header_text_2: '150 Hours',
            background_style: 'default',
            timer_language: 'bn',
            show_gift_marquee: true,
            show_gift_popups: true,
            card_rotation_interval: 6,
            auto_reload_interval: 20,
            is_active: true
        };
    }
    return data;
};

// Fetch ALL themes for the Admin Panel list
export const fetchAllThemes = async (): Promise<ThemeSettings[]> => {
    const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching themes:", error);
        return [];
    }
    return data || [];
};

// Create a new theme
export const createTheme = async (theme: ThemeSettings): Promise<ThemeSettings | null> => {
    const { data, error } = await supabase
        .from('themes')
        .insert([{
            header_text_1: theme.header_text_1,
            header_text_2: theme.header_text_2,
            background_style: theme.background_style,
            timer_language: theme.timer_language || 'bn',
            show_gift_marquee: theme.show_gift_marquee ?? true,
            show_gift_popups: theme.show_gift_popups ?? true,
            card_rotation_interval: theme.card_rotation_interval ?? 6,
            auto_reload_interval: theme.auto_reload_interval ?? 20,
            is_active: false // Default to inactive when creating
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating theme:", error);
        return null;
    }
    return data;
};

// Update an existing theme
export const updateTheme = async (id: string, updates: Partial<ThemeSettings>): Promise<ThemeSettings | null> => {
    const { data, error } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error("Error updating theme:", error);
        return null;
    }
    return data;
};

// Delete a theme
export const deleteTheme = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting theme:", error);
        return false;
    }
    return true;
};

// Set a specific theme as ACTIVE (and deactivate others)
export const setActiveTheme = async (id: string): Promise<void> => {
    // 1. Deactivate ALL themes first to ensure clean state
    await supabase.from('themes').update({ is_active: false }).not('id', 'is', null);

    // 2. Activate the specific theme
    await supabase.from('themes').update({ is_active: true }).eq('id', id);
};
