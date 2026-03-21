import type { Metadata } from "next";
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

const envTemplateCode = `# Map agent server-side provider config
# Restart \`npm run dev\` after editing this file.

OPENAI_MAP_AGENT_TOKEN=your-openai-compatible-token
OPENAI_MAP_AGENT_BASE_URL=https://api.deepseek.com/v1
OPENAI_MAP_AGENT_MODEL=deepseek-chat

# Optional Anthropic-compatible provider config
# ANTHROPIC_MAP_AGENT_TOKEN=your-anthropic-token
# ANTHROPIC_MAP_AGENT_BASE_URL=https://your-anthropic-endpoint
# ANTHROPIC_MAP_AGENT_MODEL=claude-3-5-sonnet-latest`;

const routeExampleCode = `import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1),
  provider: z.enum(["openai", "anthropic"]).default("openai"),
});

const flyToCommandSchema = z.object({
  type: z.literal("fly_to"),
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().optional(),
  bearing: z.number().optional(),
  pitch: z.number().optional(),
  duration: z.number().optional(),
});

const flyToTool = tool(
  async (input) => JSON.stringify({ type: "fly_to", ...input }),
  {
    name: "fly_to",
    description: "Fly the map camera to a target location.",
    schema: flyToCommandSchema.omit({ type: true }),
  },
);

const PROVIDER_CONFIG = {
  openai: {
    model: process.env.OPENAI_MAP_AGENT_MODEL ?? "deepseek-chat",
    baseUrl: process.env.OPENAI_MAP_AGENT_BASE_URL,
    token: process.env.OPENAI_MAP_AGENT_TOKEN,
  },
  anthropic: {
    model: process.env.ANTHROPIC_MAP_AGENT_MODEL ?? "claude-3-5-sonnet-latest",
    baseUrl: process.env.ANTHROPIC_MAP_AGENT_BASE_URL,
    token: process.env.ANTHROPIC_MAP_AGENT_TOKEN,
  },
} as const;

export async function POST(request: Request) {
  const { prompt, provider } = requestSchema.parse(await request.json());
  const config = PROVIDER_CONFIG[provider];

  const llm =
    provider === "anthropic"
      ? new ChatAnthropic({
          model: config.model,
          apiKey: config.token,
          anthropicApiUrl: config.baseUrl,
        })
      : new ChatOpenAI({
          model: config.model,
          apiKey: config.token,
          configuration: { baseURL: config.baseUrl },
        });

  const agent = llm.bindTools([flyToTool], { tool_choice: "fly_to" });
  const response = await agent.invoke(
    [
      'You are a map camera assistant.',
      'Return exactly one "fly_to" action.',
      'center must be [longitude, latitude].',
      "",
      \`User request: \${prompt}\`,
    ].join("\\n"),
  );

  const toolCall = response.tool_calls?.find((call) => call.name === "fly_to");
  if (!toolCall?.args) {
    return NextResponse.json(
      { error: "Model did not return a fly_to tool call." },
      { status: 500 },
    );
  }

  const command = flyToCommandSchema.parse({
    type: "fly_to",
    ...toolCall.args,
  });

  return NextResponse.json({ command, provider, model: config.model });
}`;

export default async function AgentPage() {
  const exampleSource = getExampleSource("map-agent-example.tsx");

  return (
    <DocsLayout
      title="Map Agent"
      description="Use a lightweight assistant panel inside the map to trigger fly_to commands with natural language."
      toc={[
        { title: "Preview", slug: "preview" },
        { title: "Props", slug: "props" },
        { title: "Environment Template", slug: "environment-template" },
        { title: "Server Route", slug: "server-route" },
        { title: "Extending The Agent", slug: "extending-the-agent" },
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

      <DocsSection title="Environment Template">
        <p>
          Keep provider credentials and model configuration on the server. The
          template below shows the recommended shape for{" "}
          <DocsCode>.env.local</DocsCode>.
        </p>
        <CodeBlock code={envTemplateCode} language="bash" />
      </DocsSection>

      <DocsSection title="Server Route">
        <p>
          The example below shows the recommended API route shape. Keep provider
          model names, base URLs, and tokens on the server through{" "}
          <DocsCode>PROVIDER_CONFIG</DocsCode> and environment variables.
        </p>
        <CodeBlock code={routeExampleCode} language="ts" />
      </DocsSection>

      <DocsSection title="Extending The Agent">
        <p>
          If you want the assistant to do more than{" "}
          <DocsCode>fly_to</DocsCode>, treat the change as a full contract
          update. The map UI, the client runtime, the server route, and the
          public docs all need to stay in sync.
        </p>
        <ul>
          <li>
            <strong>Extend the frontend command contract:</strong> update{" "}
            <DocsCode>src/lib/map-agent/types.ts</DocsCode>,{" "}
            <DocsCode>src/lib/map-agent/schema.ts</DocsCode>, and{" "}
            <DocsCode>src/lib/map-agent/execute.ts</DocsCode> so the new command
            can be validated and executed on the client.
          </li>
          <li>
            <strong>Update the assistant UI only if the public API changes:</strong>{" "}
            if a new feature needs extra props or different panel behavior,
            update <DocsCode>src/registry/map.tsx</DocsCode> and keep{" "}
            <DocsCode>MapAgentProps</DocsCode> aligned with the actual request
            shape.
          </li>
          <li>
            <strong>Expand the server route tool set:</strong> update{" "}
            <DocsCode>src/app/api/map-agent/route.ts</DocsCode> to add the new
            tool schema, bind the tool, and normalize the returned payload to
            the same command shape expected by the frontend runtime.
          </li>
          <li>
            <strong>Sync public documentation:</strong> update this page,{" "}
            <DocsCode>API Reference</DocsCode>, and any installation notes if
            the public surface or setup instructions changed.
          </li>
          <li>
            <strong>Sync registry output when installable files change:</strong>{" "}
            if you add, remove, or rename files under{" "}
            <DocsCode>src/lib/map-agent</DocsCode> or expose new public exports,
            update <DocsCode>registry.json</DocsCode> and rebuild the registry
            output with <DocsCode>npm run registry:build</DocsCode>.
          </li>
        </ul>
        <DocsNote>
          A practical rule: if you add a new command such as{" "}
          <DocsCode>draw_polygon</DocsCode>, you should expect to touch both
          sides of the contract at the same time. Do not change only the server
          tool or only the client executor.
        </DocsNote>
      </DocsSection>
    </DocsLayout>
  );
}
