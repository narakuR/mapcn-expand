import {
  BookOpen,
  Bot,
  Braces,
  Code,
  Layers,
  type LucideIcon,
  MapIcon,
  MapPin,
  MessageSquare,
  Pencil,
  Route,
  Settings,
  Wrench,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const docsNavigation: NavGroup[] = [
  {
    title: "Basics",
    items: [
      { title: "Getting Started", href: "/docs", icon: BookOpen },
      { title: "Installation", href: "/docs/installation", icon: Code },
      { title: "API Reference", href: "/docs/api-reference", icon: Braces },
    ],
  },
  {
    title: "Components",
    items: [
      { title: "Map", href: "/docs/basic-map", icon: MapIcon },
      { title: "Controls", href: "/docs/controls", icon: Settings },
      { title: "Draw Control", href: "/docs/draw-control", icon: Pencil },
      { title: "Markers", href: "/docs/markers", icon: MapPin },
      { title: "Popups", href: "/docs/popups", icon: MessageSquare },
      { title: "Routes", href: "/docs/routes", icon: Route },
      { title: "Clusters", href: "/docs/clusters", icon: Layers },
      { title: "Agent", href: "/docs/agent", icon: Bot },
      { title: "Advanced", href: "/docs/advanced-usage", icon: Wrench },
    ],
  },
];
