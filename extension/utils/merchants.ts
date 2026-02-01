export interface MerchantConfig {
  id: string;
  name: string;
  knotId: number;  // Knot API merchant ID from active_merchants.csv
  hostPatterns: RegExp[];      // Match any page on site
  checkoutPatterns: RegExp[];  // Match checkout specifically
  category: string;
}

// Active merchants from active_merchants.csv
export const MERCHANTS: Record<string, MerchantConfig> = {
  // ID: 10 - Uber (Rideshare)
  uber: {
    id: 'uber',
    name: 'Uber',
    knotId: 10,
    hostPatterns: [/uber\.com/],
    checkoutPatterns: [/uber\.com\/checkout/, /uber\.com\/payment/],
    category: 'rideshare',
  },

  // ID: 13 - Spotify (Streaming)
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    knotId: 13,
    hostPatterns: [/spotify\.com/],
    checkoutPatterns: [/spotify\.com\/checkout/, /spotify\.com\/premium/],
    category: 'streaming',
  },

  // ID: 19 - DoorDash (Food Delivery)
  doordash: {
    id: 'doordash',
    name: 'DoorDash',
    knotId: 19,
    hostPatterns: [/doordash\.com/],
    checkoutPatterns: [/doordash\.com\/checkout/],
    category: 'food_delivery',
  },

  // ID: 38 - Grubhub (Food Delivery)
  grubhub: {
    id: 'grubhub',
    name: 'Grubhub',
    knotId: 38,
    hostPatterns: [/grubhub\.com/],
    checkoutPatterns: [/grubhub\.com\/checkout/],
    category: 'food_delivery',
  },

  // ID: 44 - Amazon (Shopping)
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    knotId: 44,
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

  // ID: 60 - Apple (Shopping/Services)
  apple: {
    id: 'apple',
    name: 'Apple',
    knotId: 60,
    hostPatterns: [/apple\.com/],
    checkoutPatterns: [/apple\.com\/shop\/checkout/, /apple\.com\/shop\/bag/],
    category: 'shopping',
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
