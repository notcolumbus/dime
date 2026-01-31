export interface Card {
  id: string;
  name: string;
  last_four: string;
  reward_rate: number;
  reward_type: 'percent' | 'points';
  reward_categories?: Record<string, number>;
}

export interface CardRecommendation {
  current_card: Card | null;
  best_card: Card;
  potential_savings: number;
  explanation: string;
}

export interface SwitchCardRequest {
  user_id: string;
  merchant_id: string;
  current_card_id: string;
  switch_to_card_id: string;
}

export interface SwitchCardResponse {
  success: boolean;
  message: string;
  knot_session_id?: string;
}

export interface UserCardsResponse {
  cards: Card[];
}

export type MessageType =
  | 'GET_BEST_CARD'
  | 'SWITCH_CARD'
  | 'GET_USER_CARDS'
  | 'CARD_RECOMMENDATION'
  | 'SWITCH_RESULT';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export interface GetBestCardPayload {
  merchantId: string;
}

export interface SwitchCardPayload {
  merchantId: string;
  currentCardId: string;
  switchToCardId: string;
}
