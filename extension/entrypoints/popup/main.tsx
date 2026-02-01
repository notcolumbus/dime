import "./style.css";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { Header } from "./components/header";
import { Primary } from "./components/primary";
import { Alternative } from "./components/alternative";

const API_BASE_URL = 'http://localhost:5001';
const USER_ID = 'aman';

interface BackendCard {
  card_id: string;
  card_type: string;
  last_four: string;
  benefits?: string;
  cardholder?: string;
  expiry_date?: string;
}

interface CardDisplayData {
  card: {
    cardNumber: string;
    cardHolderName: string;
    expiryDate: string;
    cardType: "visa" | "mastercard" | "discover" | "american_express";
  };
  cashbackPercentage: number;
  subtext: string;
  cardId: string;
}

function mapCardType(type: string): "visa" | "mastercard" | "discover" | "american_express" {
  const normalized = type?.toLowerCase() || '';
  if (normalized.includes('visa')) return 'visa';
  if (normalized.includes('mastercard') || normalized.includes('master')) return 'mastercard';
  if (normalized.includes('discover')) return 'discover';
  if (normalized.includes('amex') || normalized.includes('american')) return 'american_express';
  return 'visa'; // default
}

function getCashbackRate(benefits: string | undefined): number {
  if (!benefits) return 1.0;
  // Extract percentage from benefits string like "4% dining rewards"
  const match = benefits.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return parseFloat(match[1]);
  return 1.5; // default cashback
}

function transformCard(backendCard: BackendCard): CardDisplayData {
  return {
    card: {
      cardNumber: `************${backendCard.last_four || '0000'}`,
      cardHolderName: backendCard.cardholder || USER_ID,
      expiryDate: backendCard.expiry_date || '12/28',
      cardType: mapCardType(backendCard.card_type),
    },
    cashbackPercentage: getCashbackRate(backendCard.benefits),
    subtext: backendCard.benefits || 'General rewards card',
    cardId: backendCard.card_id,
  };
}

function App() {
  const [cards, setCards] = useState<CardDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/cards?user_id=${USER_ID}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch cards: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const transformedCards = (data.cards || []).map(transformCard);

      // Sort by cashback rate ascending so current (lower benefit) card is first
      // and ideal (better benefit) cards are shown as alternatives
      transformedCards.sort((a: CardDisplayData, b: CardDisplayData) =>
        a.cashbackPercentage - b.cashbackPercentage
      );

      setCards(transformedCards);
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }

  function handleApply(cardId: string) {
    console.log(`Applied card ${cardId}`);
    // In a real implementation, this would switch the payment method
    // using the Knot API or similar service
  }

  // Primary card is the current (lower benefit) card
  // Alternative cards are better options (with ideal badge on the best one)
  const primaryCard = cards[0];
  // Reverse so the best card (highest cashback) is first and gets the "ideal" badge
  const alternativeCards = cards.slice(1).reverse();

  if (loading) {
    return (
      <div className="w-[608px] min-h-[400px] bg-[#121212] flex items-center justify-center">
        <div className="text-white text-xl">Loading your cards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[608px] min-h-[400px] bg-[#121212] p-8">
        <Header />
        <div className="pt-28 text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <div className="text-gray-400 text-sm mb-4">
            Make sure the backend is running on port 5001
          </div>
          <button
            onClick={fetchCards}
            className="bg-[#3703B3] hover:bg-[#2a0289] text-white px-6 py-2 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="w-[608px] min-h-[400px] bg-[#121212] p-8">
        <Header />
        <div className="pt-28 text-center">
          <div className="text-white text-lg mb-4">No cards found</div>
          <div className="text-gray-400 text-sm">
            Add cards to your account to see recommendations
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[608px] min-h-fit bg-[#121212] pb-8">
      <Header
        cashbackRate={`${primaryCard.cashbackPercentage}%`}
        cardLastFour={primaryCard.card.cardNumber.slice(-4)}
      />
      <div className="pt-28 pl-10 pr-10">
        <Primary
          card={primaryCard.card}
          cashbackPercentage={primaryCard.cashbackPercentage}
          subtext={primaryCard.subtext}
          onApply={() => handleApply(primaryCard.cardId)}
        />
        {alternativeCards.length > 0 && (
          <Alternative
            cards={alternativeCards}
            onApply={(index) => handleApply(alternativeCards[index].cardId)}
          />
        )}
      </div>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
