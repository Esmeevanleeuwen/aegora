import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { RightsWorkspace } from "@/components/rights-workspace";
import { parseExplorerNavigation } from "@/lib/rights-explorer-navigation";
import { ExplorerError, getExplorerDetail, getExplorerIndex } from "@/lib/rights-explorer-repository";

export const metadata: Metadata = {
  title: "Rechten verkennen — Aegora",
  description: "Zoek rechten, volg onderbouwde verbanden en bekijk voorwaarden, uitzonderingen en bronnen binnen de gekozen context.",
};

type ExplorerPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExplorerPage({ searchParams }: ExplorerPageProps) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
    else if (value?.[0]) params.set(key, value[0]);
  }
  const navigation = parseExplorerNavigation(params);
  let index;
  try {
    index = await getExplorerIndex({ context: navigation.context, research: navigation.research });
  } catch (error) {
    if (error instanceof ExplorerError && error.status === 404) notFound();
    throw error;
  }
  const initialDetail = navigation.select && index.items.some(item => item.id === navigation.select)
    ? await getExplorerDetail(navigation.select, { context: navigation.context, research: navigation.research })
    : undefined;

  return (
    <main className="rights-network-page">
      <SiteHeader active="network" />
      <RightsWorkspace initialIndex={index} initialNavigation={navigation} initialDetail={initialDetail} />
    </main>
  );
}
