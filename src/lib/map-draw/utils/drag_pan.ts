import type MapboxDraw from "@mapbox/mapbox-gl-draw";

const dragPan = {
  enable(ctx: MapboxDraw.DrawCustomModeThis & { _ctx?: { store: { getInitialConfigValue: (key: string) => boolean } } }) {
    setTimeout(() => {
      if (
        !ctx.map ||
        !ctx.map.dragPan ||
        !ctx._ctx ||
        !ctx._ctx.store ||
        !ctx._ctx.store.getInitialConfigValue
      ) {
        return;
      }
      if (!ctx._ctx.store.getInitialConfigValue("dragPan")) return;
      ctx.map.dragPan.enable();
    }, 0);
  },
  disable(ctx: MapboxDraw.DrawCustomModeThis) {
    setTimeout(() => {
      if (!ctx.map || !ctx.map.doubleClickZoom) return;
      ctx.map.dragPan.disable();
    }, 0);
  },
};

export default dragPan;
