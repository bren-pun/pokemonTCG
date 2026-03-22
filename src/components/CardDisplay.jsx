import { getRarityColor, getRarityBorder, getCardValue } from "../utils/rarity";

export default function CardDisplay({ card, onClick, showValue = false }) {
  const rarityColor = getRarityColor(card.rarity);
  const borderColor = getRarityBorder(card.rarity);

  return (
    <button
      onClick={() => onClick?.(card)}
      className={`group relative bg-gray-900 rounded-xl border-2 ${borderColor} overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer`}
    >
      <div className="aspect-[2.5/3.5] overflow-hidden">
        <img
          src={card.images?.small || card.image}
          alt={card.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-2 text-left">
        <p className="text-sm font-medium text-white truncate">{card.name}</p>
        <p className={`text-xs ${rarityColor}`}>{card.rarity}</p>
        {showValue && (
          <p className="text-xs text-yellow-400 mt-0.5">
            🪙 {getCardValue(card.rarity)}
          </p>
        )}
      </div>
    </button>
  );
}
