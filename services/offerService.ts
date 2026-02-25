
import { supabase } from '../src/lib/supabaseClient';
import { Offer, Course } from '../types';

// Fetch the single active offer with its courses
// Logic: Must be active, started in the past, and not yet ended (optional, but good practice)
export const fetchActiveOffer = async (): Promise<Offer | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('offers')
        .select(`
            *,
            courses (*)
        `)
        .eq('is_active', true)
        .lte('start_time', now) // Started before or now
        .gte('end_time', now)   // Ends in the future
        .single();

    if (error) {
        // If no rows match, it returns an error with code "PGRST116"
        if (error.code !== "PGRST116") {
            console.error('Error fetching active offer:', error);
        }
        return null;
    }

    return data;
};

// Fetch the next upcoming (scheduled) offer — active but not yet started
export const fetchUpcomingOffer = async (): Promise<Offer | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('offers')
        .select(`
            *,
            courses (*)
        `)
        .eq('is_active', true)
        .gt('start_time', now)  // শুরু হয়নি এখনো
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

    if (error) {
        if (error.code !== "PGRST116") {
            console.error('Error fetching upcoming offer:', error);
        }
        return null;
    }

    return data;
};


// Fetch all offers (campaigns)
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

// Fetch courses for a specific offer
export const fetchCoursesForOffer = async (offerId: string): Promise<Course[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('offer_id', offerId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }

    return data || [];
}

export const updateCourseOrder = async (courses: Course[]): Promise<boolean> => {
    // Prepare updates
    const updates = courses.map((course, index) => ({
        id: course.id,
        sort_order: index,
        // We need to include other required fields or at least the PK to update. 
        // Ideally we use upsert or multiple updates. 
        // For simplicity and performance with small lists, we can use `upsert` if we provide all fields, 
        // OR we can iterate. Since we only want to update sort_order, iteration is safest if we don't have full objects, 
        // but `courses` passed here should be the full objects from the state.
    }));

    // Using upsert for batch update if supported well, or individual updates.
    // Supabase JS upsert works well.
    const { error } = await supabase
        .from('courses')
        .upsert(updates, { onConflict: 'id' });

    if (error) {
        console.error('Error updating course order:', error);
        return false;
    }

    return true;
};

// --- Offer (Campaign) Management ---

export const createOffer = async (offer: Omit<Offer, 'id' | 'courses'>): Promise<Offer | null> => {
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

// --- Course Management ---

export const createCourse = async (course: Omit<Course, 'id'>): Promise<Course | null> => {
    const { data, error } = await supabase
        .from('courses')
        .insert([course])
        .select()
        .single();

    if (error) {
        console.error('Error creating course:', error);
        return null;
    }
    return data;
}

export const updateCourse = async (id: string, course: Partial<Course>): Promise<Course | null> => {
    const { data, error } = await supabase
        .from('courses')
        .update(course)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating course:', error);
        return null;
    }

    return data;
}

export const deleteCourse = async (id: string): Promise<boolean> => {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting course:', error);
        return false;
    }

    return true;
}
