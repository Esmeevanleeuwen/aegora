import { redirect } from "next/navigation";
import { AccountDashboard } from "./account-dashboard";
import { SiteHeader } from "@/components/site-header";
import { getPublicRightsData } from "@/lib/public-rights-repository";
import { createClient } from "@/lib/supabase/server";
import type { AegoraDocument, AegoraDossier, AegoraProfile, AegoraSavedRight } from "@/lib/personal-data";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const userId = claimData?.claims?.sub;

  if (!userId) redirect("/inloggen");

  const [profileResult, dossiersResult, documentsResult, savedRightsResult, publicRights] = await Promise.all([
    supabase.from("aegora_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("aegora_dossiers").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("aegora_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("aegora_saved_rights").select("id,right_id,note,created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    getPublicRightsData(),
  ]);

  const firstError = profileResult.error ?? dossiersResult.error ?? documentsResult.error ?? savedRightsResult.error;
  if (firstError) throw new Error("Je persoonlijke omgeving kon niet worden geladen.");

  const email = typeof claimData.claims.email === "string" ? claimData.claims.email : "";
  const rightById = new Map(publicRights.rules.map((right) => [right.id, right]));
  const savedRights = (savedRightsResult.data ?? [])
    .map((saved) => {
      const right = rightById.get(String(saved.right_id));
      return right ? { ...saved, right } as AegoraSavedRight : null;
    })
    .filter((saved): saved is AegoraSavedRight => saved !== null);

  return (
    <main className="account-page">
      <SiteHeader active="account" />
      <AccountDashboard
        userId={userId}
        email={email}
        initialProfile={(profileResult.data as AegoraProfile | null) ?? null}
        initialDossiers={(dossiersResult.data as AegoraDossier[] | null) ?? []}
        initialDocuments={(documentsResult.data as AegoraDocument[] | null) ?? []}
        initialSavedRights={savedRights}
      />
    </main>
  );
}
