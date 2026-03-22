import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deductCoins, addCard } from "../features/game/gameSlice";
import { usePool } from "../components/CardPoolProvider";
import { rollRarity, rollBulkRarities, PACK_COST, BULK_PACK_COST } from "../utils/rarity";
import SlotReel from "../components/SlotReel";
import BulkReveal from "../components/BulkReveal";
import LoadingSpinner from "../components/LoadingSpinner";
import { sfxSpinStart, sfxError, sfxReveal } from "../utils/sfx";

export default function Home() {
  const dispatch = useDispatch();
  const coins = useSelector((s) => s.game.coins);
  const inventoryCount = useSelector((s) => s.game.inventory.length);
  const { pool, ready, error: poolError, retry } = usePool();

  const [phase, setPhase] = useState("idle"); // idle | spinning | bulk | error
  const [winningCard, setWinningCard] = useState(null);
  const [reelPool, setReelPool] = useState([]);
  const [bulkCards, setBulkCards] = useState([]);
  const [error, setError] = useState(null);

  const canAfford = coins >= PACK_COST && ready;
  const canAffordBulk = coins >= BULK_PACK_COST && ready;

  const openPack = useCallback(() => {
    if (!canAfford || phase === "spinning") return;

    setPhase("spinning");
    setError(null);
    sfxSpinStart();
    dispatch(deductCoins(PACK_COST));

    const rarity = rollRarity();
    const cards = pool[rarity];

    if (!cards || cards.length === 0) {
      setError("No cards available for this rarity. Reload.");
      sfxError();
      setPhase("error");
      return;
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    const cardData = {
      id: randomCard.id,
      name: randomCard.name,
      rarity: randomCard.rarity || rarity,
      images: randomCard.images,
      set: randomCard.set ? { name: randomCard.set.name } : null,
    };

    dispatch(addCard(cardData));
    setWinningCard(cardData);
    setReelPool(cards.map((c) => ({
      id: c.id,
      name: c.name,
      rarity: c.rarity,
      images: c.images,
    })));
  }, [canAfford, phase, dispatch, pool]);

  const openBulk = useCallback(() => {
    if (!canAffordBulk || phase === "spinning" || phase === "bulk") return;

    setPhase("spinning");
    setError(null);
    sfxSpinStart();
    dispatch(deductCoins(BULK_PACK_COST));

    const rarities = rollBulkRarities();

    const pickedCards = rarities.map((rarity) => {
      const cards = pool[rarity];
      if (!cards || cards.length === 0) return null;
      const c = cards[Math.floor(Math.random() * cards.length)];
      return {
        id: c.id,
        name: c.name,
        rarity: c.rarity || rarity,
        images: c.images,
        set: c.set ? { name: c.set.name } : null,
      };
    }).filter(Boolean);

    if (pickedCards.length === 0) {
      setError("No cards available. Reload the page.");
      sfxError();
      setPhase("error");
      return;
    }

    pickedCards.forEach((card) => dispatch(addCard(card)));
    sfxReveal("Rare Holo EX");
    setBulkCards(pickedCards);
    setPhase("bulk");
  }, [canAffordBulk, phase, dispatch, pool]);

  const handleDone = () => {
    setWinningCard(null);
    setReelPool([]);
    setBulkCards([]);
    setPhase("idle");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-3">
          Open Packs
        </h1>
        <p className="text-gray-400">
          Spend coins to open booster packs and collect rare Pokemon cards!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
        <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
          <p className="text-3xl font-bold text-yellow-400">{coins.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Available Coins</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
          <p className="text-3xl font-bold text-purple-400">{inventoryCount}</p>
          <p className="text-xs text-gray-500 mt-1">Cards Collected</p>
        </div>
      </div>

      {/* Pack Opening Area */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 md:p-6">
        {!ready && phase === "idle" && (
          poolError ? (
            <div className="text-center py-10 space-y-4">
              <p className="text-red-400 text-lg font-semibold">Failed to load cards</p>
              <p className="text-gray-500 text-sm">{poolError}</p>
              <button onClick={retry} className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition cursor-pointer">Retry</button>
            </div>
          ) : (
            <LoadingSpinner text="Loading card database..." />
          )
        )}

        {ready && phase === "idle" && (
          <div className="text-center py-6">
            <div className="text-6xl mb-4">🎴</div>
            <h2 className="text-xl font-bold text-white mb-2">Booster Pack</h2>
            <div className="text-xs text-gray-600 mb-6 space-y-0.5">
              <p>60% Common - 25% Uncommon - 12% Rare - 3% Ultra Rare</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openPack}
                disabled={!canAfford}
                className={"px-8 py-4 rounded-xl text-lg font-bold transition cursor-pointer " + (
                  canAfford
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 shadow-lg shadow-yellow-500/25"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                {canAfford ? "Open 1 Pack (" + PACK_COST + ")" : "Not enough coins"}
              </button>
              <button
                onClick={openBulk}
                disabled={!canAffordBulk}
                className={"px-8 py-4 rounded-xl text-lg font-bold transition cursor-pointer " + (
                  canAffordBulk
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                {canAffordBulk ? "Open 10 Packs (" + BULK_PACK_COST + ")" : "Need " + BULK_PACK_COST}
              </button>
            </div>
            <p className="text-[10px] text-purple-400 mt-2">10-pack guarantees 1 Ultra Rare!</p>
          </div>
        )}

        {phase === "spinning" && winningCard && (
          <SlotReel
            key={winningCard.id + Date.now()}
            winningCard={winningCard}
            allCards={reelPool}
            onFinished={handleDone}
          />
        )}

        {phase === "bulk" && (
          <BulkReveal cards={bulkCards} onDone={handleDone} />
        )}

        {phase === "error" && (
          <div className="py-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleDone}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Rarity Guide */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { name: "Common", color: "text-gray-400", value: 50 },
          { name: "Uncommon", color: "text-green-400", value: 100 },
          { name: "Rare", color: "text-blue-400", value: 250 },
          { name: "Ultra Rare", color: "text-purple-400", value: 600 },
        ].map((tier) => (
          <div key={tier.name} className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800/50">
            <p className={"text-sm font-semibold " + tier.color}>{tier.name}</p>
            <p className="text-xs text-gray-500">{tier.value} coins</p>
          </div>
        ))}
      </div>
    </div>
  );
}
