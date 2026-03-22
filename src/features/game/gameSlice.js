import { createSlice } from "@reduxjs/toolkit";

const loadState = () => {
  try {
    const saved = localStorage.getItem("gameState");
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore parse errors
  }
  return null;
};

const defaultState = {
  coins: 1000,
  inventory: [],
  history: [],
  lastPlayed: null,
};

const initialState = loadState() || defaultState;

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    deductCoins(state, action) {
      state.coins -= action.payload;
      state.lastPlayed = new Date().toISOString();
    },
    addCoins(state, action) {
      state.coins += action.payload;
    },
    addCard(state, action) {
      const card = action.payload;
      state.inventory.push({
        ...card,
        obtainedAt: new Date().toISOString(),
        instanceId: crypto.randomUUID(),
      });
      state.history.unshift({
        ...card,
        obtainedAt: new Date().toISOString(),
      });
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },
    sellCard(state, action) {
      const { instanceId, value } = action.payload;
      state.inventory = state.inventory.filter(
        (c) => c.instanceId !== instanceId
      );
      state.coins += value;
    },
    resetGame() {
      localStorage.removeItem("gameState");
      return { ...defaultState };
    },
  },
});

export const { deductCoins, addCoins, addCard, sellCard, resetGame } =
  gameSlice.actions;
export default gameSlice.reducer;
