"use client";

import { MapAgent, Map as MapComponent } from "@/registry/map";

export function MapAgentExample() {
  return (
    <div className="h-[500px] w-full overflow-hidden rounded-xl border">
      <MapComponent>
        <MapAgent
          provider="openai"
          endpoint="http://localhost:3000/api/map-agent"
          model="deepseek-chat"
          baseUrl="https://api.deepseek.com"
          token={process.env.DEEPSEEK_API_KEY ?? ""}
          // defaultPrompt="Fly to downtown Shanghai with a city-level zoom."
          placeholder="Try: Fly to New York with a scenic city view"
        />
      </MapComponent>
    </div>
  );
}
