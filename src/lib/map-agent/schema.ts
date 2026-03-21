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

export function isMapCommand(value: unknown): value is MapCommand {
  if (!value || typeof value !== "object") return false;

  const command = value as Partial<MapCommand>;
  switch (command.type) {
    case "fly_to":
      return (
        isLngLat(command.center) &&
        (command.zoom === undefined || isFiniteNumber(command.zoom)) &&
        (command.bearing === undefined || isFiniteNumber(command.bearing)) &&
        (command.pitch === undefined || isFiniteNumber(command.pitch)) &&
        (command.duration === undefined || isFiniteNumber(command.duration))
      );
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
