import type MapboxDraw from "@mapbox/mapbox-gl-draw";

type LngLatTuple = [number, number];

type RectangleModeState = {
  rectangle: MapboxDraw.DrawPolygon;
  startPoint?: LngLatTuple;
  endPoint?: LngLatTuple;
};

type DrawContext = MapboxDraw.DrawCustomModeThis & {
  _ctx?: {
    store?: {
      getInitialConfigValue?: (name: string) => boolean;
    };
  };
};

const doubleClickZoom = {
  enable: (ctx: DrawContext) => {
    setTimeout(() => {
      // First check we've got a map and some context.
      if (
        !ctx.map ||
        !ctx.map.doubleClickZoom ||
        !ctx._ctx ||
        !ctx._ctx.store ||
        !ctx._ctx.store.getInitialConfigValue
      ) {
        return;
      }
      // Now check initial state wasn't false (we leave it disabled if so)
      if (!ctx._ctx.store.getInitialConfigValue("doubleClickZoom")) return;
      ctx.map.doubleClickZoom.enable();
    }, 0);
  },
  disable: (ctx: DrawContext) => {
    setTimeout(() => {
      if (!ctx.map || !ctx.map.doubleClickZoom) return;
      // Always disable here, as it's necessary in some cases.
      ctx.map.doubleClickZoom.disable();
    }, 0);
  },
};

const DrawRectangle: MapboxDraw.DrawCustomMode<RectangleModeState> = {
  onSetup: function (_opts) {
    const feature = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [[]],
      },
    });

    if (feature.type !== "Polygon") {
      throw new Error("Rectangle mode expects a polygon feature");
    }

    const rectangle = feature as MapboxDraw.DrawPolygon;
    this.addFeature(rectangle);
    this.clearSelectedFeatures();
    doubleClickZoom.disable(this as DrawContext);
    this.updateUIClasses({ mouse: "add" });
    this.setActionableState({
      trash: true,
      combineFeatures: false,
      uncombineFeatures: false,
    });
    return {
      rectangle,
    };
  },
  // support mobile taps
  onTap: function (state, e) {
    // emulate 'move mouse' to update feature coords
    if (state.startPoint) this.onMouseMove?.(state, e as unknown as MapboxDraw.MapMouseEvent);
    // emulate onClick
    this.onClick?.(state, e as unknown as MapboxDraw.MapMouseEvent);
  },
  // Whenever a user clicks on the map, Draw will call `onClick`
  onClick: function (state, e) {
    // if state.startPoint exist, means its second click
    // change to simple_select mode
    if (
      state.startPoint &&
      state.startPoint[0] !== e.lngLat.lng &&
      state.startPoint[1] !== e.lngLat.lat
    ) {
      this.updateUIClasses({ mouse: "pointer" });
      state.endPoint = [e.lngLat.lng, e.lngLat.lat];
      this.changeMode("simple_select", { featureIds: [String(state.rectangle.id)] });
    }
    // on first click, save clicked point coords as starting for rectangle
    state.startPoint = [e.lngLat.lng, e.lngLat.lat];
  },
  onMouseMove: (state, e) => {
    // if startPoint, update the feature coordinates, using the bounding box concept
    // we are simply using the startingPoint coordinates and the current mouse position
    // coordinates to calculate the bounding box on the fly, which will be our rectangle
    if (state.startPoint) {
      state.rectangle.updateCoordinate(
        "0.0",
        state.startPoint[0],
        state.startPoint[1],
      ); // minX, minY - the starting point
      state.rectangle.updateCoordinate(
        "0.1",
        e.lngLat.lng,
        state.startPoint[1],
      ); // maxX, minY
      state.rectangle.updateCoordinate("0.2", e.lngLat.lng, e.lngLat.lat); // maxX, maxY
      state.rectangle.updateCoordinate(
        "0.3",
        state.startPoint[0],
        e.lngLat.lat,
      ); // minX,maxY
      state.rectangle.updateCoordinate(
        "0.4",
        state.startPoint[0],
        state.startPoint[1],
      ); // minX,minY - ending point (equals to starting point)
    }
  },
  // Whenever a user clicks on a key while focused on the map, it will be sent here
  onKeyUp: function (_state, e) {
    if (e.key === "Escape") this.changeMode("simple_select");
  },
  onStop: function (state) {
    doubleClickZoom.enable(this as DrawContext);
    this.updateUIClasses({ mouse: "none" });
    this.activateUIButton();

    // check to see if we've deleted this feature
    if (this.getFeature(String(state.rectangle.id)) === undefined) return;

    // remove last added coordinate
    state.rectangle.removeCoordinate("0.4");
    if (state.rectangle.isValid()) {
      this.map.fire("draw.create", {
        features: [state.rectangle.toGeoJSON()],
      });
    } else {
      this.deleteFeature(String(state.rectangle.id), { silent: true });
      this.changeMode("simple_select", {}, { silent: true });
    }
  },
  toDisplayFeatures: (state, geojson, display) => {
    const feature = geojson as GeoJSON.Feature<GeoJSON.Geometry, { id?: string; active?: string }>;
    if (!feature.properties) feature.properties = {};
    const isActivePolygon = feature.properties.id === String(state.rectangle.id);
    feature.properties.active = isActivePolygon ? "true" : "false";
    if (!isActivePolygon) return display(feature);

    // Only render the rectangular polygon if it has the starting point
    if (!state.startPoint) return;
    return display(feature);
  },
  onTrash: function (state) {
    this.deleteFeature(String(state.rectangle.id), { silent: true });
    this.changeMode("simple_select");
  },
};

export default DrawRectangle;
