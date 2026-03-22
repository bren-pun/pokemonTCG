export const PACK_COST = 100;
export const BULK_PACK_COUNT = 10;
export const BULK_PACK_COST = 500;

export const RARITY_TIERS = [
  { rarity: "Common", weight: 60, value: 50 },
  { rarity: "Uncommon", weight: 25, value: 100 },
  { rarity: "Rare", weight: 12, value: 250 },
  { rarity: "Rare Holo EX", weight: 3, value: 600 },
];

export function rollRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const tier of RARITY_TIERS) {
    cumulative += tier.weight;
    if (roll < cumulative) return tier.rarity;
  }
  return "Common";
}

/** Roll 10 rarities, guaranteeing at least one Ultra Rare */
export function rollBulkRarities() {
  const results = [];
  for (let i = 0; i < BULK_PACK_COUNT; i++) {
    results.push(rollRarity());
  }
  if (!results.includes("Rare Holo EX")) {
    const swapIdx = Math.floor(Math.random() * BULK_PACK_COUNT);
    results[swapIdx] = "Rare Holo EX";
  }
  return results;
}

export function getCardValue(rarity) {
  const tier = RARITY_TIERS.find((t) => t.rarity === rarity);
  return tier ? tier.value : 50;
}

export function getRarityColor(rarity) {
  switch (rarity) {
    case "Common":
      return "text-gray-400";
    case "Uncommon":
      return "text-green-400";
    case "Rare":
      return "text-blue-400";
    case "Rare Holo EX":
      return "text-purple-400";
    default:
      return "text-yellow-400";
  }
}

export function getRarityBorder(rarity) {
  switch (rarity) {
    case "Common":
      return "border-gray-600";
    case "Uncommon":
      return "border-green-500";
    case "Rare":
      return "border-blue-500";
    case "Rare Holo EX":
      return "border-purple-500";
    default:
      return "border-yellow-500";
  }
}
