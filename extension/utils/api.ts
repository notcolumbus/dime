import type {
  CardRecommendation,
  SwitchCardRequest,
  SwitchCardResponse,
  UserCardsResponse,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { token } = await storage.getItem<{ token: string }>('local:auth') || { token: null };

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getBestCard(merchantId: string): Promise<CardRecommendation> {
  return fetchWithAuth<CardRecommendation>(`/api/best-card?merchant_id=${encodeURIComponent(merchantId)}`);
}

export async function switchCard(request: SwitchCardRequest): Promise<SwitchCardResponse> {
  return fetchWithAuth<SwitchCardResponse>('/api/switch-card', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function getUserCards(): Promise<UserCardsResponse> {
  return fetchWithAuth<UserCardsResponse>('/api/user/cards');
}
