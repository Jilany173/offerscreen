import { supabase } from '../src/lib/supabaseClient';

export interface BackgroundImage {
    id: string;
    name: string;
    image_url: string;
    is_active: boolean;
    created_at?: string;
}

// Fetch all backgrounds
export const fetchBackgrounds = async (): Promise<BackgroundImage[]> => {
    const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching backgrounds:', error);
        return [];
    }
    return data || [];
};

// Fetch the currently active background
export const fetchActiveBackground = async (): Promise<BackgroundImage | null> => {
    const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

    if (error) {
        // Not necessarily an error if no active background found
        return null;
    }
    return data;
};

// Add a new background
export const addBackground = async (name: string, imageUrl: string): Promise<BackgroundImage | null> => {
    const { data, error } = await supabase
        .from('background_images')
        .insert([{ name, image_url: imageUrl, is_active: false }])
        .select()
        .single();

    if (error) {
        console.error('Error adding background:', error);
        return null;
    }
    return data;
};

// Set a specific background as ACTIVE (and deactivate others)
export const setActiveBackground = async (id: string | null): Promise<void> => {
    // 1. Deactivate ALL first
    await supabase.from('background_images').update({ is_active: false }).not('id', 'is', null);

    // 2. Activate specific one if ID provided
    if (id) {
        await supabase.from('background_images').update({ is_active: true }).eq('id', id);
    }
};

// Delete a background
export const deleteBackground = async (id: string, imageUrl: string): Promise<boolean> => {
    // 1. Delete from Storage
    const fileName = imageUrl.split('/').pop();
    if (fileName) {
        await supabase.storage.from('background-images').remove([fileName]);
    }

    // 2. Delete from DB
    const { error } = await supabase.from('background_images').delete().eq('id', id);
    if (error) {
        console.error('Error deleting background:', error);
        return false;
    }
    return true;
};

// Upload image to Storage
export const uploadBackgroundImage = async (file: File): Promise<string | null> => {
    const fileName = `bg-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const { error: uploadError } = await supabase.storage
        .from('background-images')
        .upload(fileName, file);

    if (uploadError) {
        console.error('Error uploading background:', uploadError);
        return null;
    }

    const { data } = supabase.storage.from('background-images').getPublicUrl(fileName);
    return data.publicUrl;
};
