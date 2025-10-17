import SymbolsPageClient from "./SymbolsPageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ symbols: string }>;
}) {
  const { symbols } = await params; // <-- important
  return <SymbolsPageClient symbols={symbols} />;
}
