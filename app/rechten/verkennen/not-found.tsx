import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function ExplorerNotFound() {
  return (
    <main className="rights-network-page">
      <SiteHeader active="network" />
      <div className="rights-network-shell rights-network-heading">
        <h1>Deze context is niet beschikbaar.</h1>
        <p>Controleer de gedeelde link of begin opnieuw bij de rechtenverkenner.</p>
        <Link className="rights-network-entry" href="/rechten/verkennen">Open de rechtenverkenner</Link>
      </div>
    </main>
  );
}
