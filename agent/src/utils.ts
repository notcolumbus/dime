/**
 * Shared utilities for the Photon Agent
 */

// Phone number normalization - used in listener, server
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  return "+" + digits;
}

// CORS headers for HTTP responses
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Reaction message prefixes to filter out (iMessage uses curly quotes)
const REACTION_PREFIXES = [
  'Liked \u201c',
  'Loved \u201c',
  'Disliked \u201c',
  'Laughed at \u201c',
  'Emphasized \u201c',
  'Questioned \u201c',
  "Removed a Like",
  "Removed a Love",
];

export function isReactionMessage(text: string): boolean {
  return REACTION_PREFIXES.some((prefix) => text.startsWith(prefix));
}

// Image extension check
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".heic", ".heif"];

export function isImageFile(filename: string | null | undefined): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function getMimeType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".heic")) return "image/heic";
  if (lower.endsWith(".heif")) return "image/heif";
  return "image/jpeg";
}

// Format confirmation message for receipts - shows ALL items
export function formatReceiptConfirmation(
  merchantName: string,
  total: number,
  category: string | null,
  items: { description: string; price: number }[],
  paymentMethod?: string | null
): string {
  let msg = `✅ Receipt processed!\n\nMerchant: ${merchantName}\nTotal: $${total.toFixed(2)}\nCategory: ${category || "Other"}`;

  if (paymentMethod) {
    msg += `\nPayment: ${paymentMethod}`;
  }

  if (items.length > 0) {
    const itemLines = items
      .map((item) => `- ${item.description}: $${item.price.toFixed(2)}`)
      .join("\n");
    msg += `\n\nItems (${items.length}):\n${itemLines}`;
  }

  return msg;
}
