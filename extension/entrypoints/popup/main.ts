import { getSettings, saveSettings } from '../../utils/storage';
import { detectMerchantSite } from '../../utils/merchants';
import { USER_CARDS, getRecommendationForMerchant, CATEGORY_LABELS, type MerchantCategory } from '../../utils/mockData';
import type { Card } from '../../types';

document.addEventListener('DOMContentLoaded', async () => {
  await initializePopup();
});

async function initializePopup() {
  const settings = await getSettings();

  // Update UI based on settings
  updateToggle('toggle-enabled', settings.enabled);
  updateToggle('toggle-notifications', settings.notificationsEnabled);

  // Set up event listeners
  setupToggleListeners();

  // Load user cards (from mock data)
  displayUserCards();

  // Check current tab for merchant
  await checkCurrentTab();
}

function updateToggle(id: string, active: boolean) {
  const toggle = document.getElementById(id);
  if (toggle) {
    toggle.classList.toggle('active', active);
  }
}

function setupToggleListeners() {
  const enabledToggle = document.getElementById('toggle-enabled');
  const notificationsToggle = document.getElementById('toggle-notifications');

  enabledToggle?.addEventListener('click', async () => {
    const isActive = enabledToggle.classList.contains('active');
    enabledToggle.classList.toggle('active', !isActive);
    await saveSettings({ enabled: !isActive });
  });

  notificationsToggle?.addEventListener('click', async () => {
    const isActive = notificationsToggle.classList.contains('active');
    notificationsToggle.classList.toggle('active', !isActive);
    await saveSettings({ notificationsEnabled: !isActive });
  });
}

function displayUserCards() {
  const cardsList = document.getElementById('cards-list');
  if (!cardsList) return;

  if (USER_CARDS.length === 0) {
    cardsList.innerHTML = `<div class="no-cards">No cards linked yet</div>`;
    return;
  }

  cardsList.innerHTML = USER_CARDS.map((card: Card) => `
    <div class="card-item">
      <div class="card-name">${card.name}</div>
      <div class="card-details">
        ****${card.last_four} &bull; ${card.reward_rate}% default rewards
      </div>
    </div>
  `).join('');
}

async function checkCurrentTab() {
  const statusEl = document.getElementById('status');
  const recommendationSection = document.getElementById('recommendation-section');

  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url) {
      if (statusEl) {
        statusEl.textContent = 'Unable to detect site';
        statusEl.className = 'status disconnected';
      }
      return;
    }

    const merchant = detectMerchantSite(tab.url);

    if (merchant) {
      // We're on a supported site
      if (statusEl) {
        statusEl.textContent = `On ${merchant.name}`;
        statusEl.className = 'status connected';
      }

      // Show recommendation for this merchant
      const recommendation = getRecommendationForMerchant(merchant.id);

      if (recommendation && recommendationSection) {
        const categoryLabel = CATEGORY_LABELS[merchant.category as MerchantCategory] || merchant.category;

        recommendationSection.innerHTML = `
          <div class="section-title">Best Card for ${merchant.name}</div>
          <div class="recommendation-card">
            <div class="rec-category">${categoryLabel}</div>
            <div class="rec-best-card">${recommendation.best_card.name}</div>
            <div class="rec-rate">${recommendation.best_card.reward_rate}% back</div>
            <div class="rec-explanation">${recommendation.explanation}</div>
            ${recommendation.current_card ? `
              <div class="rec-current">
                Currently using: ${recommendation.current_card.name} (${recommendation.current_card.reward_rate}%)
              </div>
            ` : ''}
          </div>
        `;
        recommendationSection.style.display = 'block';

        // Add button to trigger overlay on page
        const showOnPageBtn = document.createElement('button');
        showOnPageBtn.className = 'show-on-page-btn';
        showOnPageBtn.textContent = 'Show on Page';
        showOnPageBtn.addEventListener('click', async () => {
          if (tab.id) {
            await browser.tabs.sendMessage(tab.id, { type: 'SHOW_RECOMMENDATION', merchantId: merchant.id });
            window.close();
          }
        });
        recommendationSection.appendChild(showOnPageBtn);
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'Not a supported site';
        statusEl.className = 'status';
      }
    }
  } catch (error) {
    console.error('Error checking current tab:', error);
    if (statusEl) {
      statusEl.textContent = 'Error detecting site';
      statusEl.className = 'status disconnected';
    }
  }
}
