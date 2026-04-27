import { supabase } from '../src/lib/supabaseClient';
import { MediaItem } from '../types';

// Fetch all active media items for display, ordered by sort_order
export const fetchActiveMedia = async (): Promise<MediaItem[]> => {
    const { data, error } = await supabase
        .from('media_playlist')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching active media:', error);
        return [];
    }
    return data || [];
};

// Fetch all media items for the Admin Panel
export const fetchAllMedia = async (): Promise<MediaItem[]> => {
    const { data, error } = await supabase
        .from('media_playlist')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching all media:', error);
        return [];
    }
    return data || [];
};

export const createMediaItem = async (mediaItem: Omit<MediaItem, 'id' | 'created_at' | 'updated_at'>): Promise<MediaItem | null> => {
    const { data, error } = await supabase
        .from('media_playlist')
        .insert([mediaItem])
        .select()
        .single();

    if (error) {
        alert("Database Error: " + error.message + "\n\nDid you run the SQL migration?");
        console.error('Error creating media item:', error);
        return null;
    }
    return data;
};

export const updateMediaItem = async (id: string, updates: Partial<MediaItem>): Promise<MediaItem | null> => {
    const { data, error } = await supabase
        .from('media_playlist')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating media item:', error);
        return null;
    }
    return data;
};

export const deleteMediaItem = async (id: string, mediaUrl?: string): Promise<boolean> => {
    try {
        console.log('Attempting to delete media item:', id);
        
        // Use Promise.allSetled to run both deletions independently
        // This ensures that even if file deletion fails, DB record is removed
        const results = await Promise.allSettled([
            mediaUrl ? deleteMediaFileFromServer(mediaUrl) : Promise.resolve(true),
            supabase.from('media_playlist').delete().eq('id', id)
        ]);

        const dbResult = results[1];
        if (dbResult.status === 'fulfilled' && !dbResult.value.error) {
            console.log('Success: Media deleted from Supabase');
            return true;
        } else {
            const error = dbResult.status === 'fulfilled' ? dbResult.value.error : dbResult.reason;
            console.error('Error deleting from Supabase:', error);
            return false;
        }
    } catch (err) {
        console.error('Unexpected error in deleteMediaItem:', err);
        return false;
    }
};

// Update order for drag-and-drop
export const updateMediaOrder = async (items: MediaItem[]): Promise<boolean> => {
    const updates = items.map((item, index) => ({
        ...item,
        sort_order: index,
    }));

    const { error } = await supabase
        .from('media_playlist')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error('Error updating media order:', error);
        return false;
    }
    return true;
};

// --- cPanel File Management ---
const CPANEL_UPLOAD_URL = 'https://hz.jkcshiru.com/upload_media.php';
const CPANEL_DELETE_URL = 'https://hz.jkcshiru.com/delete_media.php';

// Utility to delete a file from cPanel via PHP script
export const deleteMediaFileFromServer = async (mediaUrl: string): Promise<boolean> => {
    try {
        // Set a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const response = await fetch(CPANEL_DELETE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media_url: mediaUrl }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn('Server delete request failed with status:', response.status);
            return false;
        }

        const result = await response.json();
        if (result.status === 'success') {
            console.log('Server-side file delete success:', result.message);
            return true;
        } else {
            console.warn('PHP Delete Warning:', result.message);
            return false;
        }
    } catch (error) {
        console.error('Error connecting to cPanel delete script:', error);
        return false;
    }
};

// Utility to upload a file to cPanel via PHP script with Progress Tracking
export const uploadMediaFile = async (
    file: File, 
    onProgress?: (percent: number) => void
): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('file', file);

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const result = JSON.parse(xhr.responseText);
                    if (result.status === 'success') {
                        resolve(result.url);
                    } else {
                        alert("Upload Error: " + (result.message || "Unknown error"));
                        resolve(null);
                    }
                } catch (e) {
                    alert("Server Error: Invalid response format.");
                    resolve(null);
                }
            } else {
                alert("Upload failed with status: " + xhr.status);
                resolve(null);
            }
        });

        xhr.addEventListener('error', () => {
            alert("Network Error: Could not connect to the upload server.");
            resolve(null);
        });

        xhr.addEventListener('abort', () => {
            resolve(null);
        });

        xhr.open('POST', CPANEL_UPLOAD_URL);
        xhr.send(formData);

        // Store reference if we need to cancel (optional expansion)
    });
};

// Signage Settings
export const fetchSignageSettings = async (): Promise<Record<string, string>> => {
    const { data, error } = await supabase
        .from('signage_settings')
        .select('key, value');

    if (error) {
        console.error('Error fetching signage settings:', error);
        return {};
    }

    const settings: Record<string, string> = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });
    return settings;
};

export const updateSignageSetting = async (key: string, value: string): Promise<boolean> => {
    const { error } = await supabase
        .from('signage_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
        console.error(`Error updating signage setting ${key}:`, error);
        return false;
    }
    return true;
};

export interface TickerMessage {
    id: string;
    message: string;
    is_active: boolean;
    sort_order: number;
}

// Ticker Messages
export const fetchTickerMessages = async (): Promise<TickerMessage[]> => {
    const { data, error } = await supabase
        .from('ticker_messages')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error) {
        console.error('Error fetching ticker messages:', error);
        return [];
    }
    return data || [];
};

export const createTickerMessage = async (message: string, count: number): Promise<TickerMessage | null> => {
    const { data, error } = await supabase
        .from('ticker_messages')
        .insert([{ message, is_active: true, sort_order: count }])
        .select();

    if (error) {
        console.error('Supabase Error creating ticker message:', error.message, error.details);
        return null;
    }
    return data ? data[0] : null;
};


export const updateTickerMessage = async (id: string, updates: Partial<TickerMessage>): Promise<boolean> => {
    const { error } = await supabase
        .from('ticker_messages')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating ticker message:', error);
        return false;
    }
    return true;
};

export const deleteTickerMessage = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('ticker_messages')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting ticker message:', error);
        return false;
    }
    return true;
};


// System Health
export const updateHeartbeat = async (): Promise<void> => {
    await supabase
        .from('system_health')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', 'main_display');
};

export const fetchSystemHealth = async (): Promise<{ last_seen: string } | null> => {
    const { data } = await supabase.from('system_health').select('last_seen').eq('id', 'main_display').single();
    return data;
};
