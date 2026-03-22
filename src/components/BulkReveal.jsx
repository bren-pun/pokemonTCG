import { useState } from "react";
import { getRarityColor, getRarityBorder, getCardValue } from "../utils/rarity";
import CardModal from "./CardModal";

export default function BulkReveal({ cards, onDone }) {
  const [selectedCard, setSelectedCard] = useState(null);

  if (!cards || cards.length === 0) return null;

  const totalValue = cards.reduce((sum, c) => sum + getCardValue(c.rarity), 0);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white">You opened 10 cards!</h3>
        <p className="text-sm text-gray-400 mt-1">
          Total value: <span className="text-yellow-400 font-semibold">{totalValue} coins</span>
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 w-full">
        {cards.map((card, i) => {
          const rarityColor = getRarityColor(card.rarity);
          const borderColor = getRarityBorder(card.rarity);
          return (
            <button
              key={card.instanceId || `${card.id}-${i}`}
              onClick={() => setSelectedCard(card)}
              className={`card-fade-in bg-gray-900 rounded-xl border-2 ${borderColor} overflow-hidden transition-all hover:scale-[1.03] cursor-pointer`}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <img
                src={card.images?.small || card.image}
                alt={card.name}
                className="w-full aspect-[2.5/3.5] object-cover"
                loading="eager"
              />
              <div className="p-1.5 text-center">
                <p className="text-xs font-medium text-white truncate">{card.name}</p>
                <p className={`text-[10px] ${rarityColor}`}>{card.rarity}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={onDone}
        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition pack-bounce cursor-pointer"
      >
        Collect All & Continue
      </button>

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
