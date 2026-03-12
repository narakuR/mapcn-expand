import { MapPin } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-1.5 w-fit", className)}>
      <MapPin className="size-4 shrink-0" />
      <span className="font-semibold text-lg tracking-tight">mapcn-draw</span>
    </Link>
  );
}
