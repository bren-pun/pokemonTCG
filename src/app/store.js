import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "../features/game/gameSlice";
import { pokemonApi } from "../services/pokemonApi";

export const store = configureStore({
  reducer: {
    game: gameReducer,
    [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
});

store.subscribe(() => {
  const state = store.getState();
  localStorage.setItem("gameState", JSON.stringify(state.game));
});
