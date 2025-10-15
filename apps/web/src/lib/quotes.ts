import { create } from "zustand";

type Quote = { price: number; ts: string };
type QuotesState = {
  quotes: Record<string, Quote>;
  setQuote: (symbol: string, q: Quote) => void;
};

export const useQuotes = create<QuotesState>((set) => ({
  quotes: {},
  setQuote: (symbol, q) =>
    set((s) => ({ quotes: { ...s.quotes, [symbol]: q } })),
}));
