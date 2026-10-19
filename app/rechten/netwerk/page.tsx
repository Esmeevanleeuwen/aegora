import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { RightsExplorer } from "@/components/rights-explorer";
import { getRightsGraph } from "@/lib/rights-network-repository";

export const metadata: Metadata = {
  title: "Rechtennetwerk — Aegora",
  description: "Ontdek hoe rechten samenhangen. Volg opgeslagen verbanden, verken belangrijke routes en bewaar je eigen combinaties.",
};

type NetworkPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const [graph, params] = await Promise.all([getRightsGraph(), searchParams]);
  const value = (key: string) => typeof params[key] === "string" ? params[key] as string : "";
  const selectedIds = value("select").split(",").filter(Boolean).slice(0, 12);
  const combination = graph.combinations.find((item) => item.id === value("combinatie") || item.slug === value("combinatie"));

  return (
    <main className="rights-network-page">
      <SiteHeader active="network" />
      <div className="rights-network-shell">
        <div className="rights-network-heading">
          <span className="eyebrow">Rechten in samenhang</span>
          <h1>Het ene recht leidt je verder.</h1>
          <p>Begin bij een recht, volg de verbanden en stel je eigen combinatie samen. Bij iedere koppeling lees je waarom de onderwerpen met elkaar verbonden zijn.</p>
        </div>
        <RightsExplorer
          graph={graph}
          initialRightId={value("recht") || undefined}
          initialCombinationId={combination?.id}
          initialSelectedIds={selectedIds.length ? selectedIds : undefined}
          initialQuery={value("zoek")}
          showIntro={false}
        />
      </div>
    </main>
  );
}
