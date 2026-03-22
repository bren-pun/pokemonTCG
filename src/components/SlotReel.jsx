import { useEffect, useRef, useState } from "react";
import { getRarityColor, getRarityBorder, getCardValue } from "../utils/rarity";
import { sfxTick, sfxReveal } from "../utils/sfx";

const CARD_WIDTH = 140;
const CARD_GAP = 12;
const SLOT_SIZE = CARD_WIDTH + CARD_GAP;
const REEL_COUNT = 40;
const WINNER_INDEX = 32;
const SPIN_DURATION = 4000;

export default function SlotReel({ winningCard, allCards, onFinished }) {
  const stripRef = useRef(null);
  const [settled, setSettled] = useState(false);

  // Build the reel: random filler cards with the winner placed at WINNER_INDEX
  const reelCards = useRef([]);
  if (reelCards.current.length === 0) {
    const pool = allCards.filter((c) => c.id !== winningCard.id);
    const cards = [];
    for (let i = 0; i < REEL_COUNT; i++) {
      if (i === WINNER_INDEX) {
        cards.push(winningCard);
      } else {
        cards.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }
    reelCards.current = cards;
  }

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    // Calculate offset to center the winning card in the viewport
    const container = strip.parentElement;
    const containerCenter = container.offsetWidth / 2;
    const targetOffset = WINNER_INDEX * SLOT_SIZE + SLOT_SIZE / 2 - containerCenter;

    // Add slight random offset so it doesn't always land perfectly centered
    const jitter = (Math.random() - 0.5) * (CARD_WIDTH * 0.3);

    strip.style.transition = "none";
    strip.style.transform = "translateX(0px)";

    // Force reflow
    strip.offsetHeight;

    strip.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.25, 1)`;
    strip.style.transform = `translateX(-${targetOffset + jitter}px)`;

    // Tick sounds as cards scroll by — fast at start, slowing down
    const ticks = [];
    const tickCount = 30;
    for (let i = 0; i < tickCount; i++) {
      const progress = i / tickCount;
      // Exponential slowdown: ticks get further apart toward the end
      const delay = (progress ** 1.8) * SPIN_DURATION;
      ticks.push(setTimeout(() => sfxTick(), delay));
    }

    const timer = setTimeout(() => {
      sfxReveal(winningCard.rarity);
      setSettled(true);
    }, SPIN_DURATION + 200);

    return () => {
      clearTimeout(timer);
      ticks.forEach(clearTimeout);
    };
  }, []);

  const rarityColor = getRarityColor(winningCard.rarity);
  const borderColor = getRarityBorder(winningCard.rarity);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Slot machine viewport */}
      <div className="relative w-full max-w-2xl mx-auto">
        {/* Center marker */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[148px] border-2 border-yellow-400 rounded-xl z-10 pointer-events-none shadow-[0_0_20px_rgba(234,179,8,0.3)]" />
        
        {/* Gradient fade edges */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

        {/* Scrolling strip */}
        <div className="overflow-hidden rounded-xl py-3">
          <div
            ref={stripRef}
            className="flex gap-3 will-change-transform"
            style={{ width: "max-content" }}
          >
            {reelCards.current.map((card, i) => {
              const isWinner = i === WINNER_INDEX;
              return (
                <div
                  key={`${card.id}-${i}`}
                  className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    isWinner && settled
                      ? `${getRarityBorder(card.rarity)} shadow-lg shadow-yellow-400/20`
                      : "border-gray-700"
                  }`}
                  style={{ width: CARD_WIDTH }}
                >
                  <img
                    src={card.images?.small || card.image}
                    alt={card.name}
                    className="w-full aspect-[2.5/3.5] object-cover"
                    loading="eager"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result info (appears after settled) */}
      {settled && (
        <div className="card-fade-in text-center space-y-2">
          <h3 className="text-2xl font-bold text-white">{winningCard.name}</h3>
          <p className={`text-sm font-semibold ${rarityColor}`}>{winningCard.rarity}</p>
          <p className="text-yellow-400 text-sm">
            🪙 Worth {getCardValue(winningCard.rarity)} coins
          </p>
          <button
            onClick={onFinished}
            className="mt-3 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition pack-bounce cursor-pointer"
          >
            Collect & Open Another
          </button>
        </div>
      )}
    </div>
  );
}
