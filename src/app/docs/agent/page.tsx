import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getExampleSource } from "@/lib/get-example-source";
import { CodeBlock } from "../_components/code-block";
import { ComponentPreview } from "../_components/component-preview";
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

export default async function AgentPage() {
  const routeCode = await readFile(
    join(process.cwd(), "src/app/api/map-agent/route.ts"),
    "utf8",
  );
  const exampleSource = getExampleSource("map-agent-example.tsx");

  return (
    <DocsLayout
      title="Map Agent"
      description="Use a lightweight assistant panel inside the map to trigger fly_to commands with natural language."
      toc={[
        { title: "Preview", slug: "preview" },
        { title: "Props", slug: "props" },
        { title: "Server Route", slug: "server-route" },
      ]}
    >
      <DocsSection title="Preview">
        <p>
          <DocsCode>MapAgent</DocsCode> lives inside the map tree and talks to{" "}
          <DocsCode>/api/map-agent</DocsCode>. The current implementation focuses
          on a single map action: <DocsCode>fly_to</DocsCode>.
        </p>
        <DocsNote>
          <DocsCode>endpoint</DocsCode> is required. Pass the API route that
          accepts map-agent requests, for example{" "}
          <DocsCode>/api/map-agent</DocsCode>.
          Provider credentials, model names, and base URLs should stay on the
          server.
        </DocsNote>
        <ComponentPreview code={exampleSource}>
          <MapAgentExample />
        </ComponentPreview>
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
                "Selects which server-side provider profile should handle the request.",
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
          command via tool calling. Provider model names, base URLs, and tokens
          are resolved on the server through <DocsCode>PROVIDER_CONFIG</DocsCode>{" "}
          and environment variables.
        </p>
        <CodeBlock code={routeCode} language="ts" />
      </DocsSection>
    </DocsLayout>
  );
}
