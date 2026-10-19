import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Waypoints } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RightsExplorer } from "@/components/rights-explorer";
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

  return (
    <main className="rights-network-page">
      <SiteHeader active="network" />
      <div className="rights-network-shell">
        <div className="rights-network-breadcrumbs">
          <Link href="/rechten"><ArrowLeft size={16} aria-hidden="true" /> Alle rechten</Link>
          <Link href="/rechten/netwerk"><Waypoints size={16} aria-hidden="true" /> Hele netwerk</Link>
        </div>
        <h1 className="sr-only">{graph.nodes.find((node) => node.id === canonical)?.title}</h1>
        <RightsExplorer graph={graph} initialRightId={canonical} showIntro={false} />
      </div>
    </main>
  );
}
