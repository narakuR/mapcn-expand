import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { NextResponse } from "next/server";
import { z } from "zod";

const DEFAULT_OPENAI_MODEL = "gpt-5-mini";
const DEFAULT_ANTHROPIC_MODEL = "claude-3-5-sonnet-latest";

const requestSchema = z.object({
  prompt: z.string().min(1, "prompt is required"),
  provider: z.enum(["openai", "anthropic"]).default("openai"),
  model: z.string().min(1).optional(),
  baseUrl: z.url().optional(),
  token: z.string().min(1).optional(),
});

const flyToCommandSchema = z.object({
  type: z.literal("fly_to"),
  center: z.tuple([z.number(), z.number()]),
  zoom: z.number().optional(),
  bearing: z.number().optional(),
  pitch: z.number().optional(),
  duration: z.number().optional(),
});

const flyToToolArgsSchema = flyToCommandSchema.omit({
  type: true,
});

type Provider = z.infer<typeof requestSchema>["provider"];

const PROVIDER_CONFIG = {
  openai: {
    name: "OpenAI",
    defaultModel: DEFAULT_OPENAI_MODEL,
    modelEnvKeys: ["OPENAI_MAP_AGENT_MODEL", "OPENAI_MODEL"],
    baseUrlEnvKeys: ["OPENAI_MAP_AGENT_BASE_URL", "OPENAI_BASE_URL"],
    tokenEnvKeys: ["OPENAI_MAP_AGENT_TOKEN", "OPENAI_API_KEY"],
  },
  anthropic: {
    name: "Anthropic",
    defaultModel: DEFAULT_ANTHROPIC_MODEL,
    modelEnvKeys: ["ANTHROPIC_MAP_AGENT_MODEL", "ANTHROPIC_MODEL"],
    baseUrlEnvKeys: ["ANTHROPIC_MAP_AGENT_BASE_URL", "ANTHROPIC_BASE_URL"],
    tokenEnvKeys: ["ANTHROPIC_MAP_AGENT_TOKEN", "ANTHROPIC_API_KEY"],
  },
} as const satisfies Record<
  Provider,
  {
    name: string;
    defaultModel: string;
    modelEnvKeys: readonly string[];
    baseUrlEnvKeys: readonly string[];
    tokenEnvKeys: readonly string[];
  }
>;

const flyToTool = tool(
  async (input) => JSON.stringify({ type: "fly_to", ...input }),
  {
    name: "fly_to",
    description:
      "Fly the map to a target location using longitude/latitude center and optional camera settings.",
    schema: flyToToolArgsSchema,
  },
);

function readFirstEnv(keys: readonly string[]) {
  for (const key of keys) {
    const value = process.env[key];
    if (value) return value;
  }

  return undefined;
}

function jsonError(status: number, error: string, details?: unknown) {
  return NextResponse.json(
    {
      error,
      details: details ?? null,
    },
    { status },
  );
}

function resolveModel(provider: Provider, modelOverride?: string) {
  return (
    modelOverride ||
    readFirstEnv(PROVIDER_CONFIG[provider].modelEnvKeys) ||
    PROVIDER_CONFIG[provider].defaultModel
  );
}

function resolveBaseUrl(provider: Provider, baseUrlOverride?: string) {
  return (
    baseUrlOverride ||
    readFirstEnv(PROVIDER_CONFIG[provider].baseUrlEnvKeys) ||
    undefined
  );
}

function resolveToken(provider: Provider, tokenOverride?: string) {
  return (
    tokenOverride ||
    readFirstEnv(PROVIDER_CONFIG[provider].tokenEnvKeys) ||
    undefined
  );
}

function createBaseModel({
  provider,
  model,
  baseUrl,
  token,
}: {
  provider: Provider;
  model: string;
  baseUrl?: string;
  token?: string;
}) {
  const resolvedToken = resolveToken(provider, token);
  if (!resolvedToken) {
    throw new Error(
      `Missing ${PROVIDER_CONFIG[provider].name} token. Provide token or set ${PROVIDER_CONFIG[provider].tokenEnvKeys.join(" / ")}.`,
    );
  }

  return provider === "anthropic"
    ? new ChatAnthropic({
      model,
      apiKey: resolvedToken,
      anthropicApiUrl: resolveBaseUrl(provider, baseUrl),
    })
    : new ChatOpenAI({
      model,
      apiKey: resolvedToken,
      configuration: {
        baseURL: resolveBaseUrl(provider, baseUrl),
      },
    });
}

function createMapAgent({
  provider,
  model,
  baseUrl,
  token,
}: {
  provider: Provider;
  model: string;
  baseUrl?: string;
  token?: string;
}) {
  const llm = createBaseModel({
    provider,
    model,
    baseUrl,
    token,
  });

  return llm.bindTools(
    [flyToTool],
    provider === "anthropic"
      ? {
        tool_choice: "fly_to",
      }
      : {
        tool_choice: "fly_to",
      },
  );
}

function extractFlyToCommand(response: {
  tool_calls?: Array<{
    name?: string;
    args?: unknown;
  }>;
}) {
  const toolCall = response.tool_calls?.find((call) => call.name === "fly_to");
  if (!toolCall?.args) {
    throw new Error("Model did not return a fly_to tool call.");
  }

  return flyToCommandSchema.parse({
    type: "fly_to",
    ...(toolCall.args as Record<string, unknown>),
  });
}

function buildPrompt(userPrompt: string) {
  return [
    "You are a map camera assistant.",
    'Return exactly one "fly_to" action.',
    "center must be [longitude, latitude].",
    "If the user names a place, resolve it to approximate center coordinates.",
    "Choose a sensible zoom for the requested scope.",
    "Use bearing, pitch, and duration only when they improve the map move.",
    "Do not ask follow-up questions.",
    "",
    `User request: ${userPrompt}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const {
      prompt,
      provider,
      model,
      baseUrl,
      token,
    } = requestSchema.parse(json);

    const resolvedModel = resolveModel(provider, model);
    const resolvedBaseUrl = resolveBaseUrl(provider, baseUrl) ?? null;

    const agent = createMapAgent({
      provider,
      model: resolvedModel,
      baseUrl,
      token,
    });
    const response = await agent.invoke(buildPrompt(prompt));
    const command = extractFlyToCommand(response);

    return NextResponse.json({
      command,
      provider,
      model: resolvedModel,
      baseUrl: resolvedBaseUrl,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(400, "Invalid request payload.", z.treeifyError(error));
    }

    return jsonError(
      500,
      error instanceof Error ? error.message : "Map agent request failed.",
    );
  }
}
