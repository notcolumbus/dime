import { getBestCard, switchCard, getUserCards, USER_ID } from '../utils/api';
import { getSettings } from '../utils/storage';
import type {
  ExtensionMessage,
  GetBestCardPayload,
  SwitchCardPayload,
  CardRecommendation,
  SwitchCardResponse,
  UserCardsResponse,
} from '../types';

export default defineBackground(() => {
  console.log('Card Optimizer background script loaded');

  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, _sender, sendResponse: (response: unknown) => void) => {
      handleMessage(message)
        .then(sendResponse)
        .catch((error) => {
          console.error('Background message handler error:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep the message channel open for async response
    }
  );
});

async function handleMessage(message: ExtensionMessage): Promise<unknown> {
  const settings = await getSettings();

  if (!settings.enabled) {
    return { error: 'Extension is disabled' };
  }

  switch (message.type) {
    case 'GET_BEST_CARD': {
      const payload = message.payload as GetBestCardPayload & { category?: string };
      return await handleGetBestCard(payload.merchantId, payload.category);
    }

    case 'SWITCH_CARD': {
      const payload = message.payload as SwitchCardPayload;
      return await handleSwitchCard(payload);
    }

    case 'GET_USER_CARDS': {
      return await handleGetUserCards();
    }

    default:
      return { error: 'Unknown message type' };
  }
}

async function handleGetBestCard(merchantId: string, category?: string): Promise<CardRecommendation | { error: string }> {
  try {
    const recommendation = await getBestCard(merchantId, category);
    return recommendation;
  } catch (error) {
    console.error('Error fetching best card:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get recommendation' };
  }
}

async function handleSwitchCard(payload: SwitchCardPayload): Promise<SwitchCardResponse | { error: string }> {
  try {
    const result = await switchCard({
      user_id: USER_ID,
      merchant_id: payload.merchantId,
      current_card_id: payload.currentCardId,
      switch_to_card_id: payload.switchToCardId,
    });
    return result;
  } catch (error) {
    console.error('Error switching card:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to switch card',
    };
  }
}

async function handleGetUserCards(): Promise<UserCardsResponse | { error: string }> {
  try {
    const cards = await getUserCards();
    return cards;
  } catch (error) {
    console.error('Error fetching user cards:', error);
    return { error: error instanceof Error ? error.message : 'Failed to get cards' };
  }
}
