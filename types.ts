export interface TimerState {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  milliseconds: string;
  ended: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Course {
  id: string;
  offer_id: string;
  title: string;
  original_price: number;
  discounted_price: number;
  sort_order?: number;
}

export interface Offer {
  id: string;
  title: string; // Campaign Title (e.g. "Ramadan Special")
  start_time: string; // ISO string
  end_time: string; // ISO string
  is_active: boolean;
  description?: string;
  courses?: Course[];
}

export interface OfferWithCourses extends Offer {
  courses: Course[];
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  media_url: string;
  duration_seconds: number;
  play_with_sound: boolean;
  is_active: boolean;
  sort_order: number;
  group_id?: string;
  group_title?: string;
  headline?: string;
  headline_style?: 'minimal' | 'gradient' | 'bold';
  qr_enabled?: boolean;
  qr_text?: string;
  is_campaign?: boolean;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  active_days?: number[];
  template_type?: string;
  student_name?: string;
  student_score?: string;
  badge_text?: string;
  group_id?: string;
  created_at?: string;
  updated_at?: string;
}
