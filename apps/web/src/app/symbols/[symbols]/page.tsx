import SymbolsPageClient from "./SymbolsPageClient";

export default function Page({ params }: { params: { symbols: string } }) {
  return <SymbolsPageClient symbols={params.symbols} />;
}
