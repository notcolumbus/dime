import type {
  Card,
  CardRecommendation,
  SwitchCardRequest,
  SwitchCardResponse,
  UserCardsResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

// Hardcoded user ID for hackathon demo
export const USER_ID = 'aman';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Backend response types
interface BackendCardResponse {
  card_id: string;
  card_type: string;
  last_four: string;
  benefits?: string;
  cardholder?: string;
  expiry_date?: string;
}

interface BackendOptimalCardResponse {
  recommendation: {
    card_id: string;
    card_type: string;
    last_four: string;
    reason: string;
    benefits?: string;
  } | null;
  merchant: string;
  category: string;
  message?: string;
}

// Transform backend card to frontend Card type
function transformCard(backendCard: BackendCardResponse, index: number = 0): Card {
  // Map card type to a friendly name
  const cardNames: Record<string, string> = {
    visa: 'Visa Card',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover Card',
  };

  return {
    id: backendCard.card_id,
    name: cardNames[backendCard.card_type?.toLowerCase()] || `Card ${index + 1}`,
    last_four: backendCard.last_four || '****',
    reward_rate: 2, // Default reward rate - backend doesn't provide this
    reward_type: 'percent',
  };
}

export async function getBestCard(merchantId: string, category: string = 'shopping'): Promise<CardRecommendation> {
  const response = await fetchApi<BackendOptimalCardResponse>('/api/optimal-card', {
    method: 'POST',
    body: JSON.stringify({
      user_id: USER_ID,
      merchant: merchantId,
      category: category,
    }),
  });

  if (!response.recommendation) {
    throw new Error(response.message || 'No recommendation available');
  }

  // Get all user cards to find current card
  const cardsResponse = await getUserCards();
  const currentCard = cardsResponse.cards.length > 0 ? cardsResponse.cards[0] : null;

  const bestCard: Card = {
    id: response.recommendation.card_id,
    name: response.recommendation.card_type
      ? `${response.recommendation.card_type.charAt(0).toUpperCase() + response.recommendation.card_type.slice(1)} Card`
      : 'Recommended Card',
    last_four: response.recommendation.last_four || '****',
    reward_rate: 3, // Assume better rate for recommended card
    reward_type: 'percent',
  };

  return {
    current_card: currentCard,
    best_card: bestCard,
    potential_savings: currentCard ? bestCard.reward_rate - currentCard.reward_rate : bestCard.reward_rate,
    explanation: response.recommendation.reason || 'Best card for this purchase',
  };
}

export async function switchCard(request: SwitchCardRequest): Promise<SwitchCardResponse> {
  // For hackathon demo, simulate successful switch
  // In production, this would call the Knot API or similar
  console.log('Switch card request:', request);
  return {
    success: true,
    message: 'Card switched successfully',
  };
}

export async function getUserCards(): Promise<UserCardsResponse> {
  const response = await fetchApi<{ cards: BackendCardResponse[] }>(`/api/cards?user_id=${USER_ID}`);

  const cards: Card[] = (response.cards || []).map((card, index) => transformCard(card, index));

  return { cards };
}
