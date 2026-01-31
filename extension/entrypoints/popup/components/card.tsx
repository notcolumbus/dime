interface CardProps {
  cardNumber?: string;
  cardHolderName?: string;
  expiryDate?: string;
  cardType?: "visa" | "mastercard" | "discover" | "american_express";
}

export function Card({
  cardNumber = "XXXX",
  cardHolderName = "Card Holder",
  expiryDate = "MM/YY",
  cardType = "visa",
}: CardProps) {
  const maskedNumber = `**** **** **** ${cardNumber.slice(-4)}`;

  return (
    <div className="w-[340px] h-[200px] bg-gradient-to-b from-white to-slate-50 rounded-2xl p-6 shadow-[0_8px_32px_rgba(138,43,226,0.2)] flex flex-col justify-between font-sans">
      {/* Top row: Chip and Card Type */}
      <div className="flex justify-between items-start">
        {/* Chip */}
        <div className="w-[45px] h-[35px] bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
          <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
            <rect x="1" y="1" width="22" height="18" rx="2" stroke="#b8860b" strokeWidth="1.5" fill="none" />
            <line x1="8" y1="1" x2="8" y2="19" stroke="#b8860b" strokeWidth="1" />
            <line x1="16" y1="1" x2="16" y2="19" stroke="#b8860b" strokeWidth="1" />
            <line x1="1" y1="7" x2="23" y2="7" stroke="#b8860b" strokeWidth="1" />
            <line x1="1" y1="13" x2="23" y2="13" stroke="#b8860b" strokeWidth="1" />
          </svg>
        </div>

        {/* Card Type Logo */}
        {cardType === "visa" && (
          <span className="text-2xl font-bold italic text-[#1a1f71]">VISA</span>
        )}
        {cardType === "mastercard" && (
          <div className="flex items-center">
            <div className="w-[30px] h-[30px] bg-[#eb001b] rounded-full" />
            <div className="w-[30px] h-[30px] bg-[#f79e1b] rounded-full -ml-3 opacity-90" />
          </div>
        )}
        {cardType === "discover" && (
          <span className="text-xl font-bold text-[#ff6000]">DISCOVER</span>
        )}
        {cardType === "american_express" && (
          <span className="text-lg font-bold text-[#006fcf]">AMEX</span>
        )}
      </div>

      {/* Card Number */}
      <div className="text-lg tracking-[3px] text-gray-600 font-mono">
        {maskedNumber}
      </div>

      {/* Bottom row: Name and Expiry */}
      <div className="flex justify-between">
        <div>
          <div className="text-[10px] text-gray-400 mb-1">Card Holder Name</div>
          <div className="text-sm text-gray-800 font-medium">{cardHolderName}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-gray-400 mb-1">Expiry Date</div>
          <div className="text-sm text-gray-800 font-medium">{expiryDate}</div>
        </div>
      </div>
    </div>
  );
}
