import type {
  MapAgentRuntime,
  MapCommand,
  MapCommandExecutionResult,
} from "@/lib/map-agent/types";

export function executeMapCommand(
  runtime: MapAgentRuntime,
  command: MapCommand,
): MapCommandExecutionResult {
  switch (command.type) {
    case "fly_to":
      runtime.map.flyTo({
        ...command,
        center: command.center,
        zoom: command.zoom,
        duration: command.duration ?? 1200,

      });
      return {
        type: "viewport",
        commandType: command.type,
      };
  }
}
