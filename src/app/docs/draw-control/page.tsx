import {
  DocsLayout,
  DocsSection,
  DocsCode,
  DocsNote,
  DocsPropTable,
} from "../_components/docs";
import { ComponentPreview } from "../_components/component-preview";
import { DrawControlExample } from "../_components/examples/draw-control-example";
import { getExampleSource } from "@/lib/get-example-source";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draw Control",
};

export default function DrawControlPage() {
  const drawControlSource = getExampleSource("draw-control-example.tsx");

  return (
    <DocsLayout
      title="Draw Control"
      description="Enable interactive shape drawing with point, line, polygon, rectangle, and circle modes."
      prev={{ title: "Controls", href: "/docs/controls" }}
      next={{ title: "Markers", href: "/docs/markers" }}
      toc={[
        { title: "Quick Start", slug: "quick-start" },
        { title: "Supported Modes", slug: "supported-modes" },
        { title: "Draw Events", slug: "draw-events" },
        { title: "MapControls Draw Props", slug: "mapcontrols-draw-props" },
        { title: "Complete Example", slug: "complete-example" },
        { title: "Practical Notes", slug: "practical-notes" },
      ]}
    >
      <DocsSection title="Quick Start">
        <p>
          Draw tools are built into <DocsCode>MapControls</DocsCode>. Enable
          them with <DocsCode>showDraw</DocsCode> and handle draw lifecycle
          events with <DocsCode>onDraw</DocsCode>.
        </p>
        <p>
          The callback runs for <DocsCode>draw.create</DocsCode>,{" "}
          <DocsCode>draw.update</DocsCode>, and <DocsCode>draw.delete</DocsCode>
          .
        </p>
      </DocsSection>

      <DocsSection title="Supported Modes">
        <p>
          The Draw control group exposes mode buttons that switch Mapbox Draw
          modes internally.
        </p>
        <ul>
          <li>
            <DocsCode>draw_point</DocsCode>: place a draggable point.
          </li>
          <li>
            <DocsCode>draw_polygon</DocsCode>: draw a free polygon.
          </li>
          <li>
            <DocsCode>draw_rectangle</DocsCode>: draw an axis-aligned rectangle.
          </li>
          <li>
            <DocsCode>draw_circle</DocsCode>: draw a circle from center/radius.
          </li>
          <li>
            <DocsCode>draw_line_string</DocsCode>: draw a polyline.
          </li>
          <li>
            Delete button: removes currently selected features only.
          </li>
        </ul>
      </DocsSection>

      <DocsSection title="Draw Events">
        <p>
          <DocsCode>onDraw</DocsCode> receives a Mapbox Draw event payload, so
          you can inspect event type and changed features.
        </p>
        <DocsNote>
          Handle draw events by <DocsCode>event.type</DocsCode> instead of
          assuming every payload is a creation. Updates and deletions are also
          emitted through the same callback.
        </DocsNote>
      </DocsSection>

      <DocsSection title="MapControls Draw Props">
        <DocsPropTable
          props={[
            {
              name: "showDraw",
              type: "boolean",
              default: "false",
              description:
                "Show draw controls (point, polygon, rectangle, circle, line, delete).",
            },
            {
              name: "onDraw",
              type: "(e: MapboxDraw.DrawEvent) => void",
              description:
                "Fires on draw.create, draw.update, and draw.delete with event payload.",
            },
          ]}
        />
      </DocsSection>

      <DocsSection title="Complete Example">
        <p>
          This example keeps the canvas clean: draw controls are enabled and the
          map directly shows the shapes you create.
        </p>
        <ComponentPreview code={drawControlSource}>
          <DrawControlExample />
        </ComponentPreview>
      </DocsSection>

      <DocsSection title="Practical Notes">
        <ul>
          <li>
            Deleting requires selecting one or more features first, then
            pressing the delete button.
          </li>
          <li>
            Cursor behavior changes by mode: draw modes use crosshair; selected
            features switch to move cursor.
          </li>
          <li>
            Draw data from the event is useful for quick sync. For persistent
            app state, normalize and store features in your own model layer.
          </li>
        </ul>
      </DocsSection>
    </DocsLayout>
  );
}
