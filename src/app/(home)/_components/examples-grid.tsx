import { FlyToExample } from "./examples/flyto-example";
import {
  AgentExample,
  AnalyticsExample,
  DeliveryExample,
  DrawExample,
  EVChargingExample,
  TrailExample,
  TrendingExample,
} from "./examples/index";

export function ExamplesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in delay-400">
      <AnalyticsExample />
      <TrailExample />
      <FlyToExample />
      <EVChargingExample />
      <TrendingExample />
      <DeliveryExample />
      <DrawExample />
      <AgentExample />
    </div>
  );
}
