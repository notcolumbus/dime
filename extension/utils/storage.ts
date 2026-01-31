import type { Card } from '../types';

export interface StoredSettings {
  enabled: boolean;
  notificationsEnabled: boolean;
}

export interface StoredAuth {
  token: string | null;
  userId: string | null;
}

export interface StoredCards {
  cards: Card[];
  lastUpdated: number;
}

const DEFAULT_SETTINGS: StoredSettings = {
  enabled: true,
  notificationsEnabled: true,
};

export async function getSettings(): Promise<StoredSettings> {
  const settings = await storage.getItem<StoredSettings>('local:settings');
  return settings || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Partial<StoredSettings>): Promise<void> {
  const current = await getSettings();
  await storage.setItem('local:settings', { ...current, ...settings });
}

export async function getAuth(): Promise<StoredAuth> {
  const auth = await storage.getItem<StoredAuth>('local:auth');
  return auth || { token: null, userId: null };
}

export async function saveAuth(auth: StoredAuth): Promise<void> {
  await storage.setItem('local:auth', auth);
}

export async function clearAuth(): Promise<void> {
  await storage.removeItem('local:auth');
}

export async function getCachedCards(): Promise<StoredCards | null> {
  return storage.getItem<StoredCards>('local:cards');
}

export async function cacheCards(cards: Card[]): Promise<void> {
  await storage.setItem('local:cards', {
    cards,
    lastUpdated: Date.now(),
  });
}
