import type { LngLat, MapCommand } from "@/lib/map-agent/types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isLngLat(value: unknown): value is LngLat {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isFiniteNumber(value[0]) &&
    isFiniteNumber(value[1])
  );
}

function isLngLatList(value: unknown, minLength: number): value is LngLat[] {
  return (
    Array.isArray(value) &&
    value.length >= minLength &&
    value.every((item) => isLngLat(item))
  );
}

export function isMapCommand(value: unknown): value is MapCommand {
  if (!value || typeof value !== "object") return false;

  const command = value as Partial<MapCommand>;
  switch (command.type) {
    case "draw_point":
      return isLngLat(command.coordinates);
    case "draw_line":
      return isLngLatList(command.coordinates, 2);
    case "draw_polygon":
      return (
        Array.isArray(command.coordinates) &&
        command.coordinates.length > 0 &&
        command.coordinates.every((ring) => isLngLatList(ring, 3))
      );
    case "draw_circle":
      return (
        isLngLat(command.center) &&
        isFiniteNumber(command.radiusMeters) &&
        command.radiusMeters > 0 &&
        (command.steps === undefined ||
          (Number.isInteger(command.steps) && command.steps >= 8))
      );
    case "fit_bounds":
      return (
        Array.isArray(command.bounds) &&
        command.bounds.length === 2 &&
        isLngLat(command.bounds[0]) &&
        isLngLat(command.bounds[1])
      );
    case "fly_to":
      return (
        isLngLat(command.center) &&
        (command.zoom === undefined || isFiniteNumber(command.zoom)) &&
        (command.bearing === undefined || isFiniteNumber(command.bearing)) &&
        (command.pitch === undefined || isFiniteNumber(command.pitch)) &&
        (command.duration === undefined || isFiniteNumber(command.duration))
      );
    case "clear":
      return true;
    default:
      return false;
  }
}

export function assertMapCommand(value: unknown): asserts value is MapCommand {
  if (!isMapCommand(value)) {
    throw new Error("Invalid map command payload.");
  }
}

export function parseMapCommand(value: unknown): MapCommand {
  assertMapCommand(value);
  return value;
}

export function parseMapCommands(value: unknown): MapCommand[] {
  if (!Array.isArray(value)) {
    throw new Error("Map commands payload must be an array.");
  }

  return value.map(parseMapCommand);
}
