import { getRarityColor, getRarityBorder, getCardValue } from "../utils/rarity";

export default function PackReveal({ card, onDone }) {
  if (!card) return null;

  const rarityColor = getRarityColor(card.rarity);
  const borderColor = getRarityBorder(card.rarity);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className={`card-flip bg-gray-900 rounded-2xl border-2 ${borderColor} overflow-hidden shadow-2xl max-w-xs w-full`}>
        <div className="p-3">
          <img
            src={card.images?.large || card.images?.small || card.image}
            alt={card.name}
            className="w-full rounded-lg"
          />
        </div>
        <div className="px-4 pb-4 text-center">
          <h3 className="text-lg font-bold text-white">{card.name}</h3>
          <p className={`text-sm font-semibold ${rarityColor}`}>{card.rarity}</p>
          <p className="text-yellow-400 text-sm mt-1">
            🪙 Worth {getCardValue(card.rarity)} coins
          </p>
        </div>
      </div>

      <button
        onClick={onDone}
        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition pack-bounce cursor-pointer"
      >
        Collect & Continue
      </button>
    </div>
  );
}
