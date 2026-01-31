import { Card } from "./card";

interface CardData {
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cardType?: "visa" | "mastercard" | "discover" | "american_express";
}

interface PrimaryProps {
  card: CardData;
  cashbackPercentage: number;
  subtext: string;
  onApply?: () => void;
}

export function Primary({
  card,
  cashbackPercentage,
  subtext,
  onApply,
}: PrimaryProps) {
  return (
      <div className="w-full rounded-2xl py-4 pl-0 pr-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <span className="text-white text-2xl ">primary payment method</span>
      </div>

      {/* Content */}
      <div className="flex items-stretch justify-between gap-8">
        {/* Left side - Card */}
        <div className="w-[340px] shrink-0">
          <Card
            cardNumber={card.cardNumber}
            cardHolderName={card.cardHolderName}
            expiryDate={card.expiryDate}
            cardType={card.cardType}
            className="shadow-none"
          />
        </div>

        {/* Right side - Cashback info */}
        <div className="flex flex-col justify-end flex-1">
          <div className="text-white text-3xl font-bold">{cashbackPercentage}%</div>
          <div className="text-white text-xl">cashback</div>
          <div className="text-gray-400 text-sm mt-2">{subtext}</div>
          <button
            onClick={onApply}
            className="bg-[#3703B3] hover:bg-[#2a0289] text-white font-medium w-full h-8 rounded-full text-xl transition-colors grid place-items-center pb-0.5 mt-4"
          >
            apply
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#454545] mt-6" />
    </div>
  );
}
