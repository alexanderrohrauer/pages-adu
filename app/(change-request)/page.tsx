import { ArtifactsOverview } from "@/components/artifacts/artifacts-overview";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artifacts overview | PAGES",
};

export default function Page() {
  return <ArtifactsOverview />;
}
