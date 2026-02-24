import { supabase } from '../src/lib/supabaseClient';

export interface GiftItem {
    id: string;
    name: string;
    emoji: string;
    image_url?: string;
    is_visible: boolean;
    sort_order: number;
    created_at?: string;
}

// Fetch all visible gift items for the offer screen
export const fetchVisibleGiftItems = async (): Promise<GiftItem[]> => {
    const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching gift items:', error);
        return [];
    }
    return data || [];
};

// Fetch ALL gift items (for admin panel)
export const fetchAllGiftItems = async (): Promise<GiftItem[]> => {
    const { data, error } = await supabase
        .from('gift_items')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching all gift items:', error);
        return [];
    }
    return data || [];
};

// Add a new gift item
export const addGiftItem = async (
    item: Omit<GiftItem, 'id' | 'created_at'>
): Promise<GiftItem | null> => {
    const { data, error } = await supabase
        .from('gift_items')
        .insert([item])
        .select()
        .single();

    if (error) {
        console.error('Error adding gift item:', error);
        return null;
    }
    return data;
};

// Update a gift item
export const updateGiftItem = async (
    id: string,
    updates: Partial<GiftItem>
): Promise<boolean> => {
    const { error } = await supabase
        .from('gift_items')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating gift item:', error);
        return false;
    }
    return true;
};

// Delete a gift item
export const deleteGiftItem = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('gift_items')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting gift item:', error);
        return false;
    }
    return true;
};

// Upload image to Supabase Storage
export const uploadGiftImage = async (
    file: File,
    giftId: string
): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const fileName = `${giftId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
        .from('gift-images')
        .upload(fileName, file, { upsert: true });

    if (error) {
        console.error('Error uploading gift image:', error);
        return null;
    }

    const { data } = supabase.storage
        .from('gift-images')
        .getPublicUrl(fileName);

    return data.publicUrl;
};

// Delete image from Supabase Storage
export const deleteGiftImage = async (imageUrl: string): Promise<boolean> => {
    const fileName = imageUrl.split('/').pop();
    if (!fileName) return false;

    const { error } = await supabase.storage
        .from('gift-images')
        .remove([fileName]);

    if (error) {
        console.error('Error deleting gift image:', error);
        return false;
    }
    return true;
};
