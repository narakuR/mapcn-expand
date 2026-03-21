import type { Metadata } from "next";
import { DocsLayout, DocsSection } from "../_components/docs";
import { MapAgentExample } from "../_components/examples/map-agent-example";

export const metadata: Metadata = {
  title: "Map Agent",
};

export default function AgentPage() {
  return (
    <DocsLayout
      title="Map Agent"
      description="Use a lightweight assistant panel inside the map to trigger fly_to commands with natural language."
    >
      <DocsSection title="Embedded Assistant">
        <MapAgentExample />
      </DocsSection>
    </DocsLayout>
  );
}
