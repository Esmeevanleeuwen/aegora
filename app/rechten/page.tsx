import { RightsLibrary } from "@/components/rights-library";
import { getPublicRightsData } from "@/lib/public-rights-repository";

export const dynamic = "force-dynamic";

export default async function RightsLibraryPage() {
  const data = await getPublicRightsData();
  return <RightsLibrary {...data} />;
}
