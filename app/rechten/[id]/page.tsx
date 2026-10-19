import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { resolveRightId } from "@/lib/rights-network";
import { getRightsGraph } from "@/lib/rights-network-repository";

type RightPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: RightPageProps): Promise<Metadata> {
  const [graph, { id }] = await Promise.all([getRightsGraph(), params]);
  const canonical = resolveRightId(graph, id);
  const right = graph.nodes.find((node) => node.id === canonical);
  return right ? { title: `${right.title} — Aegora`, description: right.summary } : { title: "Recht niet gevonden — Aegora" };
}

export default async function RightPage({ params }: RightPageProps) {
  const [graph, { id }] = await Promise.all([getRightsGraph(), params]);
  const canonical = resolveRightId(graph, id);
  if (!canonical) notFound();

  redirect(`/rechten/verkennen?context=catalogus&select=${encodeURIComponent(canonical)}`);
}
