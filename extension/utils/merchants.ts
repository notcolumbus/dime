export interface MerchantConfig {
  id: string;
  name: string;
  hostPatterns: RegExp[];      // Match any page on site
  checkoutPatterns: RegExp[];  // Match checkout specifically
  category: string;
}

export const MERCHANTS: Record<string, MerchantConfig> = {
  // Shopping
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    hostPatterns: [/amazon\.com/],
    checkoutPatterns: [
      /amazon\.com\/gp\/buy\/spc/,
      /amazon\.com\/gp\/buy\/payselect/,
      /amazon\.com\/gp\/buy\/addressselect/,
      /amazon\.com\/checkout\/.*\/spc/,
      /amazon\.com\/checkout/,
    ],
    category: 'shopping',
  },
  walmart: {
    id: 'walmart',
    name: 'Walmart',
    hostPatterns: [/walmart\.com/],
    checkoutPatterns: [/walmart\.com\/checkout/],
    category: 'shopping',
  },
  target: {
    id: 'target',
    name: 'Target',
    hostPatterns: [/target\.com/],
    checkoutPatterns: [/target\.com\/checkout/, /target\.com\/co-review/],
    category: 'shopping',
  },
  bestbuy: {
    id: 'bestbuy',
    name: 'Best Buy',
    hostPatterns: [/bestbuy\.com/],
    checkoutPatterns: [/bestbuy\.com\/checkout/, /bestbuy\.com\/cart\/c/],
    category: 'shopping',
  },
  macys: {
    id: 'macys',
    name: "Macy's",
    hostPatterns: [/macys\.com/],
    checkoutPatterns: [/macys\.com\/checkout/],
    category: 'shopping',
  },
  chewy: {
    id: 'chewy',
    name: 'Chewy',
    hostPatterns: [/chewy\.com/],
    checkoutPatterns: [/chewy\.com\/checkout/],
    category: 'shopping',
  },

  // Streaming
  netflix: {
    id: 'netflix',
    name: 'Netflix',
    hostPatterns: [/netflix\.com/],
    checkoutPatterns: [/netflix\.com\/signup/, /netflix\.com\/simpleSignup/],
    category: 'streaming',
  },
  hulu: {
    id: 'hulu',
    name: 'Hulu',
    hostPatterns: [/hulu\.com/],
    checkoutPatterns: [/hulu\.com\/signup/, /hulu\.com\/checkout/],
    category: 'streaming',
  },
  disney_plus: {
    id: 'disney_plus',
    name: 'Disney+',
    hostPatterns: [/disneyplus\.com/],
    checkoutPatterns: [/disneyplus\.com\/sign-up/, /disneyplus\.com\/checkout/],
    category: 'streaming',
  },
  hbo_max: {
    id: 'hbo_max',
    name: 'HBO Max',
    hostPatterns: [/max\.com/],
    checkoutPatterns: [/max\.com\/checkout/, /max\.com\/subscribe/],
    category: 'streaming',
  },
  peacock: {
    id: 'peacock',
    name: 'Peacock',
    hostPatterns: [/peacocktv\.com/],
    checkoutPatterns: [/peacocktv\.com\/checkout/],
    category: 'streaming',
  },
  youtube_tv: {
    id: 'youtube_tv',
    name: 'YouTube TV',
    hostPatterns: [/tv\.youtube\.com/],
    checkoutPatterns: [/tv\.youtube\.com\/checkout/],
    category: 'streaming',
  },
  prime_video: {
    id: 'prime_video',
    name: 'Prime Video',
    hostPatterns: [/amazon\.com\/gp\/video/, /primevideo\.com/],
    checkoutPatterns: [],
    category: 'streaming',
  },
  crunchyroll: {
    id: 'crunchyroll',
    name: 'Crunchyroll',
    hostPatterns: [/crunchyroll\.com/],
    checkoutPatterns: [/crunchyroll\.com\/checkout/],
    category: 'streaming',
  },
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    hostPatterns: [/spotify\.com/],
    checkoutPatterns: [/spotify\.com\/checkout/, /spotify\.com\/premium/],
    category: 'streaming',
  },
  amazon_music: {
    id: 'amazon_music',
    name: 'Amazon Music',
    hostPatterns: [/music\.amazon\.com/],
    checkoutPatterns: [],
    category: 'streaming',
  },
  siriusxm: {
    id: 'siriusxm',
    name: 'SiriusXM',
    hostPatterns: [/siriusxm\.com/],
    checkoutPatterns: [/siriusxm\.com\/checkout/],
    category: 'streaming',
  },
  starz: {
    id: 'starz',
    name: 'STARZ',
    hostPatterns: [/starz\.com/],
    checkoutPatterns: [/starz\.com\/checkout/, /starz\.com\/signup/],
    category: 'streaming',
  },
  audible: {
    id: 'audible',
    name: 'Audible',
    hostPatterns: [/audible\.com/],
    checkoutPatterns: [/audible\.com\/checkout/],
    category: 'streaming',
  },

  // Food Delivery
  doordash: {
    id: 'doordash',
    name: 'DoorDash',
    hostPatterns: [/doordash\.com/],
    checkoutPatterns: [/doordash\.com\/checkout/],
    category: 'food_delivery',
  },
  uber_eats: {
    id: 'uber_eats',
    name: 'Uber Eats',
    hostPatterns: [/ubereats\.com/],
    checkoutPatterns: [/ubereats\.com\/checkout/],
    category: 'food_delivery',
  },
  grubhub: {
    id: 'grubhub',
    name: 'Grubhub',
    hostPatterns: [/grubhub\.com/],
    checkoutPatterns: [/grubhub\.com\/checkout/],
    category: 'food_delivery',
  },
  postmates: {
    id: 'postmates',
    name: 'Postmates',
    hostPatterns: [/postmates\.com/],
    checkoutPatterns: [/postmates\.com\/checkout/],
    category: 'food_delivery',
  },
  caviar: {
    id: 'caviar',
    name: 'Caviar',
    hostPatterns: [/trycaviar\.com/],
    checkoutPatterns: [/trycaviar\.com\/checkout/],
    category: 'food_delivery',
  },
  instacart: {
    id: 'instacart',
    name: 'Instacart',
    hostPatterns: [/instacart\.com/],
    checkoutPatterns: [/instacart\.com\/checkout/],
    category: 'groceries',
  },

  // Rideshare
  uber: {
    id: 'uber',
    name: 'Uber',
    hostPatterns: [/uber\.com/],
    checkoutPatterns: [],
    category: 'rideshare',
  },
  lyft: {
    id: 'lyft',
    name: 'Lyft',
    hostPatterns: [/lyft\.com/],
    checkoutPatterns: [],
    category: 'rideshare',
  },

  // Dining
  burger_king: {
    id: 'burger_king',
    name: 'Burger King',
    hostPatterns: [/bk\.com/],
    checkoutPatterns: [/bk\.com\/checkout/],
    category: 'dining',
  },
};

// Detect merchant from URL (checkout page specifically)
export function detectMerchant(url: string): MerchantConfig | null {
  for (const merchant of Object.values(MERCHANTS)) {
    for (const pattern of merchant.checkoutPatterns) {
      if (pattern.test(url)) {
        return merchant;
      }
    }
  }
  return null;
}

// Detect if we're on any supported merchant site (any page)
export function detectMerchantSite(url: string): MerchantConfig | null {
  for (const merchant of Object.values(MERCHANTS)) {
    for (const pattern of merchant.hostPatterns) {
      if (pattern.test(url)) {
        return merchant;
      }
    }
  }
  return null;
}

// Check if URL is a checkout page
export function isCheckoutPage(url: string): boolean {
  return detectMerchant(url) !== null;
}

// Check if URL is on any supported merchant
export function isSupportedSite(url: string): boolean {
  return detectMerchantSite(url) !== null;
}
