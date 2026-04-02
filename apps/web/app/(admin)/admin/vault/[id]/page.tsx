import type { Metadata } from "next";
import { VaultArtifactDetail } from "@/components/vault-artifact-detail";

export const metadata: Metadata = {
  title: "Vault entry",
};

export default async function VaultEntryPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return (
    <main className="min-h-screen bg-zinc-950">
      <VaultArtifactDetail artifactId={id} />
    </main>
  );
}
