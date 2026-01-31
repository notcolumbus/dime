import { detectMerchant, detectMerchantSite, type MerchantConfig } from '../utils/merchants';
import { getRecommendationForMerchant } from '../utils/mockData';
import type { CardRecommendation, ExtensionMessage } from '../types';

// Demo mode - set to false when backend is ready
const DEMO_MODE = false;

export default defineContentScript({
  matches: [
    '*://*.amazon.com/*',
    '*://*.walmart.com/*',
    '*://*.target.com/*',
    '*://*.bestbuy.com/*',
    '*://*.macys.com/*',
    '*://*.chewy.com/*',
    '*://*.netflix.com/*',
    '*://*.hulu.com/*',
    '*://*.disneyplus.com/*',
    '*://*.max.com/*',
    '*://*.peacocktv.com/*',
    '*://tv.youtube.com/*',
    '*://*.primevideo.com/*',
    '*://*.crunchyroll.com/*',
    '*://*.spotify.com/*',
    '*://*.music.amazon.com/*',
    '*://*.siriusxm.com/*',
    '*://*.starz.com/*',
    '*://*.audible.com/*',
    '*://*.doordash.com/*',
    '*://*.ubereats.com/*',
    '*://*.grubhub.com/*',
    '*://*.postmates.com/*',
    '*://*.trycaviar.com/*',
    '*://*.instacart.com/*',
    '*://*.uber.com/*',
    '*://*.lyft.com/*',
    '*://*.bk.com/*',
  ],
  main() {
    console.log('Card Optimizer content script loaded');

    let overlayInjected = false;
    let currentMerchant: MerchantConfig | null = null;

    // Check initial URL
    checkForCheckout(window.location.href);

    // Throttle function to prevent excessive calls
    let lastUrl = window.location.href;
    let throttleTimeout: ReturnType<typeof setTimeout> | null = null;

    function throttledCheckForCheckout() {
      // Only check if URL actually changed
      const currentUrl = window.location.href;
      if (currentUrl === lastUrl) return;

      lastUrl = currentUrl;

      // Throttle to max once per 500ms
      if (throttleTimeout) return;

      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
        checkForCheckout(currentUrl);
      }, 500);
    }

    // Watch for URL changes (SPA navigation)
    const observer = new MutationObserver(() => {
      throttledCheckForCheckout();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also listen for popstate events
    window.addEventListener('popstate', () => {
      checkForCheckout(window.location.href);
    });

    function checkForCheckout(url: string) {
      // First check if it's a checkout page
      const checkoutMerchant = detectMerchant(url);

      if (checkoutMerchant && !overlayInjected) {
        currentMerchant = checkoutMerchant;
        fetchAndShowRecommendation(checkoutMerchant, true);
      } else if (!checkoutMerchant && overlayInjected) {
        removeOverlay();
      }
    }

    async function fetchAndShowRecommendation(merchant: MerchantConfig, isCheckout: boolean) {
      // Use demo data if in demo mode
      if (DEMO_MODE) {
        console.log('Card Optimizer: Demo mode - showing recommendation for', merchant.name);
        const recommendation = getRecommendationForMerchant(merchant.id);
        if (recommendation && recommendation.potential_savings > 0) {
          injectOverlay(recommendation, merchant, isCheckout);
        }
        return;
      }

      try {
        const message: ExtensionMessage = {
          type: 'GET_BEST_CARD',
          payload: { merchantId: merchant.id, category: merchant.category },
        };

        const response = await browser.runtime.sendMessage(message);

        if ('error' in response) {
          console.error('Error getting recommendation:', response.error);
          return;
        }

        const recommendation = response as CardRecommendation;

        // Only show overlay if there's a better card available
        if (recommendation.best_card && recommendation.potential_savings > 0) {
          injectOverlay(recommendation, merchant, isCheckout);
        }
      } catch (error) {
        console.error('Failed to fetch recommendation:', error);
      }
    }

    function injectOverlay(recommendation: CardRecommendation, merchant: MerchantConfig, isCheckout: boolean) {
      if (overlayInjected) return;

      const overlay = createOverlayElement(recommendation, merchant, isCheckout);
      document.body.appendChild(overlay);
      overlayInjected = true;

      // Animate in
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.style.transform = 'translateY(0)';
      });
    }

    function createOverlayElement(
      recommendation: CardRecommendation,
      merchant: MerchantConfig,
      isCheckout: boolean
    ): HTMLElement {
      const overlay = document.createElement('div');
      overlay.id = 'card-optimizer-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0;
        transform: translateY(-10px);
        transition: opacity 0.3s ease, transform 0.3s ease;
      `;

      const currentCardText = recommendation.current_card
        ? `${recommendation.current_card.name} (${recommendation.current_card.reward_rate}%)`
        : 'No card on file';

      const headerText = isCheckout
        ? 'A better card is available!'
        : `Tip for ${merchant.name}`;

      const actionButtonHtml = isCheckout
        ? `<button id="card-optimizer-switch" style="
            width: 100%;
            padding: 12px;
            background: #1976d2;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
          ">
            Switch Now
          </button>`
        : `<div style="font-size: 12px; color: #666; text-align: center; padding: 8px;">
            Use <strong>${recommendation.best_card.name}</strong> at checkout for best rewards
          </div>`;

      overlay.innerHTML = `
        <div style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 14px; font-weight: 600; color: #1a1a1a;">
              ${headerText}
            </span>
            <button id="card-optimizer-close" style="
              background: none;
              border: none;
              font-size: 20px;
              cursor: pointer;
              color: #666;
              padding: 0;
              line-height: 1;
            ">&times;</button>
          </div>

          <div style="background: #f5f5f5; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Current card on file</div>
            <div style="font-size: 14px; color: #333;">${currentCardText}</div>
          </div>

          <div style="background: #e8f5e9; border-radius: 8px; padding: 12px; margin-bottom: 16px;">
            <div style="font-size: 12px; color: #2e7d32; margin-bottom: 4px;">Better option</div>
            <div style="font-size: 16px; font-weight: 600; color: #1b5e20;">
              ${recommendation.best_card.name}
            </div>
            <div style="font-size: 14px; color: #388e3c; margin-top: 4px;">
              ${recommendation.explanation}
            </div>
          </div>

          ${actionButtonHtml}

          <div style="font-size: 11px; color: #999; text-align: center; margin-top: 8px;">
            Shopping at ${merchant.name}
          </div>
        </div>
      `;

      // Event listeners
      const closeBtn = overlay.querySelector('#card-optimizer-close');
      closeBtn?.addEventListener('click', () => removeOverlay());

      if (isCheckout) {
        const switchBtn = overlay.querySelector('#card-optimizer-switch');
        switchBtn?.addEventListener('click', () => handleSwitchCard(recommendation, merchant));

        // Hover effect for switch button
        switchBtn?.addEventListener('mouseenter', () => {
          (switchBtn as HTMLElement).style.background = '#1565c0';
        });
        switchBtn?.addEventListener('mouseleave', () => {
          (switchBtn as HTMLElement).style.background = '#1976d2';
        });
      }

      return overlay;
    }

    async function handleSwitchCard(recommendation: CardRecommendation, merchant: MerchantConfig) {
      const switchBtn = document.querySelector('#card-optimizer-switch') as HTMLButtonElement;
      if (switchBtn) {
        switchBtn.textContent = 'Switching...';
        switchBtn.disabled = true;
      }

      try {
        const message: ExtensionMessage = {
          type: 'SWITCH_CARD',
          payload: {
            merchantId: merchant.id,
            currentCardId: recommendation.current_card?.id || '',
            switchToCardId: recommendation.best_card.id,
          },
        };

        const response = await browser.runtime.sendMessage(message);

        if ('error' in response || !response.success) {
          throw new Error(response.error || response.message || 'Switch failed');
        }

        // Success state
        if (switchBtn) {
          switchBtn.textContent = 'Switched!';
          switchBtn.style.background = '#2e7d32';
        }

        // Remove overlay after delay
        setTimeout(() => removeOverlay(), 2000);
      } catch (error) {
        console.error('Failed to switch card:', error);
        if (switchBtn) {
          switchBtn.textContent = 'Failed - Try Again';
          switchBtn.disabled = false;
          switchBtn.style.background = '#d32f2f';
        }
      }
    }

    function removeOverlay() {
      const overlay = document.getElementById('card-optimizer-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          overlay.remove();
          overlayInjected = false;
        }, 300);
      }
    }

    // Listen for messages from popup to show recommendation on any supported page
    browser.runtime.onMessage.addListener((message: { type: string; merchantId?: string }) => {
      if (message.type === 'SHOW_RECOMMENDATION') {
        const merchant = detectMerchantSite(window.location.href);
        if (merchant && !overlayInjected) {
          fetchAndShowRecommendation(merchant, false);
        }
      }
    });
  },
});
