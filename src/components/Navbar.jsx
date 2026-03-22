import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import { addCoins } from "../features/game/gameSlice";
import { sfxCoinClaim } from "../utils/sfx";

export default function Navbar() {
  const coins = useSelector((s) => s.game.coins);
  const dispatch = useDispatch();

  const claimCoins = () => {
    sfxCoinClaim();
    dispatch(addCoins(500));
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <NavLink to="/" className="text-xl font-bold text-yellow-400 tracking-tight">
          ⚡ PokéPacks
        </NavLink>

        <div className="flex items-center gap-4 md:gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"}`
            }
          >
            Open Packs
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"}`
            }
          >
            Inventory
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"}`
            }
          >
            History
          </NavLink>
          <NavLink
            to="/battle"
            className={({ isActive }) =>
              `text-sm font-medium transition ${isActive ? "text-white" : "text-gray-400 hover:text-gray-200"}`
            }
          >
            Battle
          </NavLink>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-full text-sm font-semibold">
              <span>🪙</span>
              <span>{coins.toLocaleString()}</span>
            </div>
            <button
              onClick={claimCoins}
              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-full transition cursor-pointer"
              title="Claim 500 free coins"
            >
              +500
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
