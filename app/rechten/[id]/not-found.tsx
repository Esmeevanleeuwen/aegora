import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function RightNotFound() {
  return (
    <main className="rights-network-page">
      <SiteHeader active="network" />
      <div className="rights-network-shell rights-network-heading">
        <h1>Dit recht is niet gevonden.</h1>
        <p>Deze link kan verouderd zijn. Zoek verder in de rechtenbibliotheek of verken de opgeslagen verbanden.</p>
        <Link className="rights-network-entry" href="/rechten/netwerk">Open het rechtennetwerk</Link>
      </div>
    </main>
  );
}
