import { RightsLibrary } from "@/components/rights-library";
import { getPublicRightsData } from "@/lib/public-rights-repository";

export const revalidate = 3600;

export default async function RightsLibraryPage() {
  const data = await getPublicRightsData();
  return <RightsLibrary {...data} />;
}
