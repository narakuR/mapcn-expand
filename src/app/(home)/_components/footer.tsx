import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="w-full py-5 border-t">
      <div className="w-full container flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">mapcn-draw</span>
          <span className="text-muted-foreground/80">•</span>
          <span>
            Built by
            <Button variant="link" size="sm" className="px-1" asChild>
              <Link
                href="https://github.com/narakuR"
                target="_blank"
                rel="noopener noreferrer"
              >
                narakuR
              </Link>
            </Button>
          </span>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/docs">Documentation</Link>
          </Button>

          <Button variant="ghost" size="sm" asChild>
            <Link
              href="https://github.com/narakuR/mapcn-draw"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
