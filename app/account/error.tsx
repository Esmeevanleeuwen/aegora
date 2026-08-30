"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AccountError({ reset }: { reset: () => void }) {
  return (
    <div className="account-error">
      <AlertTriangle size={25} />
      <h2>Je persoonlijke omgeving kon niet worden geladen.</h2>
      <p>Controleer je verbinding en probeer het opnieuw.</p>
      <button type="button" onClick={reset}><RefreshCw size={16} /> Opnieuw proberen</button>
    </div>
  );
}
