import { useCallback, useEffect, useRef, useState } from "react";
import { RARITY_TIERS } from "./rarity";
import { getCachedPool, saveCachedPool } from "./cardCache";

const TCG_API = "https://api.pokemontcg.io/v2/cards";
const POKE_API = "https://pokeapi.co/api/v2/pokemon";
const SPRITE_BASE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const FETCH_TIMEOUT = 15000;

function fetchWithTimeout(url, ms = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** Primary: Pokémon TCG API */
async function fetchFromTCGApi() {
  const results = await Promise.all(
    RARITY_TIERS.map(async (tier) => {
      const res = await fetchWithTimeout(
        `${TCG_API}?q=rarity:"${encodeURIComponent(tier.rarity)}"&pageSize=50`
      );
      if (!res.ok) throw new Error(`TCG API HTTP ${res.status}`);
      const json = await res.json();
      return { rarity: tier.rarity, cards: json.data || [] };
    })
  );

  const pool = {};
  for (const { rarity, cards } of results) {
    pool[rarity] = cards;
  }

  const battleRes = await fetchWithTimeout(
    `${TCG_API}?q=attacks.damage:[1 TO *]&pageSize=50`
  );
  if (battleRes.ok) {
    const battleJson = await battleRes.json();
    pool._battle = (battleJson.data || []).filter(
      (c) => c.attacks?.some((a) => parseInt(a.damage, 10) > 0)
    );
  }

  return pool;
}

/** Fallback: PokéAPI — builds card-like objects from real Pokémon data */
async function fetchFromPokeAPI() {
  // Fetch 150 Pokémon with full details (stats, sprites)
  const ids = Array.from({ length: 150 }, (_, i) => i + 1);
  const chunks = [];
  for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));

  const allPokemon = [];
  for (const chunk of chunks) {
    const batch = await Promise.all(
      chunk.map(async (id) => {
        const res = await fetchWithTimeout(`${POKE_API}/${id}`);
        if (!res.ok) return null;
        return res.json();
      })
    );
    allPokemon.push(...batch.filter(Boolean));
  }

  if (allPokemon.length === 0) throw new Error("PokéAPI returned no data");

  // Map each Pokémon to a card-like object
  const cards = allPokemon.map((p) => {
    const atkStat = p.stats.find((s) => s.stat.name === "attack")?.base_stat || 50;
    const spAtkStat = p.stats.find((s) => s.stat.name === "special-attack")?.base_stat || 50;
    const totalStats = p.stats.reduce((sum, s) => sum + s.base_stat, 0);

    // Assign rarity by total base stats
    let rarity;
    if (totalStats >= 500) rarity = "Rare Holo EX";
    else if (totalStats >= 420) rarity = "Rare";
    else if (totalStats >= 330) rarity = "Uncommon";
    else rarity = "Common";

    const name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
    const img = `${SPRITE_BASE}/${p.id}.png`;

    return {
      id: `poke-${p.id}`,
      name,
      rarity,
      images: { small: img, large: img },
      set: { name: "PokéAPI" },
      hp: String(p.stats.find((s) => s.stat.name === "hp")?.base_stat || 50),
      types: p.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
      attacks: [
        { name: "Tackle", damage: `${Math.round(atkStat / 2)}` },
        { name: "Special", damage: `${Math.round(spAtkStat / 2)}` },
      ],
    };
  });

  const pool = {};
  for (const tier of RARITY_TIERS) {
    pool[tier.rarity] = cards.filter((c) => c.rarity === tier.rarity);
  }
  pool._battle = cards;

  return pool;
}

export function useCardPool() {
  const [pool, setPool] = useState(() => getCachedPool() || {});
  const [ready, setReady] = useState(() => {
    const cached = getCachedPool();
    return cached && Object.keys(cached).length > 0;
  });
  const [error, setError] = useState(null);
  const fetching = useRef(false);

  const fetchPool = useCallback(async () => {
    if (fetching.current) return;
    fetching.current = true;
    setError(null);

    try {
      // Try primary API first
      const newPool = await fetchFromTCGApi();
      setPool(newPool);
      setReady(true);
      saveCachedPool(newPool);
    } catch {
      try {
        // Fallback to PokéAPI
        const fallbackPool = await fetchFromPokeAPI();
        setPool(fallbackPool);
        setReady(true);
        saveCachedPool(fallbackPool);
      } catch {
        // Both APIs failed — try cache
        const cached = getCachedPool();
        if (cached && Object.keys(cached).length > 0) {
          setPool(cached);
          setReady(true);
        } else {
          setError("Both APIs are unreachable. Check your internet and try again.");
        }
      }
    } finally {
      fetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  return { pool, ready, error, retry: fetchPool };
}
