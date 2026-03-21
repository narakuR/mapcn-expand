import type { Metadata } from "next";
import { DocsLayout, DocsSection } from "../_components/docs";
import { MapAgentExample } from "../_components/examples/map-agent-example";

export const metadata: Metadata = {
    title: "Agent",
};

export default function AgentPage() {
    return (
        <DocsLayout
            title="Agent"
            description="Agent"
        >
            <DocsSection>
                <MapAgentExample />
            </DocsSection>
        </DocsLayout>
    );
}