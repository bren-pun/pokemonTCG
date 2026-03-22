import { useState } from "react";
import { useSelector } from "react-redux";
import CardDisplay from "../components/CardDisplay";
import CardModal from "../components/CardModal";

export default function Inventory() {
  const inventory = useSelector((s) => s.game.inventory);
  const [selectedCard, setSelectedCard] = useState(null);
  const [filter, setFilter] = useState("All");

  const rarities = ["All", "Common", "Uncommon", "Rare", "Rare Holo EX"];

  const filtered =
    filter === "All"
      ? inventory
      : inventory.filter((c) => c.rarity === filter);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">My Collection</h1>
          <p className="text-sm text-gray-400">{inventory.length} cards collected</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {rarities.map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === r
                  ? "bg-yellow-500 text-gray-900"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-gray-400">
            {inventory.length === 0
              ? "No cards yet. Open some packs!"
              : "No cards match this filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((card) => (
            <div key={card.instanceId} className="card-fade-in">
              <CardDisplay
                card={card}
                onClick={setSelectedCard}
                showValue
              />
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
