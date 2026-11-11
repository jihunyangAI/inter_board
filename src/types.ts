export type CardColor = 'yellow' | 'pink' | 'green' | 'blue' | 'purple';

export interface PostItMessage {
  id: string;
  board_id: string;
  sender_name: string;
  content: string;
  card_color: CardColor;
  font_style?: string;
  metadata?: {
    x?: number;
    y?: number;
    rotation?: number;
  };
  created_at: string;
}

export interface Board {
  id: string;
  title: string;
  recipient_name: string;
  theme: string;
  is_closed: boolean;
}
