import { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deductCoins, addCoins } from "../features/game/gameSlice";
import { usePool } from "../components/CardPoolProvider";
import { sfxCardFlip, sfxBattleWin, sfxBattleLose } from "../utils/sfx";

const CHIPS = [50, 100, 250, 500, 1000];
const MULTIPLIERS = [1, 2, 3];

const SIDES = {
  pikachu: { name: "Pikachu", emoji: "⚡", color: "yellow", bg: "from-yellow-600 to-yellow-400", border: "border-yellow-500", text: "text-yellow-400" },
  bulbasaur: { name: "Bulbasaur", emoji: "🌿", color: "green", bg: "from-green-600 to-green-400", border: "border-green-500", text: "text-green-400" },
};

function getMaxAttack(card) {
  if (!card.attacks) return 0;
  let max = 0;
  for (const atk of card.attacks) {
    const dmg = parseInt(atk.damage, 10);
    if (!isNaN(dmg) && dmg > max) max = dmg;
  }
  return max;
}

export default function Battle() {
  const dispatch = useDispatch();
  const coins = useSelector((s) => s.game.coins);
  const { pool, ready, error: poolError, retry } = usePool();
  const battlePool = pool._battle || [];
  const poolReady = ready && battlePool.length >= 2;

  const [bet, setBet] = useState(100);
  const [multiplier, setMultiplier] = useState(1);
  const [side, setSide] = useState(null); // "pikachu" | "bulbasaur"
  const [phase, setPhase] = useState("pick"); // pick | reveal | result
  const [cardA, setCardA] = useState(null); // pikachu's card
  const [cardB, setCardB] = useState(null); // bulbasaur's card
  const [result, setResult] = useState(null); // "win" | "lose" | "tie"

  const totalBet = bet * multiplier;
  const canBet = side && coins >= totalBet && poolReady;

  const pickTwoCards = useCallback(() => {
    const i = Math.floor(Math.random() * battlePool.length);
    let j = Math.floor(Math.random() * battlePool.length);
    while (j === i && battlePool.length > 1) j = Math.floor(Math.random() * battlePool.length);
    return [battlePool[i], battlePool[j]];
  }, [battlePool]);

  const startBattle = useCallback(() => {
    if (!canBet) return;
    dispatch(deductCoins(totalBet));
    const [a, b] = pickTwoCards();
    setCardA(a);
    setCardB(b);
    setResult(null);
    sfxCardFlip();
    setPhase("reveal");
  }, [canBet, totalBet, dispatch, pickTwoCards]);

  // After reveal, determine winner after a short delay
  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = setTimeout(() => {
      const atkA = getMaxAttack(cardA);
      const atkB = getMaxAttack(cardB);
      if (atkA > atkB) {
        if (side === "pikachu") {
          sfxBattleWin();
          dispatch(addCoins(totalBet * 2));
          setResult("win");
        } else {
          sfxBattleLose();
          setResult("lose");
        }
      } else if (atkB > atkA) {
        if (side === "bulbasaur") {
          sfxBattleWin();
          dispatch(addCoins(totalBet * 2));
          setResult("win");
        } else {
          sfxBattleLose();
          setResult("lose");
        }
      } else {
        dispatch(addCoins(totalBet));
        setResult("tie");
      }
      setPhase("result");
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, cardA, cardB, side, totalBet, dispatch]);

  const resetGame = () => {
    setPhase("pick");
    setSide(null);
    setMultiplier(1);
    setCardA(null);
    setCardB(null);
    setResult(null);
  };

  const atkA = cardA ? getMaxAttack(cardA) : 0;
  const atkB = cardB ? getMaxAttack(cardB) : 0;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-green-400 mb-3">
          Battle Bet
        </h1>
        <p className="text-gray-400">
          Pick a side, place your bet. Highest attack wins. Double or nothing!
        </p>
      </div>

      {/* Arena */}
      <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-4 md:p-6">

        {/* Betting phase */}
        {phase === "pick" && (
          <div className="space-y-6">
            {/* Side picker */}
            <div>
              <p className="text-sm text-gray-400 text-center mb-3">Choose your fighter</p>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {Object.entries(SIDES).map(([key, s]) => (
                  <button
                    key={key}
                    onClick={() => setSide(key)}
                    className={"flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition cursor-pointer " + (
                      side === key
                        ? s.border + " bg-gray-800 shadow-lg"
                        : "border-gray-700 hover:border-gray-600"
                    )}
                  >
                    <span className="text-4xl">{s.emoji}</span>
                    <span className={"font-bold text-lg " + (side === key ? s.text : "text-gray-300")}>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chip selector */}
            <div>
              <p className="text-sm text-gray-400 text-center mb-3">Place your bet</p>
              <div className="flex flex-wrap justify-center gap-2">
                {CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setBet(chip)}
                    disabled={coins < chip}
                    className={"px-4 py-2.5 rounded-full font-bold text-sm transition cursor-pointer " + (
                      bet === chip
                        ? "bg-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/25"
                        : coins < chip
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "bg-gray-800 text-yellow-400 hover:bg-gray-700"
                    )}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <p className="text-center text-yellow-400 font-semibold mt-3 text-lg">Bet: {bet} coins</p>
            </div>

            {/* Multiplier selector */}
            <div>
              <p className="text-sm text-gray-400 text-center mb-3">Bet multiplier</p>
              <div className="flex justify-center gap-3">
                {MULTIPLIERS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMultiplier(m)}
                    disabled={coins < bet * m}
                    className={"px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer border-2 " + (
                      multiplier === m
                        ? m === 3 ? "border-red-500 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
                          : m === 2 ? "border-orange-500 bg-orange-500/20 text-orange-400 shadow-lg shadow-orange-500/20"
                          : "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                        : coins < bet * m
                          ? "border-gray-800 bg-gray-800 text-gray-600 cursor-not-allowed"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500"
                    )}
                  >
                    {m}x
                  </button>
                ))}
              </div>
              {multiplier > 1 && (
                <p className={"text-center font-bold mt-2 text-lg " + (multiplier === 3 ? "text-red-400" : "text-orange-400")}>
                  Total: {totalBet} coins (win = {totalBet * 2})
                </p>
              )}
            </div>

            {/* Start button */}
            <div className="text-center space-y-3">
              {poolError && (
                <div className="space-y-2">
                  <p className="text-red-400 text-sm">{poolError}</p>
                  <button onClick={retry} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-xl transition cursor-pointer text-sm">Retry</button>
                </div>
              )}
              <button
                onClick={startBattle}
                disabled={!canBet}
                className={"px-10 py-4 rounded-xl text-lg font-bold transition cursor-pointer " + (
                  canBet
                    ? "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-lg shadow-red-500/25"
                    : "bg-gray-800 text-gray-600 cursor-not-allowed"
                )}
              >
                {!poolReady ? (poolError ? "API unavailable" : "Loading cards...") : !side ? "Pick a side first" : coins < totalBet ? "Not enough coins" : "Fight!"}
              </button>
            </div>
          </div>
        )}

        {/* Reveal & Result */}
        {(phase === "reveal" || phase === "result") && cardA && cardB && (
          <div className="space-y-6">
            {/* Cards face-off */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
              {/* Pikachu card */}
              <div className={"card-flip flex flex-col items-center " + (side === "pikachu" ? "ring-2 ring-yellow-400 rounded-2xl p-2" : "p-2")}>
                <p className="text-sm font-bold text-yellow-400 mb-2">{SIDES.pikachu.emoji} {SIDES.pikachu.name} {side === "pikachu" ? "(You)" : ""}</p>
                <div className={"rounded-xl border-2 overflow-hidden bg-gray-900 w-full max-w-[180px] " + (
                  phase === "result" && atkA > atkB ? "border-yellow-400 shadow-lg shadow-yellow-400/30" : phase === "result" && atkA < atkB ? "border-red-500 opacity-60" : "border-gray-700"
                )}>
                  <img src={cardA.images?.small} alt={cardA.name} className="w-full aspect-[2.5/3.5] object-cover" />
                </div>
                <p className="mt-2 text-sm font-semibold text-white truncate max-w-[180px]">{cardA.name}</p>
                <p className="text-xs text-gray-400">ATK: <span className="text-yellow-400 font-bold text-base">{atkA}</span></p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-3xl font-black text-gray-600">VS</span>
                {phase === "result" && (
                  <div className={"card-fade-in text-center px-3 py-1.5 rounded-lg text-sm font-bold " + (
                    result === "win" ? "bg-green-500/20 text-green-400" : result === "lose" ? "bg-red-500/20 text-red-400" : "bg-gray-700 text-gray-300"
                  )}>
                    {result === "win" ? "YOU WIN!" : result === "lose" ? "YOU LOSE" : "TIE"}
                  </div>
                )}
              </div>

              {/* Bulbasaur card */}
              <div className={"card-flip flex flex-col items-center " + (side === "bulbasaur" ? "ring-2 ring-green-400 rounded-2xl p-2" : "p-2")}
                style={{ animationDelay: "0.15s", animationFillMode: "both" }}
              >
                <p className="text-sm font-bold text-green-400 mb-2">{SIDES.bulbasaur.emoji} {SIDES.bulbasaur.name} {side === "bulbasaur" ? "(You)" : ""}</p>
                <div className={"rounded-xl border-2 overflow-hidden bg-gray-900 w-full max-w-[180px] " + (
                  phase === "result" && atkB > atkA ? "border-green-400 shadow-lg shadow-green-400/30" : phase === "result" && atkB < atkA ? "border-red-500 opacity-60" : "border-gray-700"
                )}>
                  <img src={cardB.images?.small} alt={cardB.name} className="w-full aspect-[2.5/3.5] object-cover" />
                </div>
                <p className="mt-2 text-sm font-semibold text-white truncate max-w-[180px]">{cardB.name}</p>
                <p className="text-xs text-gray-400">ATK: <span className="text-green-400 font-bold text-base">{atkB}</span></p>
              </div>
            </div>

            {/* Result payout */}
            {phase === "result" && (
              <div className="card-fade-in text-center space-y-4">
                <div className="text-2xl font-bold">
                  {result === "win" && <span className="text-green-400">+{totalBet * 2} coins! 🎉</span>}
                  {result === "lose" && <span className="text-red-400">-{totalBet} coins 💀</span>}
                  {result === "tie" && <span className="text-gray-300">Draw — bet returned 🤝</span>}
                </div>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold rounded-xl transition pack-bounce cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="mt-8 bg-gray-900/30 rounded-xl border border-gray-800/50 p-4 text-sm text-gray-500 space-y-1">
        <p className="text-gray-400 font-semibold">How it works:</p>
        <p>1. Pick a side — ⚡ Pikachu or 🌿 Bulbasaur</p>
        <p>2. Choose your bet (50 to 1,000 coins)</p>
        <p>3. Two random cards are drawn — one for each side</p>
        <p>4. The card with the <span className="text-white font-medium">higher attack</span> wins</p>
        <p>5. Use <span className="text-orange-400">2x</span> or <span className="text-red-400">3x</span> multiplier to increase your bet and payout</p>
        <p>6. Win = <span className="text-green-400">2x payout</span> · Lose = <span className="text-red-400">bet lost</span> · Tie = <span className="text-gray-300">bet returned</span></p>
      </div>
    </div>
  );
}
