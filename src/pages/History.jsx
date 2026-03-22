import { useSelector } from "react-redux";
import { getRarityColor, getCardValue } from "../utils/rarity";

export default function History() {
  const history = useSelector((s) => s.game.history);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-white mb-2">Pull History</h1>
      <p className="text-sm text-gray-400 mb-6">Your last {history.length} opened cards</p>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📜</div>
          <p className="text-gray-400">No history yet. Open some packs!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((card, i) => (
            <div
              key={`${card.id}-${card.obtainedAt}-${i}`}
              className="card-fade-in flex items-center gap-4 bg-gray-900 rounded-xl border border-gray-800 p-3 hover:border-gray-700 transition"
            >
              <img
                src={card.images?.small || card.image}
                alt={card.name}
                className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{card.name}</p>
                <p className={`text-sm ${getRarityColor(card.rarity)}`}>{card.rarity}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-yellow-400 font-semibold text-sm">
                  🪙 {getCardValue(card.rarity)}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(card.obtainedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
