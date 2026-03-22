import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const pokemonApi = createApi({
  reducerPath: "pokemonApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.pokemontcg.io/v2/",
  }),
  keepUnusedDataFor: 600,
  endpoints: (builder) => ({
    getCardsByRarity: builder.query({
      query: (rarity) => ({
        url: "cards",
        params: {
          q: `rarity:"${rarity}"`,
          pageSize: 50,
        },
      }),
    }),
    getBattleCards: builder.query({
      query: () => ({
        url: "cards",
        params: {
          q: "attacks.damage:[1 TO *]",
          pageSize: 50,
          page: Math.floor(Math.random() * 10) + 1,
        },
      }),
    }),
  }),
});

export const {
  useLazyGetCardsByRarityQuery,
  useGetCardsByRarityQuery,
  usePrefetch,
  useLazyGetBattleCardsQuery,
} = pokemonApi;
