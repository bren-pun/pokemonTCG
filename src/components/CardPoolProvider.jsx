import { createContext, useContext } from "react";
import { useCardPool } from "../utils/useCardPool";

const CardPoolContext = createContext({ pool: {}, ready: false });

export function CardPoolProvider({ children }) {
  const value = useCardPool();
  return (
    <CardPoolContext.Provider value={value}>
      {children}
    </CardPoolContext.Provider>
  );
}

export function usePool() {
  return useContext(CardPoolContext);
}
