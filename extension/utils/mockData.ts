import type { Card, CardRecommendation } from '../types';

// User's cards on file (mock data)
export const USER_CARDS: Card[] = [
  {
    id: 'chase_sapphire_preferred',
    name: 'Chase Sapphire Preferred',
    last_four: '4532',
    reward_rate: 2,
    reward_type: 'points',
    reward_categories: {
      travel: 5,
      dining: 3,
      streaming: 3,
      default: 1,
    },
  },
  {
    id: 'amex_gold',
    name: 'Amex Gold',
    last_four: '1234',
    reward_rate: 4,
    reward_type: 'points',
    reward_categories: {
      dining: 4,
      groceries: 4,
      default: 1,
    },
  },
  {
    id: 'chase_freedom_unlimited',
    name: 'Chase Freedom Unlimited',
    last_four: '7890',
    reward_rate: 1.5,
    reward_type: 'percent',
    reward_categories: {
      default: 1.5,
    },
  },
  {
    id: 'capital_one_savor',
    name: 'Capital One SavorOne',
    last_four: '5678',
    reward_rate: 3,
    reward_type: 'percent',
    reward_categories: {
      dining: 3,
      entertainment: 3,
      streaming: 3,
      groceries: 3,
      default: 1,
    },
  },
  {
    id: 'citi_custom_cash',
    name: 'Citi Custom Cash',
    last_four: '9012',
    reward_rate: 5,
    reward_type: 'percent',
    reward_categories: {
      top_category: 5, // 5% on top eligible spend category
      default: 1,
    },
  },
  {
    id: 'amazon_prime_visa',
    name: 'Amazon Prime Visa',
    last_four: '3456',
    reward_rate: 5,
    reward_type: 'percent',
    reward_categories: {
      amazon: 5,
      whole_foods: 5,
      default: 1,
    },
  },
];

// All available credit cards (for recommendations)
export const ALL_CARDS: Card[] = [
  ...USER_CARDS,
  {
    id: 'amex_blue_cash_preferred',
    name: 'Amex Blue Cash Preferred',
    last_four: '',
    reward_rate: 6,
    reward_type: 'percent',
    reward_categories: {
      groceries: 6,
      streaming: 6,
      default: 1,
    },
  },
  {
    id: 'us_bank_altitude_go',
    name: 'US Bank Altitude Go',
    last_four: '',
    reward_rate: 4,
    reward_type: 'points',
    reward_categories: {
      dining: 4,
      delivery: 4,
      default: 1,
    },
  },
];

// Merchant category mappings
export type MerchantCategory =
  | 'streaming'
  | 'food_delivery'
  | 'rideshare'
  | 'shopping'
  | 'groceries'
  | 'dining'
  | 'entertainment';

export interface MerchantInfo {
  id: string;
  name: string;
  domain: string;
  category: MerchantCategory;
  bestCardId: string;
  currentCardId: string; // Simulated "card on file"
}

// All supported merchants with their domains and best cards
export const MERCHANTS_DATA: MerchantInfo[] = [
  // Streaming Services
  { id: 'netflix', name: 'Netflix', domain: 'netflix.com', category: 'streaming', bestCardId: 'amex_blue_cash_preferred', currentCardId: 'chase_freedom_unlimited' },
  { id: 'hulu', name: 'Hulu', domain: 'hulu.com', category: 'streaming', bestCardId: 'amex_blue_cash_preferred', currentCardId: 'chase_freedom_unlimited' },
  { id: 'disney_plus', name: 'Disney+', domain: 'disneyplus.com', category: 'streaming', bestCardId: 'amex_blue_cash_preferred', currentCardId: 'chase_sapphire_preferred' },
  { id: 'hbo_max', name: 'HBO Max', domain: 'max.com', category: 'streaming', bestCardId: 'amex_blue_cash_preferred', currentCardId: 'chase_freedom_unlimited' },
  { id: 'peacock', name: 'Peacock', domain: 'peacocktv.com', category: 'streaming', bestCardId: 'capital_one_savor', currentCardId: 'chase_freedom_unlimited' },
  { id: 'youtube_tv', name: 'YouTube TV', domain: 'tv.youtube.com', category: 'streaming', bestCardId: 'capital_one_savor', currentCardId: 'chase_freedom_unlimited' },
  { id: 'prime_video', name: 'Prime Video', domain: 'amazon.com/primevideo', category: 'streaming', bestCardId: 'amazon_prime_visa', currentCardId: 'chase_sapphire_preferred' },
  { id: 'crunchyroll', name: 'Crunchyroll', domain: 'crunchyroll.com', category: 'streaming', bestCardId: 'capital_one_savor', currentCardId: 'chase_freedom_unlimited' },
  { id: 'spotify', name: 'Spotify', domain: 'spotify.com', category: 'streaming', bestCardId: 'amex_blue_cash_preferred', currentCardId: 'chase_freedom_unlimited' },
  { id: 'amazon_music', name: 'Amazon Music', domain: 'music.amazon.com', category: 'streaming', bestCardId: 'amazon_prime_visa', currentCardId: 'chase_freedom_unlimited' },
  { id: 'siriusxm', name: 'SiriusXM', domain: 'siriusxm.com', category: 'streaming', bestCardId: 'capital_one_savor', currentCardId: 'chase_freedom_unlimited' },
  { id: 'starz', name: 'STARZ', domain: 'starz.com', category: 'streaming', bestCardId: 'capital_one_savor', currentCardId: 'chase_freedom_unlimited' },
  { id: 'audible', name: 'Audible', domain: 'audible.com', category: 'streaming', bestCardId: 'amazon_prime_visa', currentCardId: 'chase_freedom_unlimited' },

  // Food Delivery
  { id: 'doordash', name: 'DoorDash', domain: 'doordash.com', category: 'food_delivery', bestCardId: 'us_bank_altitude_go', currentCardId: 'chase_sapphire_preferred' },
  { id: 'uber_eats', name: 'Uber Eats', domain: 'ubereats.com', category: 'food_delivery', bestCardId: 'us_bank_altitude_go', currentCardId: 'amex_gold' },
  { id: 'grubhub', name: 'Grubhub', domain: 'grubhub.com', category: 'food_delivery', bestCardId: 'amex_gold', currentCardId: 'chase_freedom_unlimited' },
  { id: 'postmates', name: 'Postmates', domain: 'postmates.com', category: 'food_delivery', bestCardId: 'us_bank_altitude_go', currentCardId: 'chase_freedom_unlimited' },
  { id: 'caviar', name: 'Caviar', domain: 'trycaviar.com', category: 'food_delivery', bestCardId: 'amex_gold', currentCardId: 'chase_freedom_unlimited' },

  // Rideshare
  { id: 'uber', name: 'Uber', domain: 'uber.com', category: 'rideshare', bestCardId: 'chase_sapphire_preferred', currentCardId: 'chase_freedom_unlimited' },
  { id: 'lyft', name: 'Lyft', domain: 'lyft.com', category: 'rideshare', bestCardId: 'chase_sapphire_preferred', currentCardId: 'chase_freedom_unlimited' },

  // Shopping
  { id: 'amazon', name: 'Amazon', domain: 'amazon.com', category: 'shopping', bestCardId: 'amazon_prime_visa', currentCardId: 'chase_sapphire_preferred' },
  { id: 'walmart', name: 'Walmart', domain: 'walmart.com', category: 'shopping', bestCardId: 'citi_custom_cash', currentCardId: 'chase_freedom_unlimited' },
  { id: 'target', name: 'Target', domain: 'target.com', category: 'shopping', bestCardId: 'citi_custom_cash', currentCardId: 'chase_freedom_unlimited' },
  { id: 'bestbuy', name: 'Best Buy', domain: 'bestbuy.com', category: 'shopping', bestCardId: 'citi_custom_cash', currentCardId: 'chase_freedom_unlimited' },
  { id: 'macys', name: "Macy's", domain: 'macys.com', category: 'shopping', bestCardId: 'citi_custom_cash', currentCardId: 'chase_freedom_unlimited' },
  { id: 'chewy', name: 'Chewy', domain: 'chewy.com', category: 'shopping', bestCardId: 'citi_custom_cash', currentCardId: 'chase_freedom_unlimited' },
  { id: 'instacart', name: 'Instacart', domain: 'instacart.com', category: 'groceries', bestCardId: 'amex_gold', currentCardId: 'chase_freedom_unlimited' },

  // Dining
  { id: 'burger_king', name: 'Burger King', domain: 'bk.com', category: 'dining', bestCardId: 'amex_gold', currentCardId: 'chase_freedom_unlimited' },
];

// Helper to find card by ID
export function getCardById(cardId: string): Card | undefined {
  return ALL_CARDS.find(card => card.id === cardId);
}

// Helper to find merchant by domain
export function getMerchantByDomain(hostname: string): MerchantInfo | undefined {
  return MERCHANTS_DATA.find(merchant =>
    hostname.includes(merchant.domain) || merchant.domain.includes(hostname.replace('www.', ''))
  );
}

// Get recommendation for a merchant
export function getRecommendationForMerchant(merchantId: string): CardRecommendation | null {
  const merchant = MERCHANTS_DATA.find(m => m.id === merchantId);
  if (!merchant) return null;

  const currentCard = getCardById(merchant.currentCardId);
  const bestCard = getCardById(merchant.bestCardId);

  if (!bestCard) return null;

  const currentRate = currentCard?.reward_rate || 1;
  const bestRate = bestCard.reward_rate;

  return {
    current_card: currentCard || null,
    best_card: bestCard,
    potential_savings: bestRate - currentRate,
    explanation: `Get ${bestRate}% back instead of ${currentRate}%`,
  };
}

// Category display names
export const CATEGORY_LABELS: Record<MerchantCategory, string> = {
  streaming: 'Streaming',
  food_delivery: 'Food Delivery',
  rideshare: 'Rideshare',
  shopping: 'Shopping',
  groceries: 'Groceries',
  dining: 'Dining',
  entertainment: 'Entertainment',
};
