import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import CircleModeImpl from "./modes/CircleMode";
import DirectModeOverrideImpl from "./modes/DirectModeOverride";
import RectangleModeImpl from "./modes/RectangleMode";
import SimpleSelectModeOverrideImpl from "./modes/SimpleSelectModeOverride";

export const CircleMode =
  CircleModeImpl as unknown as MapboxDraw.DrawCustomMode;

export const RectangleMode =
  RectangleModeImpl as unknown as MapboxDraw.DrawCustomMode;

export const DirectModeOverride =
  DirectModeOverrideImpl as unknown as MapboxDraw.DrawCustomMode;

export const SimpleSelectModeOverride =
  SimpleSelectModeOverrideImpl as unknown as MapboxDraw.DrawCustomMode;


