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
    defaults: {
      model: DEFAULT_OPENAI_MODEL,
    },
    env: {
      model: ["OPENAI_MAP_AGENT_MODEL", "OPENAI_MODEL"],
      baseUrl: ["OPENAI_MAP_AGENT_BASE_URL", "OPENAI_BASE_URL"],
      token: ["OPENAI_MAP_AGENT_TOKEN", "OPENAI_API_KEY"],
    },
  },
  anthropic: {
    name: "Anthropic",
    defaults: {
      model: DEFAULT_ANTHROPIC_MODEL,
    },
    env: {
      model: ["ANTHROPIC_MAP_AGENT_MODEL", "ANTHROPIC_MODEL"],
      baseUrl: ["ANTHROPIC_MAP_AGENT_BASE_URL", "ANTHROPIC_BASE_URL"],
      token: ["ANTHROPIC_MAP_AGENT_TOKEN", "ANTHROPIC_API_KEY"],
    },
  },
} as const satisfies Record<
  Provider,
  {
    name: string;
    defaults: {
      model: string;
    };
    env: {
      model: readonly string[];
      baseUrl: readonly string[];
      token: readonly string[];
    };
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
    readFirstEnv(PROVIDER_CONFIG[provider].env.model) ||
    PROVIDER_CONFIG[provider].defaults.model
  );
}

function resolveBaseUrl(provider: Provider, baseUrlOverride?: string) {
  return (
    baseUrlOverride ||
    readFirstEnv(PROVIDER_CONFIG[provider].env.baseUrl) ||
    undefined
  );
}

function resolveToken(provider: Provider) {
  return readFirstEnv(PROVIDER_CONFIG[provider].env.token) || undefined;
}

function createBaseModel({
  provider,
  model,
  baseUrl,
}: {
  provider: Provider;
  model: string;
  baseUrl?: string | undefined;
}) {
  const resolvedToken = resolveToken(provider);
  if (!resolvedToken) {
    throw new Error(
      `Missing ${PROVIDER_CONFIG[provider].name} token. Provide token or set ${PROVIDER_CONFIG[provider].env.token.join(" / ")}.`,
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
}: {
  provider: Provider;
  model: string;
  baseUrl?: string | undefined;
}) {
  const llm = createBaseModel({
    provider,
    model,
    baseUrl,
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
    } = requestSchema.parse(json);

    const resolvedModel = resolveModel(provider);
    const resolvedBaseUrl = resolveBaseUrl(provider) ?? null;

    const agent = createMapAgent({
      provider,
      model: resolvedModel,
      baseUrl: resolvedBaseUrl ?? undefined,
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
