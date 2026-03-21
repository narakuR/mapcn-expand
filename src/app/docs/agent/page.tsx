import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { CodeBlock } from "../_components/code-block";
import {
  DocsCode,
  DocsLayout,
  DocsNote,
  DocsPropTable,
  DocsSection,
} from "../_components/docs";
import { MapAgentExample } from "../_components/examples/map-agent-example";

export const metadata: Metadata = {
  title: "Map Agent",
};

const usageCode = `import { Map, MapAgent, MapControls } from "@/registry/map";

export function AgentDemo() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-xl border">
      <Map>
        <MapAgent
          endpoint="/api/map-agent"
          provider="openai"
          model="deepseek-chat"
          baseUrl="https://api.deepseek.com"
          token="YOUR_TOKEN"
          defaultPrompt="Fly to downtown Shanghai with a city-level zoom."
        />
        <MapControls position="top-right" showDraw showZoom={false} />
      </Map>
    </div>
  );
}`;

export default async function AgentPage() {
  const routeCode = await readFile(
    join(process.cwd(), "src/app/api/map-agent/route.ts"),
    "utf8",
  );

  return (
    <DocsLayout
      title="Map Agent"
      description="Use a lightweight assistant panel inside the map to trigger fly_to commands with natural language."
      toc={[
        { title: "Embedded Assistant", slug: "embedded-assistant" },
        { title: "Usage", slug: "usage" },
        { title: "Props", slug: "props" },
        { title: "Server Route", slug: "server-route" },
      ]}
    >
      <DocsSection title="Embedded Assistant">
        <p>
          <DocsCode>MapAgent</DocsCode> lives inside the map tree and talks to{" "}
          <DocsCode>/api/map-agent</DocsCode>. The current implementation focuses
          on a single map action: <DocsCode>fly_to</DocsCode>.
        </p>
        <MapAgentExample />
      </DocsSection>

      <DocsSection title="Usage">
        <p>
          Mount the assistant directly inside <DocsCode>Map</DocsCode>. This keeps
          the map state local to the registry component and avoids wiring refs in
          page-level code.
        </p>
        <DocsNote>
          <DocsCode>endpoint</DocsCode> is required. Pass the API route that
          accepts map-agent requests, for example{" "}
          <DocsCode>/api/map-agent</DocsCode>.
        </DocsNote>
        <CodeBlock code={usageCode} language="tsx" />
      </DocsSection>

      <DocsSection title="Props">
        <DocsPropTable
          props={[
            {
              name: "endpoint",
              type: "string",
              default: "—",
              description:
                "Required API endpoint for assistant requests. This should point to your map-agent route, such as /api/map-agent.",
            },
            {
              name: "provider",
              type: `"openai" | "anthropic"`,
              default: `"openai"`,
              description:
                "Selects which LangChain chat model implementation the server route should use.",
            },
            {
              name: "model",
              type: "string",
              default: "provider-specific fallback",
              description:
                "Overrides the model name sent to the API route for the current provider.",
            },
            {
              name: "baseUrl",
              type: "string",
              default: "env fallback",
              description:
                "Optional provider endpoint override. Useful for OpenAI-compatible or Anthropic-compatible gateways.",
            },
            {
              name: "token",
              type: "string",
              default: "env fallback",
              description:
                "Authentication token forwarded to the API route. Prefer environment variables over hardcoding it in client code.",
            },
            {
              name: "defaultPrompt",
              type: "string",
              default: `"Fly to downtown Shanghai with a city-level zoom."`,
              description:
                "Initial prompt used for the first automatic assistant request.",
            },
            {
              name: "autoRun",
              type: "boolean",
              default: "false",
              description:
                "Runs the initial prompt automatically after the map instance is ready.",
            },
            {
              name: "placeholder",
              type: "string",
              default: `"Try: Fly to West Lake in Hangzhou with a scenic city view"`,
              description:
                "Placeholder text shown in the assistant input field.",
            },
            {
              name: "position",
              type: `"top-left" | "top-right" | "bottom-left" | "bottom-right"`,
              default: `"top-left"`,
              description:
                "Controls where the assistant panel is rendered inside the map.",
            },
            {
              name: "className",
              type: "string",
              default: "—",
              description:
                "Adds extra classes to the assistant container for custom layout or styling.",
            },
          ]}
        />
        <DocsNote>
          The assistant UI is intentionally narrow: one prompt box, one submit
          button, and one tool-call action. This keeps the map interaction
          predictable while the provider compatibility is still being tuned.
        </DocsNote>
      </DocsSection>

      <DocsSection title="Server Route">
        <p>
          The backend implementation is exposed below exactly from{" "}
          <DocsCode>src/app/api/map-agent/route.ts</DocsCode>. It supports both{" "}
          <DocsCode>openai</DocsCode> and <DocsCode>anthropic</DocsCode>{" "}
          providers and returns a normalized <DocsCode>fly_to</DocsCode>{" "}
          command via tool calling.
        </p>
        <CodeBlock code={routeCode} language="ts" />
      </DocsSection>
    </DocsLayout>
  );
}
