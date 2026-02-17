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
