import { useDispatch } from "react-redux";
import { sellCard } from "../features/game/gameSlice";
import { getCardValue, getRarityColor, getRarityBorder } from "../utils/rarity";
import { sfxSell } from "../utils/sfx";

export default function CardModal({ card, onClose }) {
  const dispatch = useDispatch();
  if (!card) return null;

  const value = getCardValue(card.rarity);
  const rarityColor = getRarityColor(card.rarity);
  const borderColor = getRarityBorder(card.rarity);

  const handleSell = () => {
    sfxSell();
    dispatch(sellCard({ instanceId: card.instanceId, value }));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className={`card-fade-in bg-gray-900 rounded-2xl border-2 ${borderColor} max-w-sm w-full overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <img
            src={card.images?.large || card.images?.small || card.image}
            alt={card.name}
            className="w-full rounded-lg"
          />
        </div>

        <div className="px-4 pb-4 space-y-3">
          <div>
            <h2 className="text-xl font-bold text-white">{card.name}</h2>
            <p className={`text-sm font-medium ${rarityColor}`}>{card.rarity}</p>
            {card.set && (
              <p className="text-xs text-gray-500 mt-1">Set: {card.set.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-yellow-400 font-semibold">🪙 {value} coins</span>
            {card.instanceId && (
              <button
                onClick={handleSell}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition cursor-pointer"
              >
                Sell Card
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
