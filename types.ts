export interface TimerState {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  ended: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Offer {
  id: string;
  title: string;
  original_price: number;
  discounted_price: number;
  end_time: string; // ISO string
  description?: string;
  is_active: boolean;
}
