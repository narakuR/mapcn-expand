import {
  createCircleFeature,
  createLineFeature,
  createPointFeature,
  createPolygonFeature,
} from "@/lib/map-agent/geojson";
import type {
  MapAgentRuntime,
  MapCommand,
  MapCommandExecutionResult,
} from "@/lib/map-agent/types";

type FeatureCommandType = Extract<
  MapCommand["type"],
  "draw_point" | "draw_line" | "draw_polygon" | "draw_circle"
>;

function requireDraw(runtime: MapAgentRuntime) {
  if (!runtime.draw) {
    throw new Error("Map command requires a draw instance, but none was provided.");
  }

  return runtime.draw;
}

function addFeature(
  runtime: MapAgentRuntime,
  feature: GeoJSON.Feature,
  commandType: FeatureCommandType,
) {
  const draw = requireDraw(runtime);
  draw.add(feature);

  return {
    type: "feature" as const,
    commandType,
    feature,
  };
}

export async function executeMapCommand(
  runtime: MapAgentRuntime,
  command: MapCommand,
): Promise<MapCommandExecutionResult> {
  switch (command.type) {
    case "draw_point":
      return addFeature(
        runtime,
        createPointFeature(command.coordinates, command.properties, command.id),
        command.type,
      );

    case "draw_line":
      return addFeature(
        runtime,
        createLineFeature(command.coordinates, command.properties, command.id),
        command.type,
      );

    case "draw_polygon":
      return addFeature(
        runtime,
        createPolygonFeature(command.coordinates, command.properties, command.id),
        command.type,
      );

    case "draw_circle":
      return addFeature(
        runtime,
        createCircleFeature(
          command.center,
          command.radiusMeters,
          command.steps,
          command.properties,
          command.id,
        ),
        command.type,
      );

    case "fit_bounds":
      runtime.map.fitBounds(command.bounds, {
        padding: command.padding ?? 40,
        maxZoom: command.maxZoom,
        duration: command.duration ?? 800,
      });
      return {
        type: "viewport",
        commandType: command.type,
      };

    case "fly_to":
      runtime.map.flyTo({
        center: command.center,
        zoom: command.zoom,
        bearing: command.bearing,
        pitch: command.pitch,
        duration: command.duration ?? 1200,
      });
      return {
        type: "viewport",
        commandType: command.type,
      };

    case "clear": {
      const deletedCount = runtime.draw?.getAll().features.length ?? 0;
      runtime.draw?.deleteAll();

      return {
        type: "clear",
        commandType: command.type,
        deletedCount,
      };
    }
  }
}

export async function executeMapCommands(
  runtime: MapAgentRuntime,
  commands: MapCommand[],
): Promise<MapCommandExecutionResult[]> {
  const results: MapCommandExecutionResult[] = [];

  for (const command of commands) {
    results.push(await executeMapCommand(runtime, command));
  }

  return results;
}

export function exportMapDrawState(runtime: MapAgentRuntime) {
  return runtime.draw?.getAll() ?? null;
}
